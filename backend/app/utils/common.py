from beanie import PydanticObjectId


class CommonUtils:
    """
    通用工具类
    """

    @staticmethod
    def to_object_id(id_str: str) -> PydanticObjectId:
        """
        将字符串转换为 PydanticObjectId。

        :param id_str: 可解析为 ObjectId 的字符串
        :return: PydanticObjectId 实例
        """
        return PydanticObjectId(id_str)
