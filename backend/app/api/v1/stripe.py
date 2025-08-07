from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe

from app.core import settings
from app.external_services import stripe as stripe_functions 
from app.crud.tip import create_tip
from app.schemas.tip import TipCreate
from app.schemas.stripe import StripeCreateAccountLink, StripeCheckoutLink
from app.utils.auth import get_current_user
from app.db.session import get_db
from app.db.base import Creator, Tip
from app.crud.creator_profile import get_creator_profile
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST
)

stripe.api_key = settings.stripe_secret_key

router = APIRouter()


@router.post("/connect")
async def create_stripe_account_link(payload: StripeCreateAccountLink, user: Creator = Depends(get_current_user), db: Session = Depends(get_db)):
    country_details = stripe_functions.get_stripe_country_details(country=payload.country)
    country_code = country_details.country_code

    account_id = stripe_functions.create_stripe_account(email=user.email, country_code=country_code)
    account_link = stripe_functions.create_stripe_account_link(connected_account_id=account_id, return_url=settings.stripe_return_url, refresh_url=settings.stripe_refresh_url)

    profile = user.profile
    profile.stripe_account_id = account_id
    profile.country = payload.country 
    db.add(profile)
    db.commit()
    
    return {"url": account_link}

@router.post("/checkout")
async def create_stripe_account_link(payload: StripeCheckoutLink, db: Session = Depends(get_db)):
    try:
        profile = get_creator_profile(username=payload.username, db=db)
        country_details = stripe_functions.get_stripe_country_details(country=profile.country)
        currency = country_details.currency

        session_url = stripe_functions.create_stripe_checkout_session_link(
            creator_profile_id=profile.id,
            message=payload.message,
            private=payload.private,
            connected_account_id=profile.stripe_account_id,
            display_name=profile.display_name,
            return_url=settings.stripe_checkout_return_url,
            refresh_url=settings.stripe_checkout_refresh_url,
            currency=currency,
            payment_amount=payload.payment_amount,
            application_fee_percentage=settings.application_fee_percentage
        )

        return {"url": session_url}

    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.post('/webhook')
async def webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        if db.query(Tip).filter(Tip.stripe_session_id == session["id"]).first():
            return {"status": "duplicate"}

        private = session["metadata"].get("private", "false").lower() == "true"

        tip_data = TipCreate(
            creator_profile_id=int(session["metadata"].get("creator_profile_id")),
            amount=int(session["amount_total"]),
            message=session["metadata"].get("message"),
            private=private,
            stripe_session_id=session["id"]
        )

        create_tip(db=db, tip_data=tip_data)

    return {"status": "success"}