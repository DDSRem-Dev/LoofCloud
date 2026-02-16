import secrets

from beanie import PydanticObjectId

from app.core.logger import logger
from app.core.security import SecurityCore
from app.utils.timezone import TimezoneUtils
from app.models.user import User


class UserService:
    """
    用户相关业务逻辑
    """

    @staticmethod
    async def create_user(
        username: str,
        password: str,
        *,
        role: str = "user",
        is_active: bool = True,
    ) -> User:
        """
        创建新用户并返回文档（仅管理员调用）。

        :param username: 用户名
        :param password: 明文密码
        :param role: 角色（admin / user）
        :param is_active: 是否启用
        :return: 创建的用户文档
        """
        user = User(
            username=username,
            hashed_password=SecurityCore.hash_password(password),
            role="admin" if role == "admin" else "user",
            is_active=is_active,
        )
        await user.insert()
        return user

    @staticmethod
    async def get_user_by_id(user_id: str) -> User | None:
        """
        通过 ID 查找用户。

        :param user_id: 用户 ID 字符串
        :return: 用户文档或 None
        """
        return await User.get(PydanticObjectId(user_id))

    @staticmethod
    async def list_users() -> list[User]:
        """
        列出所有用户（仅管理员调用）。

        :return: 用户文档列表
        """
        cursor = User.find_all()
        return await cursor.to_list()

    @staticmethod
    async def get_user_by_username(username: str) -> User | None:
        """
        通过用户名查找用户。

        :param username: 用户名
        :return: 用户文档或 None
        """
        return await User.find_one(User.username == username)

    @staticmethod
    async def update_user(
        user_id: str,
        *,
        username: str | None = None,
        password: str | None = None,
        role: str | None = None,
        is_active: bool | None = None,
    ) -> User | None:
        """
        更新用户信息（用户名、密码、角色、启用状态，均为可选）。

        :param user_id: 用户 ID
        :param username: 新用户名（可选）
        :param password: 新明文密码（可选）
        :param role: 新角色 admin/user（可选）
        :param is_active: 是否启用（可选）
        :return: 更新后的用户文档或 None（用户不存在时）
        """
        user = await UserService.get_user_by_id(user_id)
        if not user:
            return None
        if username is not None:
            user.username = username
        if password is not None:
            user.hashed_password = SecurityCore.hash_password(password)
        if role is not None:
            user.role = "admin" if role == "admin" else "user"
        if is_active is not None:
            user.is_active = is_active
        user.updated_at = TimezoneUtils.now_utc()
        await user.save()
        return user

    @staticmethod
    async def ensure_default_admin() -> None:
        """
        若系统中不存在任何管理员，则创建默认管理员（用户名 admin，
        密码随机生成并输出到日志）。

        :return: None
        """
        existing = await User.find_one(User.role == "admin")
        if existing:
            return
        password = secrets.token_urlsafe(16)
        await UserService.create_user(
            username="admin",
            password=password,
            role="admin",
        )
        logger.info(
            "已创建默认管理员账号：用户名=admin，密码=%s（请登录后尽快修改）", password
        )
