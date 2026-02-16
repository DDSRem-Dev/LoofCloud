from secrets import token_urlsafe
from typing import TYPE_CHECKING

from app.core.config import cfg

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorClient

COLLECTION_NAME = "system_settings"
DOC_ID = "secret_key"


async def ensure_secret_key(client: "AsyncIOMotorClient") -> str:
    """
    从 MongoDB 获取 SECRET_KEY；若不存在则生成并写入后返回。

    :param client: 已连接的 Motor 客户端（通常来自 db.get_mongo_client()）。
    :return: SECRET_KEY 字符串
    """
    database = client[cfg.mongodb.db_name]
    coll = database[COLLECTION_NAME]
    doc = await coll.find_one({"_id": DOC_ID})
    if doc and doc.get("value"):
        return doc["value"]
    key = (
        cfg.app.secret_key
        if cfg.app.secret_key and cfg.app.secret_key != "change-me"
        else token_urlsafe(32)
    )
    await coll.insert_one({"_id": DOC_ID, "value": key})
    return key
