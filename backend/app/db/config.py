from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from pymongo import MongoClient

from app.core.config import cfg
from app.db.database import db
from app.schemas.config import BaseConfigSchema, StorageConfigSchema


COLLECTION_NAME = "system_settings"
DOC_ID = "app_config"


class DbConfig(BaseModel):
    """
    数据库配置根模型
    """

    base: BaseConfigSchema = Field(default_factory=BaseConfigSchema)
    storage: StorageConfigSchema = Field(default_factory=StorageConfigSchema)


def _get_coll(client: AsyncIOMotorClient, db_name: str | None = None):
    name = db_name or cfg.mongodb.db_name
    return client[name][COLLECTION_NAME]


def _get_coll_sync(client: MongoClient, db_name: str | None = None):
    name = db_name or cfg.mongodb.db_name
    return client[name][COLLECTION_NAME]


async def get_config(
    client: AsyncIOMotorClient | None = None,
    db_name: str | None = None,
) -> DbConfig:
    """
    从数据库读取配置

    :param client: Motor 客户端
    :param db_name: 数据库名

    :return: DbConfig 实例，无数据时返回默认值
    """
    c = client or db.get_mongo_client()
    coll = _get_coll(c, db_name)
    doc = await coll.find_one({"_id": DOC_ID})
    if not doc or "value" not in doc:
        return DbConfig()
    return DbConfig.model_validate(doc["value"])


def get_config_sync(
    client: MongoClient | None = None,
    db_name: str | None = None,
) -> DbConfig:
    """
    从数据库同步读取配置

    :param client: PyMongo 同步客户端
    :param db_name: 数据库名

    :return: DbConfig 实例，无数据时返回默认值
    """
    c = client or db.get_sync_mongo_client()
    coll = _get_coll_sync(c, db_name)
    doc = coll.find_one({"_id": DOC_ID})
    if not doc or "value" not in doc:
        return DbConfig()
    return DbConfig.model_validate(doc["value"])


async def set_config(
    data: DbConfig | dict[str, Any],
    client: AsyncIOMotorClient | None = None,
    db_name: str | None = None,
) -> None:
    """
    将配置写入数据库

    :param data: DbConfig 实例或可解析为 DbConfig 的字典
    :param client: Motor 客户端
    :param db_name: 数据库名
    """
    if not isinstance(data, DbConfig):
        data = DbConfig.model_validate(data)
    payload = data.model_dump()
    c = client or db.get_mongo_client()
    coll = _get_coll(c, db_name)
    await coll.update_one(
        {"_id": DOC_ID},
        {"$set": {"value": payload}},
        upsert=True,
    )


def set_config_sync(
    data: DbConfig | dict[str, Any],
    client: MongoClient | None = None,
    db_name: str | None = None,
) -> None:
    """
    将配置同步写入数据库

    :param data: DbConfig 实例或可解析为 DbConfig 的字典
    :param client: PyMongo 同步客户端
    :param db_name: 数据库名
    """
    if not isinstance(data, DbConfig):
        data = DbConfig.model_validate(data)
    payload = data.model_dump()
    c = client or db.get_sync_mongo_client()
    coll = _get_coll_sync(c, db_name)
    coll.update_one(
        {"_id": DOC_ID},
        {"$set": {"value": payload}},
        upsert=True,
    )


async def set_value(
    key_path: str,
    value: Any,
    client: AsyncIOMotorClient | None = None,
    db_name: str | None = None,
) -> None:
    """
    按点分路径更新单个配置项并同步到数据库

    :param key_path: 点分路径
    :param value: 新值
    :param client: 客户端
    :param db_name: 数据库名
    """
    parts = key_path.strip().split(".")
    if len(parts) < 2:
        raise ValueError("key_path 至少为两段")
    c = client or db.get_mongo_client()
    coll = _get_coll(c, db_name)
    dot_key = "value." + ".".join(parts)
    await coll.update_one(
        {"_id": DOC_ID},
        {"$set": {dot_key: value}},
        upsert=True,
    )


def set_value_sync(
    key_path: str,
    value: Any,
    client: MongoClient | None = None,
    db_name: str | None = None,
) -> None:
    """
    按点分路径同步更新单个配置项并写入数据库

    :param key_path: 点分路径
    :param value: 新值
    :param client: PyMongo 同步客户端
    :param db_name: 数据库名
    """
    parts = key_path.strip().split(".")
    if len(parts) < 2:
        raise ValueError("key_path 至少为两段")
    c = client or db.get_sync_mongo_client()
    coll = _get_coll_sync(c, db_name)
    dot_key = "value." + ".".join(parts)
    coll.update_one(
        {"_id": DOC_ID},
        {"$set": {dot_key: value}},
        upsert=True,
    )


def _get_nested(data: dict[str, Any], key_path: str) -> Any:
    """
    按点分路径从字典取值
    """
    for key in key_path.strip().split("."):
        if not isinstance(data, dict) or key not in data:
            return None
        data = data[key]
    return data


def _set_nested(data: dict[str, Any], key_path: str, value: Any) -> None:
    """
    按点分路径向字典写单键
    """
    parts = key_path.strip().split(".")
    cur = data
    for p in parts[:-1]:
        if p not in cur:
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


class DbConfigManager:
    """
    数据库配置管理器
    """

    __slots__ = ("_cache", "_db_name")

    def __init__(self, db_name: str | None = None) -> None:
        self._cache: DbConfig | None = None
        self._db_name = db_name or cfg.mongodb.db_name

    async def get(self) -> DbConfig:
        """
        从数据库读取配置并缓存
        """
        self._cache = await get_config(db_name=self._db_name)
        return self._cache

    def get_sync(self) -> DbConfig:
        """
        从数据库同步读取配置并缓存
        """
        self._cache = get_config_sync(db_name=self._db_name)
        return self._cache

    async def set(self, data: DbConfig | dict[str, Any]) -> None:
        """
        将配置写入数据库并更新缓存
        """
        if not isinstance(data, DbConfig):
            data = DbConfig.model_validate(data)
        await set_config(data, db_name=self._db_name)
        self._cache = data

    def set_sync(self, data: DbConfig | dict[str, Any]) -> None:
        """
        将配置同步写入数据库并更新缓存
        """
        if not isinstance(data, DbConfig):
            data = DbConfig.model_validate(data)
        set_config_sync(data, db_name=self._db_name)
        self._cache = data

    async def get_value(self, key_path: str) -> Any:
        """
        按点分路径取值
        """
        if self._cache is None:
            await self.get()
        d = self._cache.model_dump()
        return _get_nested(d, key_path)

    def get_value_sync(self, key_path: str) -> Any:
        """
        按点分路径同步取值
        """
        if self._cache is None:
            self.get_sync()
        assert self._cache is not None
        d = self._cache.model_dump()
        return _get_nested(d, key_path)

    async def set_value(self, key_path: str, value: Any) -> None:
        """
        按点分路径写单键并同步到数据库
        """
        await set_value(key_path, value, db_name=self._db_name)
        if self._cache is not None:
            d = self._cache.model_dump()
            _set_nested(d, key_path, value)
            self._cache = DbConfig.model_validate(d)

    def set_value_sync(self, key_path: str, value: Any) -> None:
        """
        按点分路径同步写单键并同步到数据库
        """
        set_value_sync(key_path, value, db_name=self._db_name)
        if self._cache is not None:
            d = self._cache.model_dump()
            _set_nested(d, key_path, value)
            self._cache = DbConfig.model_validate(d)

    def invalidate(self) -> None:
        """
        清空缓存
        """
        self._cache = None
