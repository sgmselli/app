from pydantic import BaseModel 

from app.models.creator_profile import Country

class StripeCreateAccountLink(BaseModel):
    country: Country

class StripeCheckoutLink(BaseModel):
    username: str
    payment_amount: float
    message: str
    private: bool