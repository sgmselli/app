from pydantic import BaseModel, EmailStr, constr, field_validator, ValidationInfo
from typing import Optional

class CreatorCreate(BaseModel):
    email: str
    username: str
    password: str
    confirm_password: str

    # @field_validator("confirm_password")
    # def passwords_match(cls, v: str, info: ValidationInfo) -> str:
    #     if "password" in info.data and v != info.data["password"]:
    #         raise ValueError("passwords do not match")
    #     return v

class CreatorUpdateEmail(BaseModel):
    email: str

class CreatorUpdatePassword(BaseModel):
    email: str

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
    is_bank_connected: bool

    class Config:
        from_attributes = True

class CreatorWithProfileOut(BaseModel):
    id: int
    email: str
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    stripe_account_id: Optional[str] = None
    is_bank_connected: bool

    class Config:
        from_attributes = True