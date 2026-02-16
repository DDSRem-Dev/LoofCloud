import asyncio
import logging
import queue
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from contextvars import ContextVar
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Dict, Final

import click

from app.core.config import cfg

# 请求 ID 上下文变量，用于链路追踪
REQUEST_ID_CTX_VAR: Final[ContextVar[str]] = ContextVar("request_id", default="N/A")

# 日志级别颜色映射
LEVEL_COLORS = {
    logging.DEBUG: lambda text: click.style(str(text), fg="cyan"),
    logging.INFO: lambda text: click.style(str(text), fg="green"),
    logging.WARNING: lambda text: click.style(str(text), fg="yellow"),
    logging.ERROR: lambda text: click.style(str(text), fg="red"),
    logging.CRITICAL: lambda text: click.style(str(text), fg="bright_red"),
}


class ColorFormatter(logging.Formatter):
    """彩色控制台日志格式化器"""

    def format(self, record):
        separator = " " * (8 - len(record.levelname))
        color_fn = LEVEL_COLORS.get(record.levelno, str)
        record.leveltext = color_fn(record.levelname + ":") + separator
        return super().format(record)


class LogEntry:
    """日志条目"""

    __slots__ = ("level", "message", "file_path", "timestamp", "kwargs")

    def __init__(
        self,
        level: str,
        message: str,
        file_path: Path,
        timestamp: datetime | None = None,
        **kwargs,
    ):
        self.level = level
        self.message = message
        self.file_path = file_path
        self.timestamp = timestamp or datetime.now()
        self.kwargs = kwargs


class NonBlockingFileHandler:
    """非阻塞文件处理器 - RotatingFileHandler + 批量异步写入"""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized"):
            return
        self._initialized = True
        self._write_queue: queue.Queue[LogEntry] = queue.Queue(
            maxsize=cfg.log.async_queue_size
        )
        self._executor = ThreadPoolExecutor(
            max_workers=cfg.log.async_workers, thread_name_prefix="LogWriter"
        )
        self._rotating_handlers: Dict[Path, RotatingFileHandler] = {}
        self._running = True
        self._write_thread = threading.Thread(target=self._batch_writer, daemon=True)
        self._write_thread.start()

    def _get_rotating_handler(self, file_path: Path) -> RotatingFileHandler:
        """获取或创建 RotatingFileHandler 实例"""
        if file_path not in self._rotating_handlers:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            handler = RotatingFileHandler(
                filename=str(file_path),
                maxBytes=cfg.log.max_file_size * 1024 * 1024,
                backupCount=cfg.log.backup_count,
                encoding="utf-8",
            )
            handler.setFormatter(logging.Formatter(cfg.log.file_format))
            self._rotating_handlers[file_path] = handler
        return self._rotating_handlers[file_path]

    @staticmethod
    def _create_log_record(entry: LogEntry) -> logging.LogRecord:
        """根据 LogEntry 创建 LogRecord"""
        record_kwargs = dict(entry.kwargs)
        extra_data = record_kwargs.pop("extra", None)
        exc_info_value = record_kwargs.pop("exc_info", None)
        if exc_info_value is True:
            exc_info_value = sys.exc_info()

        record = logging.LogRecord(
            name="",
            level=getattr(logging, entry.level.upper(), logging.INFO),
            pathname="",
            lineno=0,
            msg=entry.message,
            args=(),
            exc_info=exc_info_value,
        )
        if extra_data and isinstance(extra_data, dict):
            for key, value in extra_data.items():
                if key not in record.__dict__:
                    setattr(record, key, value)
        return record

    def write_log(self, level: str, message: str, file_path: Path, **kwargs):
        """写入日志 - 自动检测协程环境选择写入方式"""
        entry = LogEntry(level=level, message=message, file_path=file_path, **kwargs)
        if self._is_in_event_loop():
            self._write_non_blocking(entry)
        else:
            self._write_sync(entry)

    @staticmethod
    def _is_in_event_loop() -> bool:
        """检测当前是否在事件循环中"""
        try:
            return asyncio.get_running_loop() is not None
        except RuntimeError:
            return False

    def _write_non_blocking(self, entry: LogEntry):
        """非阻塞写入（协程环境）"""
        try:
            self._write_queue.put_nowait(entry)
        except queue.Full:
            # 队列满时回退到线程池同步写入
            self._executor.submit(self._write_sync, entry)

    def _write_sync(self, entry: LogEntry):
        """同步写入单条日志"""
        try:
            handler = self._get_rotating_handler(entry.file_path)
            record = self._create_log_record(entry)
            handler.emit(record)
        except Exception as e:
            print(f"日志写入失败 {entry.file_path}: {e}")

    def _batch_writer(self):
        """后台批量写入线程"""
        while self._running:
            try:
                batch: list[LogEntry] = []
                end_time = time.time() + cfg.log.write_timeout

                while len(batch) < cfg.log.batch_size and time.time() < end_time:
                    try:
                        remaining = max(0.01, end_time - time.time())
                        entry = self._write_queue.get(timeout=remaining)
                        batch.append(entry)
                    except queue.Empty:
                        break

                if batch:
                    self._write_batch(batch)
            except Exception as e:
                print(f"批量写入线程错误: {e}")
                time.sleep(0.1)

    def _write_batch(self, batch: list[LogEntry]):
        """按文件分组批量写入"""
        file_groups: Dict[Path, list[LogEntry]] = {}
        for entry in batch:
            file_groups.setdefault(entry.file_path, []).append(entry)

        for file_path, entries in file_groups.items():
            try:
                handler = self._get_rotating_handler(file_path)
                for entry in entries:
                    record = self._create_log_record(entry)
                    handler.emit(record)
            except Exception as e:
                print(f"批量写入失败 {file_path}: {e}")
                for entry in entries:
                    self._write_sync(entry)

    def shutdown(self):
        """关闭文件处理器，清理资源"""
        self._running = False
        if hasattr(self, "_write_thread"):
            self._write_thread.join(timeout=5)
        if self._executor:
            self._executor.shutdown(wait=True)
        for handler in self._rotating_handlers.values():
            handler.close()
        self._rotating_handlers.clear()


