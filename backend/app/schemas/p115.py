from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class P115StatusResponse(BaseModel):
    """
    115 登入状态响应
    """

    logged_in: bool = Field(..., description="是否已登入")
    app: str | None = Field(default=None, description="登入设备/应用")
    updated_at: datetime | None = Field(default=None, description="登入时间（UTC）")


class P115QrcodeTokenResponse(BaseModel):
    """
    115 二维码 token 响应
    """

    uid: str = Field(..., description="二维码 uid")
    time: int = Field(..., description="时间戳")
    sign: str = Field(..., description="签名")
    qrcode_content: str = Field(..., description="二维码内容")


class P115PollResponse(BaseModel):
    """
    115 扫码轮询状态响应
    """

    status: int = Field(..., description="扫码状态码")
    msg: str = Field(..., description="状态说明")


class P115ConfirmResponse(BaseModel):
    """
    115 确认扫码响应
    """

    ok: bool = Field(..., description="是否成功")
    cookies_str: str = Field(..., description="保存的 cookies 字符串")


class P115LogoutResponse(BaseModel):
    """
    115 退出登录响应
    """

    ok: bool = Field(..., description="是否成功")


class P115VipInfo(BaseModel):
    """
    115 VIP 信息
    """

    is_vip: bool = Field(default=False, description="是否 VIP")
    is_forever: bool = Field(default=False, description="是否永久")
    expire: str = Field(default="", description="过期时间戳")
    expire_str: str = Field(default="", description="过期时间描述，如 2026-07-30")


class P115FaceInfo(BaseModel):
    """
    115 头像
    """

    face_l: str = Field(default="", description="大图")
    face_m: str = Field(default="", description="中图")
    face_s: str = Field(default="", description="小图")


class P115UserInfo(BaseModel):
    """
    115 用户信息
    """

    model_config = ConfigDict(extra="allow")

    uid: int = Field(..., description="用户 ID")
    uname: str = Field(default="", description="用户名")
    vip: P115VipInfo | None = Field(default=None, description="VIP 信息")
    face: P115FaceInfo | None = Field(default=None, description="头像")


class P115SizeItem(BaseModel):
    """
    容量项（size + size_format）
    """

    size: int = Field(default=0, description="字节数")
    size_format: str = Field(default="", description="如 21.01TB")


class P115SpaceInfo(BaseModel):
    """
    115 空间信息（space_info）
    """

    all_total: P115SizeItem | None = Field(default=None, description="总容量")
    all_remain: P115SizeItem | None = Field(default=None, description="剩余容量")
    all_use: P115SizeItem | None = Field(default=None, description="已用容量")


class P115StorageInfo(BaseModel):
    """
    115 存储/索引信息
    """

    model_config = ConfigDict(extra="allow")

    space_info: P115SpaceInfo | None = Field(default=None, description="空间信息")


class P115DashboardResponse(BaseModel):
    """
    115 仪表盘数据（用户信息 + 存储信息）
    """

    logged_in: bool = Field(..., description="是否已登入 115")
    user_info: P115UserInfo | None = Field(
        default=None, description="115 用户信息，未登入为 None"
    )
    storage_info: P115StorageInfo | None = Field(
        default=None, description="115 存储/索引信息，未登入为 None"
    )
