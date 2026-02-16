from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import SecurityCore
from app.models.user import User
from app.services.user import UserService


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    解码 JWT 并返回当前用户文档

    :param token: 令牌

    :return: 当前用户文档
    """
    try:
        payload = SecurityCore.decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="无效令牌"
            )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效令牌")

    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="用户已禁用"
        )
    return user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    要求当前用户为管理员，否则返回 403。

    :param current_user: 当前登录用户（由 get_current_user 注入）
    :return: 管理员用户文档
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="需要管理员权限"
        )
    return current_user
