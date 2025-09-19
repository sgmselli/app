from pydantic import BaseModel, field_validator
from typing import Optional
import re

from app.utils.exceptions.custom_exceptions import FieldValidationError
from app.models.creator_profile import Country

class BankConnectPayload(BaseModel):
    country: Country

    @field_validator("country", mode="before")
    def validate_country(cls, v: any) -> any:
        if not v:
            raise FieldValidationError(field="country", message="Country is required")

        try:
            return Country(v)
        except ValueError:
            raise FieldValidationError(
                field="country",
                message=f"Invalid country '{v}'. Must be one of: {', '.join([c.value for c in Country])}"
            )

class StripeCheckoutPayload(BaseModel):
    username: str
    number_of_tube_tips: int
    name: Optional[str] = None
    message: Optional[str] = None

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

    @field_validator("number_of_tube_tips")
    def validate_payment_amount(cls, v: float) -> float:
        min_amount = 1
        max_amount = 99999
        if v < min_amount:
            raise ValueError(f"Number of tube tips must be at least {min_amount}")
        if v > max_amount:
            raise ValueError(f"Number of tube tips must not exceed {max_amount}")
        return v

    @field_validator("name")
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) > 100:
                raise ValueError("Name must be 100 characters or fewer")
            if not re.match(r'^[A-Za-z0-9 ]+$', v):
                raise ValueError("Name can only contain letters, numbers, and spaces")
        return v

    @field_validator("message")
    def validate_message(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) > 300:
                raise ValueError("Message must be 300 characters or fewer")
        return v

