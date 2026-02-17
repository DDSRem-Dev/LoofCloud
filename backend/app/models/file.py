from pymongo import IndexModel, ASCENDING

from beanie import Document
from pydantic import Field


class File(Document):
    """
    文件（夹）数据模型
    """

    file_id: int = Field(..., description="文件 ID")
    parent_id: int = Field(..., description="父目录 ID")
    name: str = Field(default="", max_length=255, description="名称")
    sha1: str = Field(default="", max_length=40, description="SHA1 哈希")
    size: int = Field(default=0, description="文件大小")
    pick_code: str = Field(default="", max_length=50, description="115 提取码")
    ctime: int = Field(default=0, description="创建时间戳")
    mtime: int = Field(default=0, description="修改时间戳")
    is_dir: bool = Field(default=False, description="是否为目录")
    path: str = Field(..., description="网盘路径")
    local_path: str = Field(default="", description="本地路径")

    class Settings:
        name = "files"
        indexes = [
            IndexModel([("file_id", ASCENDING)], unique=True),
            IndexModel([("sha1", ASCENDING)], unique=True),
            IndexModel([("pick_code", ASCENDING)], unique=True),
            IndexModel([("path", ASCENDING)], unique=True),
            IndexModel([("local_path", ASCENDING)], unique=True),
        ]
