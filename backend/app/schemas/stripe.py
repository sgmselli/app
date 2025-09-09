from pydantic import BaseModel 
from typing import Optional

from app.models.creator_profile import Country

class BankConnectPayload(BaseModel):
    country: Country

class StripeCheckoutPayload(BaseModel):
    username: str
    payment_amount: float
    name: Optional[str] = None
    message: Optional[str] = None
    isPrivate: bool
