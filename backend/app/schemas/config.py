from pydantic import BaseModel, Field


class BaseConfigSchema(BaseModel):
    """
    基础配置（API 读写）
    """

    strm_base_url: str | None = Field(default=None, description="STRM 文件基础地址")


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
