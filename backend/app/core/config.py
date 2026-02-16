from pathlib import Path

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseModel):
    """
    应用基础配置
    """

    name: str = Field(default="LoofCloud", description="应用名称")
    env: str = Field(default="development", description="运行环境")
    debug: bool = Field(default=True, description="调试模式")
    secret_key: str = Field(default="change-me", description="密钥")
    api_v1_prefix: str = Field(default="/api/v1", description="API v1 前缀")
    timezone: str = Field(default="Asia/Shanghai", description="项目时区")

    @property
    def is_production(self) -> bool:
        return self.env == "production"


class MongoDBConfig(BaseModel):
    """
    MongoDB 配置
    """

    url: str = Field(default="mongodb://localhost:27017", description="连接 URL")
    db_name: str = Field(default="loofcloud", description="数据库名")


class RedisConfig(BaseModel):
    """
    Redis 配置
    """

    url: str = Field(default="redis://localhost:6379/0", description="连接 URL")


class AuthConfig(BaseModel):
    """
    认证配置
    """

    access_token_expire_minutes: int = Field(
        default=30, description="访问令牌过期分钟数"
    )
    refresh_token_expire_days: int = Field(default=7, description="刷新令牌过期天数")


class LogConfig(BaseModel):
    """
    日志配置
    """

    level: str = Field(default="INFO", description="日志级别")
    log_dir: Path = Field(default=Path("logs"), description="日志目录")
    max_file_size: int = Field(default=5, description="单个日志文件最大大小（MB）")
    backup_count: int = Field(default=5, description="日志文件保留数量")
    console_format: str = Field(
        default="%(leveltext)s %(message)s", description="控制台格式"
    )
    file_format: str = Field(
        default="【%(levelname)s】%(asctime)s - %(message)s", description="文件格式"
    )
    async_queue_size: int = Field(default=1000, description="异步写入队列大小")
    async_workers: int = Field(default=2, description="异步写入线程数")
    batch_size: int = Field(default=50, description="批量写入条数")
    write_timeout: float = Field(default=3.0, description="批量写入超时（秒）")


class _EnvSettings(BaseSettings):
    """
    从 .env 文件加载扁平环境变量
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "LoofCloud"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me"
    API_V1_PREFIX: str = "/api/v1"
    APP_TIMEZONE: str = "Asia/Shanghai"

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "loofcloud"

    REDIS_URL: str = "redis://localhost:6379/0"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    LOG_LEVEL: str = "INFO"
    LOG_DIR: str = "logs"
    LOG_MAX_FILE_SIZE: int = 5
    LOG_BACKUP_COUNT: int = 5


class ConfigManager:
    """
    配置管理器
    """

    __slots__ = ("app", "mongodb", "redis", "auth", "log", "_runtime_secret_key")

    def __init__(self) -> None:
        env = _EnvSettings()

        self.app = AppConfig(
            name=env.APP_NAME,
            env=env.APP_ENV,
            debug=env.DEBUG,
            secret_key=env.SECRET_KEY,
            api_v1_prefix=env.API_V1_PREFIX,
            timezone=env.APP_TIMEZONE,
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
        self._runtime_secret_key: str | None = None

    def get_secret_key(self) -> str:
        """
        返回当前使用的 SECRET_KEY（优先运行时从数据库加载的密钥）。

        :return: 当前 SECRET_KEY 字符串
        """
        return self._runtime_secret_key or self.app.secret_key

    def set_secret_key(self, key: str) -> None:
        """
        设置运行时 SECRET_KEY（由启动流程在从数据库加载或生成后调用）。

        :param key: 密钥字符串
        :return: None
        """
        self._runtime_secret_key = key


cfg = ConfigManager()
