from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TipCreate(BaseModel):
    amount: int
    name: Optional[str] = None
    message: Optional[str] = None
    isPrivate: bool = False
    creator_profile_id: int
    stripe_session_id: Optional[str] = None

class TipOut(BaseModel):
    id: int
    amount: int
    name: Optional[str]
    message: Optional[str]
    isPrivate: bool
    created_at: datetime

    class Config:
        from_attributes = True