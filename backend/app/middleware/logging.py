"""请求日志中间件 - 注入 request_id 并记录请求耗时"""

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.logger import logger, REQUEST_ID_CTX_VAR


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 优先使用客户端传入的 X-Request-ID，否则自动生成
        request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex[:8])
        REQUEST_ID_CTX_VAR.set(request_id)

        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start

        response.headers["X-Request-ID"] = request_id
        logger.info(
            "%s %s -> %s (%.3fs)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response
