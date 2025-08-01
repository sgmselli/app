from pydantic import BaseModel
from typing import Optional

from app.models.creator import AuthProvider

class CreatorCreate(BaseModel):
    email: str
    auth_provider: Optional[AuthProvider] = None
    password_hash: Optional[str] = None

class CreatorUpdate(BaseModel):
    email: str
    auth_provider: AuthProvider
    password_hash: str

class CreatorOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True