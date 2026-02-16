from datetime import timedelta
from hashlib import sha256

from bcrypt import hashpw, gensalt, checkpw
from jose import jwt

from app.core.config import cfg
from app.utils.timezone import TimezoneUtils


ALGORITHM = "HS256"


class SecurityCore:
    """
    密码哈希与 JWT 等安全相关工具，通过类静态方法调用，如 SecurityCore.hash_password(...)。
    """

    @staticmethod
    def _password_prehash(password: str) -> bytes:
        return sha256(password.encode("utf-8")).hexdigest().encode("utf-8")

    @staticmethod
    def hash_password(password: str) -> str:
        """
        对明文密码进行哈希（SHA-256 + bcrypt）。

        :param password: 明文密码
        :return: 哈希后的密码字符串
        """
        prehashed = SecurityCore._password_prehash(password)
        return hashpw(prehashed, gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        """
        验证明文密码与哈希是否匹配。

        :param plain: 明文密码
        :param hashed: 哈希后的密码
        :return: 是否匹配
        """
        hashed_bytes = hashed.encode("utf-8")
        return checkpw(SecurityCore._password_prehash(plain), hashed_bytes)

    @staticmethod
    def create_access_token(
        subject: str, expires_delta: timedelta | None = None
    ) -> str:
        """
        签发 JWT 访问令牌。

        :param subject: 主体标识（如用户 ID）
        :param expires_delta: 可选过期时间间隔，不传则使用配置默认值
        :return: JWT 字符串
        """
        expire = TimezoneUtils.now_utc() + (
            expires_delta or timedelta(minutes=cfg.auth.access_token_expire_minutes)
        )
        return jwt.encode(
            {"sub": subject, "exp": expire}, cfg.get_secret_key(), algorithm=ALGORITHM
        )

    @staticmethod
    def decode_access_token(token: str) -> dict:
        """
        解码并验证 JWT 访问令牌。

        :param token: JWT 字符串
        :return: 解码后的载荷（包含 sub、exp 等）
        """
        return jwt.decode(token, cfg.get_secret_key(), algorithms=[ALGORITHM])