class LoggerManager:
    """日志管理器 - 统一日志入口

    特性：
    - 彩色控制台输出
    - 非阻塞异步文件写入（RotatingFileHandler 自动滚动）
    - 请求 ID 链路追踪
    - 自动识别调用者模块
    """

    _loggers: Dict[str, logging.Logger] = {}
    _default_log_file = "app.log"
    _lock = threading.Lock()
    _file_handler = NonBlockingFileHandler()

    @staticmethod
    def _get_caller_name() -> str:
        """获取调用者模块名"""
        try:
            frame = sys._getframe(3)
            filepath = Path(frame.f_code.co_filename)
            name = filepath.stem
            if name == "__init__" and len(filepath.parts) >= 2:
                name = filepath.parts[-2]
            return name
        except (AttributeError, ValueError):
            return "unknown"

    def _get_or_create_console_logger(self, name: str) -> logging.Logger:
        """获取或创建控制台日志实例"""
        if name in self._loggers:
            return self._loggers[name]

        with self._lock:
            if name in self._loggers:
                return self._loggers[name]

            _logger = logging.getLogger(f"loofcloud.{name}")
            _logger.setLevel(self._get_log_level())
            _logger.handlers.clear()

            console = logging.StreamHandler()
            console.setFormatter(ColorFormatter(cfg.log.console_format))
            _logger.addHandler(console)
            _logger.propagate = False

            self._loggers[name] = _logger
            return _logger

    @staticmethod
    def _get_log_level() -> int:
        """获取当前日志级别"""
        if cfg.app.debug:
            return logging.DEBUG
        return getattr(logging, cfg.log.level.upper(), logging.INFO)

    def _log(self, method: str, msg: str, *args, **kwargs):
        """核心日志方法"""
        method_level = getattr(logging, method.upper(), logging.INFO)
        if method_level < self._get_log_level():
            return

        caller_name = self._get_caller_name()
        request_id = REQUEST_ID_CTX_VAR.get()

        # 格式化消息
        if args:
            try:
                message = msg % args
            except (TypeError, ValueError):
                message = f"{msg} {' '.join(str(a) for a in args)}"
        else:
            message = msg

        formatted = f"[{request_id}] {caller_name} - {message}"

        # 异步文件写入
        log_file = cfg.log.log_dir / self._default_log_file
        self._file_handler.write_log(method.upper(), formatted, log_file, **kwargs)

        # 控制台输出
        _logger = self._get_or_create_console_logger(caller_name)
        if hasattr(_logger, method):
            getattr(_logger, method)(formatted, **kwargs)

    def info(self, msg: str, *args, **kwargs):
        """信息级别"""
        self._log("info", msg, *args, **kwargs)

    def debug(self, msg: str, *args, **kwargs):
        """调试级别"""
        self._log("debug", msg, *args, **kwargs)

    def warning(self, msg: str, *args, **kwargs):
        """警告级别"""
        self._log("warning", msg, *args, **kwargs)

    def warn(self, msg: str, *args, **kwargs):
        """警告级别（兼容别名）"""
        self.warning(msg, *args, **kwargs)

    def error(self, msg: str, *args, **kwargs):
        """错误级别"""
        self._log("error", msg, *args, **kwargs)

    def critical(self, msg: str, *args, **kwargs):
        """严重错误级别"""
        self._log("critical", msg, *args, **kwargs)

    @classmethod
    def shutdown(cls):
        """关闭日志管理器，清理资源"""
        if cls._file_handler:
            cls._file_handler.shutdown()


# 全局日志实例
logger = LoggerManager()
