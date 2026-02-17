from datetime import timezone
from typing import Any, Literal

from orjson import loads, dumps
from p115client import P115Client, check_response

from app.core.config import cfg
from app.core.logger import logger
from app.db.database import db
from app.utils.timezone import TimezoneUtils


COLLECTION_NAME = "system_settings"
DOC_ID = "p115_cookies"
REDIS_KEY_P115_USER_INFO = "p115:user_info"
REDIS_KEY_P115_STORAGE_INFO = "p115:storage_info"
P115_CACHE_TTL_SECONDS = 1800


class P115Manager:
    """
    115 网盘客户端管理
    """

    __slots__ = ("_client",)

    def __init__(self) -> None:
        self._client: P115Client | None = None

    @property
    def logged_in(self) -> bool:
        return self._client is not None

    @property
    def client(self) -> P115Client | None:
        return self._client

    async def load_from_db(self) -> None:
        """
        加载已存储的 cookies，初始化客户端
        """
        try:
            coll = db.get_mongo_client()[cfg.mongodb.db_name][COLLECTION_NAME]
            doc = await coll.find_one({"_id": DOC_ID})
            if doc and doc.get("value"):
                self._client = P115Client(doc["value"])
                logger.info("【P115Core】从数据库加载 cookies 成功")
            else:
                logger.warning("【P115Core】数据库中无已保存的 cookies")
        except Exception as exc:
            logger.error(f"【P115Core】加载 cookies 失败 - {exc}")

    @staticmethod
    async def get_qrcode_token(app: str = "qandroid") -> dict[str, Any]:
        """
        获取二维码 token（uid / time / sign / qrcode_content）

        :param app: 客户端类型，默认 qandroid
        :return: 包含 uid、time、sign、qrcode_content 的字典
        """
        resp = await P115Client.login_qrcode_token(app=app, async_=True)
        data = resp["data"]
        return {
            "uid": data["uid"],
            "time": data["time"],
            "sign": data["sign"],
            "qrcode_content": data.get("qrcode", ""),
        }

    @staticmethod
    async def get_qrcode_image(uid: str) -> bytes:
        """
        根据 uid 获取二维码 PNG 图片字节

        :param uid: 二维码 token 中的 uid
        :return: PNG 图片字节
        """
        return await P115Client.login_qrcode(uid, async_=True)

    @staticmethod
    async def poll_qrcode_status(payload: dict[str, Any]) -> dict[str, Any]:
        """
        轮询扫码状态

        :param payload: 需包含 uid、time、sign
        :return: 包含 status、msg 的字典
        """
        resp = await P115Client.login_qrcode_scan_status(payload, async_=True)
        return {
            "status": resp.get("data", {}).get("status", resp.get("status")),
            "msg": resp.get("data", {}).get("msg", resp.get("msg", "")),
        }

    async def confirm_qrcode(self, uid: str, app: str = "qandroid") -> str:
        """
        确认扫码，获取 cookies 并保存到数据库

        :param uid: 二维码 token 中的 uid
        :param app: 客户端类型，默认 qandroid
        :return: 拼接后的 cookies 字符串
        """
        result = await P115Client.login_qrcode_scan_result(uid, app=app, async_=True)
        cookie_dict: dict[str, str] = result["data"]["cookie"]
        cookies_str = "; ".join(f"{k}={v}" for k, v in cookie_dict.items())
        self._client = P115Client(cookies_str)
        await self._save_cookies(cookies_str, app)
        try:
            await db.get_redis().delete(
                REDIS_KEY_P115_USER_INFO, REDIS_KEY_P115_STORAGE_INFO
            )
        except Exception as exc:
            logger.debug(f"【P115Core】登入后清除缓存失败: {exc}")
        logger.info("【P115Core】扫码登入成功")
        return cookies_str

    async def logout(self) -> None:
        """
        清除已保存的 cookies、客户端实例与 Redis 缓存
        """
        self._client = None
        coll = db.get_mongo_client()[cfg.mongodb.db_name][COLLECTION_NAME]
        await coll.delete_one({"_id": DOC_ID})
        try:
            redis_client = db.get_redis()
            await redis_client.delete(
                REDIS_KEY_P115_USER_INFO, REDIS_KEY_P115_STORAGE_INFO
            )
        except Exception as exc:
            logger.warning(f"【P115Core】清除 Redis 缓存失败: {exc}")
        logger.info("【P115Core】已退出登录，cookies 已清除")

    async def get_status(self) -> dict[str, Any]:
        """
        返回当前登入状态信息

        :return: 含 logged_in、app、updated_at 的字典，未登录时为 {"logged_in": False}
        """
        coll = db.get_mongo_client()[cfg.mongodb.db_name][COLLECTION_NAME]
        doc = await coll.find_one({"_id": DOC_ID})
        if doc and doc.get("value"):
            updated_at = doc.get("updated_at")
            if updated_at is not None and updated_at.tzinfo is None:
                updated_at = updated_at.replace(tzinfo=timezone.utc)
            return {
                "logged_in": self.logged_in,
                "app": doc.get("app"),
                "updated_at": updated_at,
            }
        return {"logged_in": False}

    async def get_user_my_info(self) -> dict[str, Any] | None:
        """
        获取当前 115 用户信息。优先读 Redis 缓存，未命中再请求 115 API。

        :return: 用户信息字典，未登入或失败时返回 None
        """
        if self._client is None:
            return None
        try:
            redis_client = db.get_redis()
            cached = await redis_client.get(REDIS_KEY_P115_USER_INFO)
            if cached is not None:
                return loads(cached)
        except Exception as exc:
            logger.debug(f"【P115Core】读取 user_info 缓存失败: {exc}")
        try:
            result = await self._client.user_my_info(async_=True)
            check_response(result)
            data = result.get("data")
            if not isinstance(data, dict):
                return None
            try:
                await db.get_redis().setex(
                    REDIS_KEY_P115_USER_INFO,
                    P115_CACHE_TTL_SECONDS,
                    dumps(data).decode(),
                )
            except Exception as exc:
                logger.debug(f"【P115Core】写入 user_info 缓存失败: {exc}")
            return data
        except Exception as exc:
            logger.warning(f"【P115Core】user_my_info 失败: {exc}")
            return None

    async def get_fs_index_info(
        self, payload: Literal[0, 1] = 0
    ) -> dict[str, Any] | None:
        """
        获取 115 网盘存储/索引信息。优先读 Redis 缓存，未命中再请求 115 API。

        :param payload: 通常传 0
        :return: 存储信息字典，未登入或失败时返回 None
        """
        if self._client is None:
            return None
        cache_key = (
            REDIS_KEY_P115_STORAGE_INFO
            if payload == 0
            else f"p115:storage_info:{payload}"
        )
        try:
            redis_client = db.get_redis()
            cached = await redis_client.get(cache_key)
            if cached is not None:
                return loads(cached)
        except Exception as exc:
            logger.debug(f"【P115Core】读取 storage_info 缓存失败: {exc}")
        try:
            result = await self._client.fs_index_info(payload, async_=True)
            check_response(result)
            data = result.get("data")
            if not isinstance(data, dict):
                return None
            try:
                await db.get_redis().setex(
                    cache_key,
                    P115_CACHE_TTL_SECONDS,
                    dumps(data).decode(),
                )
            except Exception as exc:
                logger.debug(f"【P115Core】写入 storage_info 缓存失败: {exc}")
            return data
        except Exception as exc:
            logger.warning(f"【P115Core】fs_index_info 失败: {exc}")
            return None

    async def get_dashboard_info(self) -> dict[str, Any]:
        """
        获取仪表盘所需数据：用户信息 + 存储信息

        :return: { logged_in, user_info?, storage_info? }
        """
        status = await self.get_status()
        if not status.get("logged_in"):
            return {"logged_in": False, "user_info": None, "storage_info": None}
        user_info = await self.get_user_my_info()
        storage_info = await self.get_fs_index_info(payload=0)
        return {
            "logged_in": True,
            "user_info": user_info,
            "storage_info": storage_info,
        }

    @staticmethod
    async def _save_cookies(cookies_str: str, app: str) -> None:
        """
        将 cookies 与 app 写入数据库

        :param cookies_str: 拼接后的 cookies 字符串
        :param app: 客户端类型
        """
        coll = db.get_mongo_client()[cfg.mongodb.db_name][COLLECTION_NAME]
        await coll.update_one(
            {"_id": DOC_ID},
            {
                "$set": {
                    "value": cookies_str,
                    "app": app,
                    "updated_at": TimezoneUtils.now_utc(),
                }
            },
            upsert=True,
        )


p115_manager = P115Manager()
