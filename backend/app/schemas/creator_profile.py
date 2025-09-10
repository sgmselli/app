from pydantic import BaseModel
from fastapi import UploadFile
from typing import Optional, List
from datetime import datetime

from app.schemas.tip import TipOut

class CreatorProfileCreate(BaseModel):
    display_name: str
    bio: str
    youtube_channel_name: str
    profile_picture_key: Optional[str] = None
    profile_banner_key: Optional[str] = None

class CreatorProfileBankCreate(BaseModel):
    stripe_account_id: Optional[str] = None

class CreatorProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_key: Optional[str] = None
    profile_banner_key: Optional[str] = None

class CreatorProfileBankUpdate(BaseModel):
    stripe_account_id: Optional[str] = None

class CreatorProfileOut(BaseModel):
    id: Optional[int] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    tips: List[TipOut] = None
    number_of_tips: Optional[int] = None
    is_bank_connected: Optional[bool] = None
    currency: Optional[str] = None
    created_at:  Optional[datetime] = None
    youtube_channel_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    profile_banner_url: Optional[str] = None

    class Config:
        from_attributes = True

