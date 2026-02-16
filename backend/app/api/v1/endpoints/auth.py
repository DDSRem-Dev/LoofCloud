from fastapi import APIRouter, HTTPException, status

from app.core.security import SecurityCore
from app.schemas.token import Token
from app.schemas.user import UserLogin
from app.services.user import UserService

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(data: UserLogin) -> Token:
    """
    用户登录（用户名 + 密码），返回 JWT 访问令牌。

    :param data: 登录表单（用户名、密码）
    :return: 包含 access_token 的令牌响应
    """
    user = await UserService.get_user_by_username(data.username)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    if not SecurityCore.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    access_token = SecurityCore.create_access_token(subject=str(user.id))
    return Token(access_token=access_token)
