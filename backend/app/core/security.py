"""安全相关：JWT 令牌与密码哈希"""

from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import cfg

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """对明文密码进行哈希"""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """验证明文密码与哈希是否匹配"""
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """签发访问令牌"""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=cfg.auth.access_token_expire_minutes)
    )
    return jwt.encode({"sub": subject, "exp": expire}, cfg.app.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """解码并验证访问令牌"""
    return jwt.decode(token, cfg.app.secret_key, algorithms=[ALGORITHM])
