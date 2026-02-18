from pydantic import BaseModel, Field


class BaseConfigSchema(BaseModel):
    """
    基础配置（API 读写）
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


class ConfigResponseSchema(BaseModel):
    """
    配置 GET 响应
    """

    base: BaseConfigSchema = Field(default_factory=BaseConfigSchema)


class ConfigUpdateSchema(BaseModel):
    """
    配置 PATCH 请求体（可部分更新）
    """

    base: BaseConfigSchema | None = Field(
        default=None, description="基础配置，仅传需要更新的字段"
    )
