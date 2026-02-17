from __future__ import annotations

import redis.asyncio as aioredis
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import cfg


class Database:
    """
    数据库连接管理
    """

    __slots__ = ("_mongo", "_redis")

    def __init__(self) -> None:
        self._mongo: AsyncIOMotorClient | None = None
        self._redis: aioredis.Redis | None = None

    async def connect(self) -> None:
        """
        建立 MongoDB 与 Redis 连接，并初始化 Beanie 文档模型。
        """
        self._mongo = AsyncIOMotorClient(cfg.mongodb.url)
        await init_beanie(
            database=self._mongo[cfg.mongodb.db_name],  # noqa
            document_models=[
                "app.models.user.User",
                "app.models.file.File",
            ],
        )
        self._redis = aioredis.from_url(cfg.redis.url, decode_responses=True)

    async def close(self) -> None:
        """
        关闭 MongoDB 与 Redis 连接。
        """
        if self._mongo:
            self._mongo.close()
            self._mongo = None
        if self._redis:
            await self._redis.aclose()
            self._redis = None

    def get_mongo_client(self) -> AsyncIOMotorClient:
        """
        获取 MongoDB 客户端。必须在 connect() 之后调用。

        :return: Motor 异步客户端
        :raises RuntimeError: 未连接时
        """
        if self._mongo is None:
            raise RuntimeError("MongoDB 未连接，请先调用 Database.connect()")
        return self._mongo

    def get_redis(self) -> aioredis.Redis:
        """
        获取 Redis 客户端。必须在 connect() 之后调用。

        :return: Redis 异步客户端
        :raises RuntimeError: 未连接时
        """
        if self._redis is None:
            raise RuntimeError("Redis 未连接，请先调用 Database.connect()")
        return self._redis


db = Database()
