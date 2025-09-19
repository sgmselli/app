from pydantic import BaseModel, EmailStr, constr, field_validator, ValidationInfo
from typing import Optional
import re

class CreatorCreate(BaseModel):
    email: EmailStr
    username: constr(strip_whitespace=True, min_length=1, max_length=50)
    password: str
    confirm_password: str

    @field_validator("username")
    def validate_username(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Username cannot contain spaces")
        if len(v) < 1:
            raise ValueError("Username must be at least 1 character")
        if len(v) > 50:
            raise ValueError("Username must be less than 50 characters")
        if not re.match(r'^[A-Za-z0-9._-]+$', v):
            raise ValueError("Username can only contain letters, numbers, periods, underscores, and hyphens")
        return v

    @field_validator("password")
    def validate_password(cls, v: str):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 128:
            raise ValueError("Password must be less than or equal to 128 characters")
        if " " in v:
            raise ValueError("Password cannot contain spaces")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("confirm_password")
    def validate_confirm_password(cls, v: str, info: ValidationInfo) -> str:
        password = info.data.get("password")
        if password and v != password:
            raise ValueError("Passwords do not match")
        return v

class CreatorUpdateEmail(BaseModel):
    email: EmailStr

class CreatorUpdatePassword(BaseModel):
    password: str

class CreatorOut(BaseModel):
    id: int
    email: str
    username: str

    class Config:
        from_attributes = True

class CurrentUserDataOut(BaseModel):
    id: int
    username: str
    email: str
    has_profile: bool
    is_bank_connected: Optional[bool] = None
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True

class CreatorWithProfileOut(BaseModel):
    id: int
    email: str
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    stripe_account_id: Optional[str] = None
    is_bank_connected: Optional[bool] = None
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True