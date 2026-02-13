"""MongoDB 连接管理（Motor + Beanie）"""

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import cfg

client: AsyncIOMotorClient | None = None


async def connect_mongodb():
    """初始化 MongoDB 连接并注册 Beanie 文档模型"""
    global client
    client = AsyncIOMotorClient(cfg.mongodb.url)
    await init_beanie(
        database=client[cfg.mongodb.db_name],
        document_models=[
            "app.models.user.User",
        ],
    )


async def close_mongodb():
    """关闭 MongoDB 连接"""
    global client
    if client:
        client.close()
