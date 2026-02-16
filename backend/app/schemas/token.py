from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    JWT 令牌响应
    """

    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")


class TokenPayload(BaseModel):
    """
    JWT 载荷
    """

    sub: str = Field(..., description="主体（如用户 ID）")
