from time import perf_counter
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.logger import logger, REQUEST_ID_CTX_VAR


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    请求日志中间件
    """

    async def dispatch(self, request: Request, call_next):
        """
        请求日志中间件：记录请求信息和响应时间。

        :param request: 请求对象
        :param call_next: 下一个中间件
        :return: 响应对象
        """
        request_id = request.headers.get("X-Request-ID", uuid4().hex[:8])
        REQUEST_ID_CTX_VAR.set(request_id)

        start = perf_counter()
        response = await call_next(request)
        elapsed = perf_counter() - start

        response.headers["X-Request-ID"] = request_id
        logger.info(
            "%s %s -> %s (%.3fs)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response
