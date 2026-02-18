from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.core.config import cfg
from app.api.v1.router import v1_router
from app.middleware.logging import RequestLoggingMiddleware
from app.startup.lifespan import lifespan


def create_app() -> FastAPI:
    """
    创建并配置 FastAPI 应用
    """
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

    return app


app = create_app()
