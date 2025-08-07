from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TipCreate(BaseModel):
    amount: int
    message: Optional[str] = None
    private: bool = False
    creator_profile_id: int
    stripe_session_id: Optional[str] = None

class TipOut(BaseModel):
    id: int
    amount: int
    message: Optional[str]
    private: bool
    created_at: datetime

    class Config:
        from_attributes = True