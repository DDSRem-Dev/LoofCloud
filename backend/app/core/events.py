from app.core.config import cfg
from app.core.logger import LoggerManager, logger
from app.core.p115 import p115_manager
from app.db.database import db
from app.db.secret_key import ensure_secret_key
from app.services.user import UserService
from app.tasks.runner import task_runner


async def on_startup():
    """
    应用启动
    """
    await db.connect()
    secret_key = await ensure_secret_key(db.get_mongo_client())
    cfg.set_secret_key(secret_key)
    await UserService.ensure_default_admin()
    await p115_manager.load_from_db()
    logger.info("应用启动完成")


async def on_shutdown():
    """
    应用关闭
    """
    logger.info("应用关闭中...")
    await task_runner.stop()
    await db.close()
    LoggerManager.shutdown()
