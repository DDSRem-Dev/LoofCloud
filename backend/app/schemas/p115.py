from datetime import datetime

from pydantic import BaseModel, Field


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
