"""用户相关端点"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """获取当前用户信息"""
    # TODO: 实现
    pass


@router.put("/me")
async def update_me(current_user=Depends(get_current_user)):
    """更新当前用户信息"""
    # TODO: 实现
    pass
