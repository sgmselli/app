from pydantic import BaseModel
from fastapi import UploadFile
from typing import Optional, List
from datetime import datetime

from app.schemas.tip import TipOut

class CreatorProfileCreate(BaseModel):
    display_name: str
    bio: str
    youtube_channel_name: str
    profile_picture_key: str | None
    profile_banner_key: str | None

class CreatorProfileBankCreate(BaseModel):
    stripe_account_id: Optional[str] = None

class CreatorProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None

class CreatorProfileBankUpdate(BaseModel):
    stripe_account_id: Optional[str] = None

class CreatorProfileOut(BaseModel):
    id: int
    display_name: str
    bio: str
    tips: List[TipOut]
    number_of_tips: int
    is_bank_connected: bool
    currency: Optional[str]
    created_at: datetime
    youtube_channel_name: str
    profile_picture_url: str | None
    profile_banner_url: str | None

    class Config:
        from_attributes = True

