from fastapi import APIRouter
from app.api.v1 import creator_profile, creator, stripe, tip, health
from app.api.v1.auth import password_auth

api_router = APIRouter()

api_router.include_router(creator.router, prefix='/creator', tags=['creator'])
api_router.include_router(creator_profile.router, prefix='/creator/profile', tags=['creator_profile'])
api_router.include_router(password_auth.router, prefix='/auth', tags=['password_auth'])
api_router.include_router(stripe.router, prefix='/stripe', tags=['stripe'])
api_router.include_router(tip.router, prefix='/tips', tags=['tips'])
api_router.include_router(health.router, prefix='/health', tags=['health'])
