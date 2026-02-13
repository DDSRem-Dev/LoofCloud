"""统一 API 响应格式"""

from typing import Any


def success(data: Any = None, message: str = "ok") -> dict:
    """成功响应"""
    return {"code": 0, "message": message, "data": data}


def error(message: str = "error", code: int = -1, data: Any = None) -> dict:
    """错误响应"""
    return {"code": code, "message": message, "data": data}
