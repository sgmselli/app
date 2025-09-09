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

STRIPE_COUNTRY_DATA: dict[Country, StripeCountryDetails] = {
    Country.Australia: StripeCountryDetails("AU", "aud"),
    Country.Austria: StripeCountryDetails("AT", "eur"),
    Country.Belgium: StripeCountryDetails("BE", "eur"),
    Country.Brazil: StripeCountryDetails("BR", "brl"),
    Country.Bulgaria: StripeCountryDetails("BG", "eur"),
    Country.Canada: StripeCountryDetails("CA", "cad"),
    Country.Cyprus: StripeCountryDetails("CY", "eur"),
    Country.CzechRepublic: StripeCountryDetails("CZ", "czk"),
    Country.Denmark: StripeCountryDetails("DK", "dkk"),
    Country.Estonia: StripeCountryDetails("EE", "eur"),
    Country.Finland: StripeCountryDetails("FI", "eur"),
    Country.France: StripeCountryDetails("FR", "eur"),
    Country.Germany: StripeCountryDetails("DE", "eur"),
    Country.Ghana: StripeCountryDetails("GH", "usd"),
    Country.Gibraltar: StripeCountryDetails("GI", "gbp"),
    Country.Greece: StripeCountryDetails("GR", "eur"),
    Country.HongKong: StripeCountryDetails("HK", "hkd"),
    Country.Hungary: StripeCountryDetails("HU", "huf"),
    Country.India: StripeCountryDetails("IN", "inr"),
    Country.Indonesia: StripeCountryDetails("ID", "idr"),
    Country.Ireland: StripeCountryDetails("IE", "eur"),
    Country.Italy: StripeCountryDetails("IT", "eur"),
    Country.Japan: StripeCountryDetails("JP", "jpy"),
    Country.Kenya: StripeCountryDetails("KE", "usd"),
    Country.Latvia: StripeCountryDetails("LV", "eur"),
    Country.Liechtenstein: StripeCountryDetails("LI", "chf"),
    Country.Lithuania: StripeCountryDetails("LT", "eur"),
    Country.Luxembourg: StripeCountryDetails("LU", "eur"),
    Country.Malta: StripeCountryDetails("MT", "eur"),
    Country.Mexico: StripeCountryDetails("MX", "mxn"),
    Country.Netherlands: StripeCountryDetails("NL", "eur"),
    Country.NewZealand: StripeCountryDetails("NZ", "nzd"),
    Country.Norway: StripeCountryDetails("NO", "nok"),
    Country.Poland: StripeCountryDetails("PL", "pln"),
    Country.Portugal: StripeCountryDetails("PT", "eur"),
    Country.Romania: StripeCountryDetails("RO", "ron"),
    Country.Singapore: StripeCountryDetails("SG", "sgd"),
    Country.Slovakia: StripeCountryDetails("SK", "eur"),
    Country.Slovenia: StripeCountryDetails("SI", "eur"),
    Country.Spain: StripeCountryDetails("ES", "eur"),
    Country.Sweden: StripeCountryDetails("SE", "sek"),
    Country.Switzerland: StripeCountryDetails("CH", "chf"),
    Country.Thailand: StripeCountryDetails("TH", "thb"),
    Country.UnitedArabEmirates: StripeCountryDetails("AE", "aed"),
    Country.UnitedKingdom: StripeCountryDetails("GB", "gbp"),
    Country.UnitedStates: StripeCountryDetails("US", "usd"),
    Country.Uruguay: StripeCountryDetails("UY", "usd"),
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

def calculate_application_fee(amount: int, percent_fee: float) -> int:
    fee = int(amount * (percent_fee / 100))
    return fee

def create_stripe_checkout_session_link(creator_profile_id: int, username: str, message: str, name: str, isPrivate:bool, connected_account_id: str, display_name:str, return_url: str, refresh_url: str, currency:str, payment_amount: float, application_fee_percentage: float):
    application_fee_amount = calculate_application_fee(payment_amount, application_fee_percentage)
    success_url = f"{settings.frontend_url}/{username}?result=success?amount={payment_amount}"
    cancel_url = f"{settings.frontend_url}/{username}?result=cancel?amount={payment_amount}"
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
        payment_intent_data={
            "transfer_data": {
                "destination": connected_account_id,
            },
            "application_fee_amount": application_fee_amount,
        },
        metadata={
            "creator_profile_id": str(creator_profile_id), 
            "message": str(message),
            "name": str(name),
            "isPrivate": str(isPrivate)
        },
    )
    return session.url

