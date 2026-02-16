from datetime import datetime
from typing import Literal

from beanie import Document
from pydantic import Field

from app.utils.timezone import TimezoneUtils


class User(Document):
    """
    用户数据库模型
    """

    username: str = Field(..., description="用户名")
    hashed_password: str = Field(..., description="密码哈希")
    role: Literal["admin", "user"] = Field(default="user", description="角色")
    is_active: bool = Field(default=True, description="是否启用")
    created_at: datetime = Field(
        default_factory=TimezoneUtils.now_utc, description="创建时间"
    )
    updated_at: datetime = Field(
        default_factory=TimezoneUtils.now_utc, description="更新时间"
    )

    class Settings:
        name = "users"
