from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.events import on_startup, on_shutdown
from app.core.logger import logger
from app.tasks.runner import task_runner


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    FastAPI 应用生命周期
    """
    await on_startup()
    async with task_runner:
        await task_runner.register_all()
        await task_runner.start_background()
        logger.info("调度器已启动")
        yield
    await on_shutdown()
