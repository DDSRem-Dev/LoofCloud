from typing import Literal, Optional

from pydantic import BaseModel, Field


class BaseConfigSchema(BaseModel):
    """
    基础配置
    """

    strm_base_url: str | None = Field(default=None, description="STRM 文件基础地址")
    user_rmt_mediaext: list[str] = Field(
        default_factory=lambda: [
            "mp4",
            "mkv",
            "ts",
            "iso",
            "rmvb",
            "avi",
            "mov",
            "mpeg",
            "mpg",
            "wmv",
            "3gp",
            "asf",
            "m4v",
            "flv",
            "m2ts",
            "tp",
            "f4v",
        ],
        min_length=1,
        description="可整理媒体文件扩展名",
    )
    user_download_mediaext: list[str] = Field(
        default_factory=lambda: ["srt", "ssa", "ass", "nfo"],
        min_length=1,
        description="可下载媒体数据扩展名",
    )


class StorageConfigSchema(BaseModel):
    """
    存储配置
    """

    cloud_storage_box_dir: str | None = Field(
        default=None,
        description="网盘箱目录",
    )
    local_media_library_dir: str | None = Field(
        default=None,
        description="本地媒体库目录",
    )


class FullSyncConfigSchema(BaseModel):
    """
    全量同步配置
    """

    overwrite_mode: Literal["never", "always"] = Field(
        default="never", description="全量同步覆盖模式"
    )
    auto_download_mediainfo_enabled: bool = Field(
        default=False, description="下载媒体信息文件开关"
    )
    min_file_size: Optional[int] = Field(
        default=None, ge=0, description="全量生成最小文件大小"
    )
    path: Optional[str] = Field(default=None, description="全量同步路径")
    detail_log: bool = Field(default=True, description="全量生成输出详细日志")


class ConfigResponseSchema(BaseModel):
    """
    配置 GET 响应
    """

    base: BaseConfigSchema = Field(default_factory=BaseConfigSchema)
    storage: StorageConfigSchema = Field(default_factory=StorageConfigSchema)
    full_sync: FullSyncConfigSchema = Field(default_factory=FullSyncConfigSchema)


class ConfigUpdateSchema(BaseModel):
    """
    配置 PATCH 请求体（可部分更新）
    """

    base: BaseConfigSchema | None = Field(
        default=None, description="基础配置，仅传需要更新的字段"
    )
    storage: StorageConfigSchema | None = Field(
        default=None, description="存储配置，仅传需要更新的字段"
    )
    full_sync: FullSyncConfigSchema | None = Field(
        default=None, description="全量同步配置，仅传需要更新的字段"
    )
