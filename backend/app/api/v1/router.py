from fastapi import APIRouter

from app.api.v1.endpoints import auth, p115, users

v1_router = APIRouter()

v1_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
v1_router.include_router(users.router, prefix="/users", tags=["Users"])
v1_router.include_router(p115.router, prefix="/p115", tags=["P115"])
