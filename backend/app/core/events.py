"""应用生命周期事件"""

from app.core.logger import LoggerManager, logger
from app.db.mongodb import connect_mongodb, close_mongodb
from app.db.redis import connect_redis, close_redis
from app.tasks.scheduler import start_scheduler, stop_scheduler


async def on_startup():
    await connect_mongodb()
    await connect_redis()
    await start_scheduler()
    logger.info("应用启动完成")


async def on_shutdown():
    logger.info("应用关闭中...")
    await stop_scheduler()
    await close_mongodb()
    await close_redis()
    LoggerManager.shutdown()
