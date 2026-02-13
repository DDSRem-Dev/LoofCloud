"""认证相关端点：注册 / 登录 / 刷新令牌"""

from fastapi import APIRouter, Depends

from app.schemas.user import UserCreate, UserLogin
from app.schemas.token import Token

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(data: UserCreate):
    """用户注册"""
    # TODO: 实现
    pass


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    """用户登录，返回 JWT 令牌"""
    # TODO: 实现
    pass


@router.post("/refresh", response_model=Token)
async def refresh_token():
    """刷新访问令牌"""
    # TODO: 实现
    pass
