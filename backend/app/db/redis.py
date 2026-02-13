"""Redis 连接管理"""

import redis.asyncio as aioredis

from app.core.config import cfg

redis_client: aioredis.Redis | None = None


async def connect_redis():
    """初始化 Redis 异步连接"""
    global redis_client
    redis_client = aioredis.from_url(cfg.redis.url, decode_responses=True)


async def close_redis():
    """关闭 Redis 连接"""
    global redis_client
    if redis_client:
        await redis_client.aclose()


def get_redis() -> aioredis.Redis:
    """获取 Redis 客户端实例"""
    assert redis_client is not None, "Redis 未连接"
    return redis_client
