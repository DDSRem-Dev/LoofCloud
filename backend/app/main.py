from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import cfg
from app.core.events import on_startup, on_shutdown
from app.api.v1.router import v1_router
from app.middleware.logging import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    await on_startup()
    yield
    await on_shutdown()


app = FastAPI(
    title=cfg.app.name,
    lifespan=lifespan,
    docs_url="/docs" if cfg.app.debug else None,
    redoc_url="/redoc" if cfg.app.debug else None,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: 生产环境需限制允许的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix=cfg.app.api_v1_prefix)


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok"}
