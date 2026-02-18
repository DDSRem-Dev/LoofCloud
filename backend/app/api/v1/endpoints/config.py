from fastapi import APIRouter, Depends

from app.api.deps import get_current_admin
from app.db.config import get_config, set_config
from app.models.user import User
from app.schemas.config import ConfigResponseSchema, ConfigUpdateSchema

router = APIRouter()


@router.get("", response_model=ConfigResponseSchema)
async def get_app_config(_: User = Depends(get_current_admin)) -> ConfigResponseSchema:
    """
    获取应用配置（仅管理员）
    """
    cfg = await get_config()
    return ConfigResponseSchema(base=cfg.base, storage=cfg.storage)


@router.patch("", response_model=ConfigResponseSchema)
async def update_app_config(
    body: ConfigUpdateSchema,
    _: User = Depends(get_current_admin),
) -> ConfigResponseSchema:
    """
    更新应用配置（仅管理员，支持部分更新）
    """
    cfg = await get_config()
    if body.base is not None:
        update = body.base.model_dump(exclude_unset=True)
        if update:
            cfg.base = cfg.base.model_copy(update=update)
    if body.storage is not None:
        update = body.storage.model_dump(exclude_unset=True)
        if update:
            cfg.storage = cfg.storage.model_copy(update=update)
    await set_config(cfg)
    return ConfigResponseSchema(base=cfg.base, storage=cfg.storage)
