"""用户业务逻辑层"""

from beanie import PydanticObjectId

from app.models.user import User
from app.core.security import hash_password


async def create_user(username: str, email: str, password: str) -> User:
    """创建新用户并返回文档"""
    user = User(username=username, email=email, hashed_password=hash_password(password))
    await user.insert()
    return user


async def get_user_by_email(email: str) -> User | None:
    """通过邮箱查找用户"""
    return await User.find_one(User.email == email)


async def get_user_by_id(user_id: str) -> User | None:
    """通过 ID 查找用户"""
    return await User.get(PydanticObjectId(user_id))
