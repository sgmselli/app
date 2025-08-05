from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class CreatorProfileBase(BaseModel):
    display_name: str
    bio: Optional[str] = None
    image_url: Optional[str] = None
    stripe_account_id:Optional[str] = None

class CreatorProfileCreate(CreatorProfileBase):
    creator_id: int

class CreatorProfileUpdate(BaseModel):
    display_name: str
    bio: Optional[str] = None
    image_url: Optional[str] = None

class CreatorProfileOut(CreatorProfileBase):
    id: int
    creator_id: int
    created_at: datetime

    class Config:
        from_attributes = True

