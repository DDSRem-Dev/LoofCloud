from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """管理员创建用户时使用"""

    username: str = Field(..., description="用户名")
    password: str = Field(..., description="明文密码")
    role: Literal["admin", "user"] = Field(default="user", description="角色")
    is_active: bool = Field(default=True, description="是否启用")


class UserLogin(BaseModel):
    """登录请求"""

    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserUpdate(BaseModel):
    """当前用户修改自己的用户名或密码"""

    username: str | None = Field(default=None, description="新用户名")
    password: str | None = Field(default=None, description="新密码")


class UserUpdateByAdmin(BaseModel):
    """管理员修改任意用户的字段（均可选）"""

    username: str | None = Field(default=None, description="新用户名")
    password: str | None = Field(default=None, description="新密码")
    role: Literal["admin", "user"] | None = Field(default=None, description="角色")
    is_active: bool | None = Field(default=None, description="是否启用")


class UserResponse(BaseModel):
    """用户信息响应"""

    id: str = Field(..., description="用户 ID")
    username: str = Field(..., description="用户名")
    role: str = Field(..., description="角色")
    is_active: bool = Field(..., description="是否启用")
    created_at: datetime = Field(..., description="创建时间")
