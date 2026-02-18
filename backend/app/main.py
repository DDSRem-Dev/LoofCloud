import signal
from contextlib import asynccontextmanager
from multiprocessing import cpu_count

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from uvicorn import Config, Server as UvicornServer

from app.core.config import cfg
from app.core.events import on_startup, on_shutdown
from app.core.logger import logger
from app.api.v1.router import v1_router
from app.middleware.logging import RequestLoggingMiddleware
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


app = FastAPI(
    title=cfg.app.name,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    default_response_class=ORJSONResponse,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix=cfg.app.api_v1_prefix)


@app.get("/health")
async def health_check():
    """
    健康检查接口。

    :return: 包含 status 的字典
    """
    return {"status": "ok"}


Server = UvicornServer(
    Config(
        app,
        host="0.0.0.0",
        port=8999,
        reload=cfg.app.debug,
        workers=cpu_count() * 2 + 1,
        timeout_graceful_shutdown=60,
    )
)


def signal_handler(signum, _):
    """
    信号处理函数，用于优雅停止服务
    """
    print(f"收到信号 {signum}，停止服务...")
    Server.should_exit = True


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    Server.run()
