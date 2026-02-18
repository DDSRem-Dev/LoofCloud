import signal
import subprocess
import sys
from multiprocessing import cpu_count
from pathlib import Path
from typing import Any, Dict

from uvicorn import Config, Server as UvicornServer

from app.core.config import cfg
from app.startup.app import create_app

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


def run_reload() -> None:
    """
    debug 模式下用 uvicorn CLI 启动
    """
    try:
        subprocess.run(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.startup.app:app",
                "--reload",
                "--host",
                "0.0.0.0",
                "--port",
                "8999",
                "--reload-dir",
                str(_BACKEND_DIR),
            ],
            cwd=_BACKEND_DIR,
        )
    except KeyboardInterrupt:
        sys.exit(0)


def create_server() -> UvicornServer:
    """
    创建 Uvicorn 服务实例
    """
    config_kwargs: Dict[str, Any] = {
        "host": "0.0.0.0",
        "port": 8999,
        "reload": cfg.app.debug,
        "timeout_graceful_shutdown": 60,
    }
    if not cfg.app.debug:
        config_kwargs["workers"] = cpu_count() * 2 + 1
    if cfg.app.debug:
        config_kwargs["reload_dirs"] = [str(_BACKEND_DIR)]
        return UvicornServer(Config("app.startup.app:app", **config_kwargs))
    return UvicornServer(Config(create_app(), **config_kwargs))


def setup_signal_handlers(server: UvicornServer) -> None:
    """
    设置信号处理，用于优雅停止服务
    """

    def signal_handler(signum: int, _) -> None:
        print(f"收到信号 {signum}，停止服务...")
        server.should_exit = True

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
