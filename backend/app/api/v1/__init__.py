from fastapi import APIRouter
from app.api.v1 import creator_profile, creator

api_router = APIRouter()

api_router.include_router(creator.router, prefix='/creator', tags=['creator'])
api_router.include_router(creator_profile.router, prefix='/creator/profile', tags=['creator_profile'])