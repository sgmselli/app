from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import re

from app.schemas.tip import TipOut

class CreatorProfileBase(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None

    @field_validator("display_name")
    def validate_display_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Display name must be at least 1 character")
        if len(v) > 50:
            raise ValueError("Display name must be less than 50 characters")
        if not re.search(r'[A-Za-z0-9]', v):
            raise ValueError("Display name must contain at least one letter or number")
        return v

    @field_validator("bio")
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Bio must be more than 3 characters")
        if len(v) > 1000:
            raise ValueError("Bio must be 1000 characters or less")
        return v

class CreatorProfileCreate(CreatorProfileBase):
    display_name: str
    bio: str
    youtube_channel_name: str

    @field_validator("youtube_channel_name")
    def validate_youtube_channel_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 3:
            raise ValueError("YouTube channel name must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("YouTube channel name must be less than 50 characters")
        if not re.match(r'^[A-Za-z0-9._-]+$', v):
            raise ValueError(
                "YouTube channel name can only contain letters, numbers, periods, underscores, and hyphens"
            )
        if v[0] in "._-" or v[-1] in "._-":
            raise ValueError("YouTube channel name cannot start or end with ., -, or _")
        if re.search(r'[._-]{2,}', v):
            raise ValueError("YouTube channel name cannot contain consecutive ., -, or _")
        return v

class CreatorProfileUpdate(CreatorProfileBase):
    pass

class CreatorProfileUploadPictures(BaseModel):
    profile_picture_key: Optional[str] = None
    profile_banner_key: Optional[str] = None

class CreatorProfileBankCreate(BaseModel):
    stripe_account_id: Optional[str] = None

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
    tube_tip_value: Optional[int] = None
    created_at:  Optional[datetime] = None
    youtube_channel_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    profile_banner_url: Optional[str] = None

    class Config:
        from_attributes = True

