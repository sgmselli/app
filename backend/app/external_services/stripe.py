from typing import Optional

import stripe
from dataclasses import dataclass

from app.core import settings
from app.utils.logging import Logger, LogLevel
from app.models.country import Country

stripe.api_key = settings.stripe_secret_key

@dataclass(frozen=True)
class StripeCountryDetails:
    country_code: str
    currency: str
    tube_tip_value: int  # new field

STRIPE_COUNTRY_DATA: dict[Country, StripeCountryDetails] = {
    Country.Australia: StripeCountryDetails("AU", "aud", 7),
    Country.Austria: StripeCountryDetails("AT", "eur", 4),
    Country.Belgium: StripeCountryDetails("BE", "eur", 4),
    Country.Bulgaria: StripeCountryDetails("BG", "eur", 7),
    Country.Cyprus: StripeCountryDetails("CY", "eur", 4),
    Country.CzechRepublic: StripeCountryDetails("CZ", "czk", 85),
    Country.Denmark: StripeCountryDetails("DK", "dkk", 26),
    Country.Finland: StripeCountryDetails("FI", "eur", 4),
    Country.France: StripeCountryDetails("FR", "eur", 4),
    Country.Germany: StripeCountryDetails("DE", "eur", 4),
    Country.Gibraltar: StripeCountryDetails("GI", "gbp", 3),
    Country.Greece: StripeCountryDetails("GR", "eur", 4),
    Country.Hungary: StripeCountryDetails("HU", "huf", 1348),
    Country.Ireland: StripeCountryDetails("IE", "eur", 4),
    Country.Italy: StripeCountryDetails("IT", "eur", 4),
    Country.Latvia: StripeCountryDetails("LV", "eur", 4),
    Country.Liechtenstein: StripeCountryDetails("LI", "chf", 4),
    Country.Lithuania: StripeCountryDetails("LT", "eur", 4),
    Country.Luxembourg: StripeCountryDetails("LU", "eur", 4),
    Country.Malta: StripeCountryDetails("MT", "eur", 4),
    Country.Netherlands: StripeCountryDetails("NL", "eur", 4),
    Country.Norway: StripeCountryDetails("NO", "nok", 41),
    Country.Poland: StripeCountryDetails("PL", "pln", 15),
    Country.Portugal: StripeCountryDetails("PT", "eur", 4),
    Country.Romania: StripeCountryDetails("RO", "ron", 18),
    Country.Slovakia: StripeCountryDetails("SK", "eur", 4),
    Country.Slovenia: StripeCountryDetails("SI", "eur", 4),
    Country.Spain: StripeCountryDetails("ES", "eur", 4),
    Country.Sweden: StripeCountryDetails("SE", "sek", 38),
    Country.Switzerland: StripeCountryDetails("CH", "chf", 4),
    Country.UnitedKingdom: StripeCountryDetails("GB", "gbp", 3),
}

def get_stripe_country_details(country: Country) -> StripeCountryDetails:
    try:
        return STRIPE_COUNTRY_DATA[country]
    except KeyError:
        raise ValueError(f"{country} is not supported.")

def get_stripe_country_code(country: Country) -> Optional[str]:
    try:
        return get_stripe_country_details(country).country_code
    except ValueError:
        return None

def get_stripe_country_currency(country: Country) -> Optional[str]:
    try:
        return get_stripe_country_details(country).currency
    except ValueError:
        return None

def get_stripe_country_tube_tip_value(country: Country) -> Optional[int]:
    try:
        return get_stripe_country_details(country).tube_tip_value
    except ValueError:
        return None

def create_stripe_account(email: str, country_code: str, youtube_url:str) -> str:
    account = stripe.Account.create(
        type="express",
        country=country_code,
        email=email,
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True},
        },
        business_type="individual", 
        business_profile={
            "url": youtube_url,                
            "mcc": "7929", # Entertainment/performing artists code                   
            "product_description": "Content creator on YouTube",
        },
    )
    Logger.log(LogLevel.INFO, f"Created Stripe account for user {email} with country code {country_code}.")
    return account.id

def create_stripe_account_link(connected_account_id: str, return_url: str, refresh_url: str):
    account_link = stripe.AccountLink.create(
        account=connected_account_id,
        return_url=return_url,
        refresh_url=refresh_url,
        type="account_onboarding",
    )
    return account_link.url

def calculate_payment_amount(number_of_tube_tips: int, tube_tip_value: int) -> int:
    return number_of_tube_tips * tube_tip_value * 100

def calculate_application_fee(amount: int, percent_fee: float) -> int:
    fee = int(amount * (percent_fee / 100))
    return fee

def create_stripe_checkout_session_link(creator_profile_id: int, username: str, connected_account_id: str, display_name:str, currency:str, payment_amount: float, application_fee_percentage: float,  message: Optional[str] = None, name: Optional[str] = None):
    application_fee_amount = calculate_application_fee(payment_amount, application_fee_percentage)
    success_url = f"{settings.frontend_url}/{username}?result=success&amount={payment_amount}"
    cancel_url = f"{settings.frontend_url}/{username}?result=cancel&amount={payment_amount}"
    if message:
        cancel_url += f"?message={message}"

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": currency,
                "product_data": {
                    "name": f"Give {display_name} a tubetip",
                },
                "unit_amount": int(payment_amount),
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        customer_creation="always",
        payment_intent_data={
            "transfer_data": {
                "destination": connected_account_id,
            },
            "application_fee_amount": application_fee_amount,
        },
        metadata={
            "creator_profile_id": str(creator_profile_id), 
            "message": message,
            "name": name,
        },
    )
    return session.url

