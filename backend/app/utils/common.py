"""通用工具函数"""

from beanie import PydanticObjectId


def to_object_id(id_str: str) -> PydanticObjectId:
    """将字符串转换为 PydanticObjectId"""
    return PydanticObjectId(id_str)
