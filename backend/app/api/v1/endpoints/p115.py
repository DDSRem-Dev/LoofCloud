from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response

from app.api.deps import get_current_admin
from app.core.p115 import p115_manager
from app.models.user import User
from app.schemas.p115 import (
    P115ConfirmResponse,
    P115DashboardResponse,
    P115LogoutResponse,
    P115PollResponse,
    P115QrcodeTokenResponse,
    P115StatusResponse,
)

router = APIRouter()


@router.get("/dashboard", response_model=P115DashboardResponse)
async def get_dashboard(_: User = Depends(get_current_admin)) -> P115DashboardResponse:
    """
    获取 115 仪表盘数据（用户信息 + 存储信息）

    :param _: 当前管理员用户（由依赖注入）
    :return: logged_in、user_info、storage_info
    """
    data = await p115_manager.get_dashboard_info()
    return P115DashboardResponse(**data)


@router.get("/status", response_model=P115StatusResponse)
async def get_status(_: User = Depends(get_current_admin)) -> P115StatusResponse:
    """
    获取 115 登入状态。

    :param _: 当前管理员用户（由依赖注入）
    :return: 登入状态信息（含 logged_in、app、updated_at 等）
    """
    data = await p115_manager.get_status()
    return P115StatusResponse(**data)


@router.post("/qrcode/token", response_model=P115QrcodeTokenResponse)
async def get_qrcode_token(
    app: str = Query(default="qandroid"),
    _: User = Depends(get_current_admin),
) -> P115QrcodeTokenResponse:
    """
    获取 115 二维码登录 token（uid / time / sign / qrcode_content）。

    :param app: 客户端类型，默认 qandroid
    :param _: 当前管理员用户（由依赖注入）
    :return: 二维码 token 数据
    """
    try:
        data = await p115_manager.get_qrcode_token(app=app)
        return P115QrcodeTokenResponse(**data)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取二维码 token 失败: {exc}",
        )


@router.get("/qrcode/image")
async def get_qrcode_image(
    uid: str = Query(...),
    _: User = Depends(get_current_admin),
):
    """
    根据 uid 获取二维码 PNG 图片。

    :param uid: 二维码 token 中的 uid
    :param _: 当前管理员用户（由依赖注入）
    :return: image/png 响应
    """
    try:
        image_bytes = await p115_manager.get_qrcode_image(uid)
        return Response(content=image_bytes, media_type="image/png")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取二维码图片失败: {exc}",
        )


@router.get("/qrcode/poll", response_model=P115PollResponse)
async def poll_qrcode_status(
    uid: str = Query(...),
    time: int = Query(...),
    sign: str = Query(...),
    _: User = Depends(get_current_admin),
) -> P115PollResponse:
    """
    轮询 115 扫码状态。

    :param uid: 二维码 token 中的 uid
    :param time: 二维码 token 中的 time
    :param sign: 二维码 token 中的 sign
    :param _: 当前管理员用户（由依赖注入）
    :return: 扫码状态（status、msg）
    """
    try:
        payload = {"uid": uid, "time": time, "sign": sign}
        data = await p115_manager.poll_qrcode_status(payload)
        return P115PollResponse(**data)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"轮询状态失败: {exc}",
        )


@router.post("/qrcode/confirm", response_model=P115ConfirmResponse)
async def confirm_qrcode(
    uid: str = Query(...),
    app: str = Query(default="qandroid"),
    _: User = Depends(get_current_admin),
) -> P115ConfirmResponse:
    """
    确认扫码并保存 cookies 到数据库。

    :param uid: 二维码 token 中的 uid
    :param app: 客户端类型，默认 qandroid
    :param _: 当前管理员用户（由依赖注入）
    :return: ok 与 cookies_str
    """
    try:
        cookies_str = await p115_manager.confirm_qrcode(uid, app=app)
        return P115ConfirmResponse(ok=True, cookies_str=cookies_str)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"确认登入失败: {exc}",
        )


@router.post("/logout", response_model=P115LogoutResponse)
async def logout(_: User = Depends(get_current_admin)) -> P115LogoutResponse:
    """
    退出 115 登录，清除已保存的 cookies。

    :param _: 当前管理员用户（由依赖注入）
    :return: ok 表示成功
    """
    await p115_manager.logout()
    return P115LogoutResponse(ok=True)
