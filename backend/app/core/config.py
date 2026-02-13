"""配置管理器 - 统一配置访问入口

所有模块通过 `from app.core.config import cfg` 获取配置，
按业务域分组访问：cfg.app / cfg.mongodb / cfg.redis / cfg.auth / cfg.log
"""

from pathlib import Path

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


# ============================================================
# 分组配置模型
# ============================================================

class AppConfig(BaseModel):
    """应用基础配置"""
    name: str = "LoofCloud"
    env: str = "development"
    debug: bool = True
    secret_key: str = "change-me"
    api_v1_prefix: str = "/api/v1"

    @property
    def is_production(self) -> bool:
        return self.env == "production"


class MongoDBConfig(BaseModel):
    """MongoDB 配置"""
    url: str = "mongodb://localhost:27017"
    db_name: str = "loofcloud"


class RedisConfig(BaseModel):
    """Redis 配置"""
    url: str = "redis://localhost:6379/0"


class AuthConfig(BaseModel):
    """认证配置"""
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


class LogConfig(BaseModel):
    """日志配置"""
    level: str = "INFO"
    log_dir: Path = Path("logs")
    max_file_size: int = 5          # 单个日志文件最大大小（MB）
    backup_count: int = 5           # 日志文件保留数量
    console_format: str = "%(leveltext)s %(message)s"
    file_format: str = "【%(levelname)s】%(asctime)s - %(message)s"
    async_queue_size: int = 1000    # 异步写入队列大小
    async_workers: int = 2          # 异步写入线程数
    batch_size: int = 50            # 批量写入条数
    write_timeout: float = 3.0      # 批量写入超时（秒）


# ============================================================
# 环境变量加载（内部使用，外部不直接访问）
# ============================================================

class _EnvSettings(BaseSettings):
    """从 .env 文件加载扁平环境变量"""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "LoofCloud"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me"
    API_V1_PREFIX: str = "/api/v1"

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "loofcloud"

    REDIS_URL: str = "redis://localhost:6379/0"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    LOG_LEVEL: str = "INFO"
    LOG_DIR: str = "logs"
    LOG_MAX_FILE_SIZE: int = 5
    LOG_BACKUP_COUNT: int = 5


# ============================================================
# 配置管理器
# ============================================================

class ConfigManager:
    """配置管理器：加载环境变量并按业务域分组暴露配置"""

    __slots__ = ("app", "mongodb", "redis", "auth", "log")

    def __init__(self) -> None:
        env = _EnvSettings()

        self.app = AppConfig(
            name=env.APP_NAME,
            env=env.APP_ENV,
            debug=env.DEBUG,
            secret_key=env.SECRET_KEY,
            api_v1_prefix=env.API_V1_PREFIX,
        )
        self.mongodb = MongoDBConfig(
            url=env.MONGODB_URL,
            db_name=env.MONGODB_DB_NAME,
        )
        self.redis = RedisConfig(
            url=env.REDIS_URL,
        )
        self.auth = AuthConfig(
            access_token_expire_minutes=env.ACCESS_TOKEN_EXPIRE_MINUTES,
            refresh_token_expire_days=env.REFRESH_TOKEN_EXPIRE_DAYS,
        )
        self.log = LogConfig(
            level=env.LOG_LEVEL,
            log_dir=Path(env.LOG_DIR),
            max_file_size=env.LOG_MAX_FILE_SIZE,
            backup_count=env.LOG_BACKUP_COUNT,
        )


# 全局单例，所有模块统一使用此实例
cfg = ConfigManager()
