from __future__ import annotations

from typing import Any, Dict

from redis import Redis as SyncRedis, from_url as sync_from_url, asyncio as aioredis
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

from app.core.config import cfg


class Database:
    """
    数据库连接管理
    """

    __slots__ = ("_mongo", "_mongo_sync", "_redis", "_redis_sync")

    def __init__(self) -> None:
        self._mongo: AsyncIOMotorClient | None = None
        self._mongo_sync: MongoClient | None = None
        self._redis: aioredis.Redis | None = None
        self._redis_sync: SyncRedis | None = None

    @staticmethod
    def _mongo_client_options() -> Dict[str, Any]:
        """
        MongoDB 连接池与性能参数
        """
        opts: Dict[str, Any] = {
            "maxPoolSize": cfg.mongodb.max_pool_size,
            "minPoolSize": cfg.mongodb.min_pool_size,
            "maxConnecting": cfg.mongodb.max_connecting,
            "connectTimeoutMS": cfg.mongodb.connect_timeout_ms,
            "socketTimeoutMS": cfg.mongodb.socket_timeout_ms,
            "waitQueueTimeoutMS": cfg.mongodb.wait_queue_timeout_ms,
        }
        if cfg.mongodb.max_idle_time_ms is not None:
            opts["maxIdleTimeMS"] = cfg.mongodb.max_idle_time_ms
        return opts

    async def connect(self) -> None:
        """
        建立 MongoDB 与 Redis 连接，并初始化 Beanie 文档模型。
        """
        opts = self._mongo_client_options()
        self._mongo = AsyncIOMotorClient(cfg.mongodb.url, **opts)
        self._mongo_sync = MongoClient(cfg.mongodb.url, **opts)
        await init_beanie(
            database=self._mongo[cfg.mongodb.db_name],  # noqa
            document_models=[
                "app.models.user.User",
                "app.models.file.File",
            ],
        )
        self._redis = aioredis.from_url(cfg.redis.url, decode_responses=True)
        self._redis_sync = sync_from_url(cfg.redis.url, decode_responses=True)

    async def close(self) -> None:
        """
        关闭 MongoDB 与 Redis 连接。
        """
        if self._mongo:
            self._mongo.close()
            self._mongo = None
        if self._mongo_sync:
            self._mongo_sync.close()
            self._mongo_sync = None
        if self._redis:
            await self._redis.aclose()
            self._redis = None
        if self._redis_sync:
            self._redis_sync.close()
            self._redis_sync = None

    def get_mongo_client(self) -> AsyncIOMotorClient:
        """
        获取 MongoDB 客户端。

        :return: Motor 异步客户端
        :raises RuntimeError: 未连接时
        """
        if self._mongo is None:
            raise RuntimeError("MongoDB 未连接，请先调用 Database.connect()")
        return self._mongo

    def get_sync_mongo_client(self) -> MongoClient:
        """
        获取 MongoDB 同步客户端。

        :return: PyMongo 同步客户端
        :raises RuntimeError: 未连接时
        """
        if self._mongo_sync is None:
            raise RuntimeError("MongoDB 未连接，请先调用 Database.connect()")
        return self._mongo_sync

    def get_redis(self) -> aioredis.Redis:
        """
        获取 Redis 异步客户端。

        :return: Redis 异步客户端
        :raises RuntimeError: 未连接时
        """
        if self._redis is None:
            raise RuntimeError("Redis 未连接，请先调用 Database.connect()")
        return self._redis

    def get_sync_redis(self) -> SyncRedis:
        """
        获取 Redis 同步客户端。

        :return: Redis 同步客户端
        :raises RuntimeError: 未连接时
        """
        if self._redis_sync is None:
            raise RuntimeError("Redis 未连接，请先调用 Database.connect()")
        return self._redis_sync


db = Database()
