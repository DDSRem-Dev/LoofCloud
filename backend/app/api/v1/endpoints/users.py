from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_admin, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserUpdateByAdmin
from app.services.user import UserService

router = APIRouter()


def _user_to_response(user: User) -> UserResponse:
    """
    将 User 文档转为 UserResponse 模型。

    :param user: 用户文档
    :return: 用户响应模型
    """
    return UserResponse(
        id=str(user.id),
        username=user.username,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.get("", response_model=list[UserResponse])
async def list_users_for_admin(
    current_user: User = Depends(get_current_admin),
) -> list[UserResponse]:
    """
    管理员获取用户列表。

    :param current_user: 当前管理员用户
    :return: 用户列表
    """
    users = await UserService.list_users()
    return [_user_to_response(u) for u in users]


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    获取当前登录用户信息。

    :param current_user: 当前登录用户（由依赖注入）
    :return: 当前用户信息
    """
    return _user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    当前用户修改自己的用户名和/或密码。

    :param data: 待更新的字段（用户名、密码可选）
    :param current_user: 当前登录用户
    :return: 更新后的用户信息
    """
    if not data.username and not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供要修改的用户名或密码",
        )
    if data.username and data.username != current_user.username:
        existing = await UserService.get_user_by_username(data.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户名已被使用",
            )
    updated = await UserService.update_user(
        str(current_user.id),
        username=data.username if data.username else None,
        password=data.password if data.password else None,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新失败",
        )
    return _user_to_response(updated)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(
    data: UserCreate,
    current_user: User = Depends(get_current_admin),
) -> UserResponse:
    """
    管理员创建用户（普通用户不能自助注册）。

    :param data: 新用户信息（用户名、密码、角色）
    :param current_user: 当前管理员用户（由依赖注入）
    :return: 创建后的用户信息
    """
    if await UserService.get_user_by_username(data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户名已被使用",
        )
    user = await UserService.create_user(
        username=data.username,
        password=data.password,
        role=data.role,
        is_active=data.is_active,
    )
    return _user_to_response(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_by_admin(
    user_id: str,
    data: UserUpdateByAdmin,
    current_user: User = Depends(get_current_admin),
) -> UserResponse:
    """
    管理员修改指定用户（用户名、密码、角色、启用状态，均为可选）。

    :param user_id: 被修改用户 ID
    :param data: 待更新字段
    :param current_user: 当前管理员
    :return: 更新后的用户信息
    """
    if not any([data.username is not None, data.password is not None, data.role is not None, data.is_active is not None]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请至少提供一项要修改的字段",
        )
    if data.username:
        existing = await UserService.get_user_by_username(data.username)
        if existing and str(existing.id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户名已被使用",
            )
    updated = await UserService.update_user(
        user_id,
        username=data.username,
        password=data.password,
        role=data.role,
        is_active=data.is_active,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )
    return _user_to_response(updated)
