from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import stripe

from app.celery.tasks import task_send_payment_success_email
from app.core import settings
from app.crud.creator_profile import get_creator_profile_by_username, get_creator_profile_by_id
from app.external_services import stripe as stripe_functions 
from app.crud.tip import create_tip
from app.schemas.tip import TipCreate
from app.schemas.stripe import BankConnectPayload, StripeCheckoutPayload
from app.utils.auth import get_current_user, get_current_user_with_profile
from app.db.session import get_db
from app.db.base import Creator, CreatorProfile, Tip
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND
)
from app.utils.constants.http_error_details import (
    BANK_ALREADY_CONNECTED_ERROR,
    CREATOR_PROFILE_NOT_FOUND_ERROR
)
from app.utils.logging import Logger, LogLevel
from app.external_services.stripe import calculate_payment_amount

stripe.api_key = settings.stripe_secret_key

router = APIRouter()

@router.post("/connect")
def connect_bank_account(
    payload: BankConnectPayload,
    db: Session = Depends(get_db),
    current_user: Creator = Depends(get_current_user),
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=CREATOR_PROFILE_NOT_FOUND_ERROR
        )
    if profile.is_bank_connected:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=BANK_ALREADY_CONNECTED_ERROR
        )
    try:
        country_code = stripe_functions.get_stripe_country_details(
            country=payload.country
        ).country_code
    except ValueError as e:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=str(e))
    account_id = stripe_functions.create_stripe_account(
        email=current_user.email,
        country_code=country_code,
        youtube_url=f"https://www.youtube.com/@{profile.youtube_channel_name}",
    )
    account_link = stripe_functions.create_stripe_account_link(
        connected_account_id=account_id,
        return_url=settings.stripe_connect_return_url,
        refresh_url=settings.stripe_connect_failed_url,
    )
    profile.stripe_account_id = account_id
    profile.country = payload.country
    db.commit()
    db.refresh(profile)
    return {"url": account_link}

@router.get('/connect/callback')
async def connect_bank_account_callback(current_user: Creator = Depends(get_current_user)):
    if current_user.is_bank_connected:
        return RedirectResponse(url=settings.stripe_connect_success_url)
    else:
        return RedirectResponse(url=settings.stripe_connect_failed_url)

@router.post("/checkout")
async def create_stripe_account_link(payload: StripeCheckoutPayload, db: Session = Depends(get_db)):
    try:
        username = payload.username
        profile = get_creator_profile_by_username(username=username, db=db)

        payment_amount = calculate_payment_amount(payload.number_of_tube_tips, profile.get_tube_tip_value)

        session_url = stripe_functions.create_stripe_checkout_session_link(
            creator_profile_id=profile.id,
            username=username,
            name=payload.name,
            message=payload.message,
            connected_account_id=profile.stripe_account_id,
            display_name=profile.display_name,
            currency=profile.get_currency,
            payment_amount=payment_amount,
            application_fee_percentage=settings.application_fee_percentage
        )
        return {"url": session_url}

    except ValueError as e:
        Logger.log(LogLevel.ERROR, str(e))
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
@router.post('/webhook/checkout')
async def webhook_checkout(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret_checkout
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if db.query(Tip).filter_by(stripe_session_id=session["id"]).first():
            return {"status": "duplicate"}

        customer = stripe.Customer.retrieve(session["customer"])
        email = customer.get("email")
        creator_profile_id = int(session["metadata"].get("creator_profile_id"))
        amount = int(session["amount_total"])
        currency=session["currency"]
        message = None
        if session["metadata"].get("message"):
            message = session["metadata"].get("message")
        name = None
        if session["metadata"].get("name"):
            name = session["metadata"].get("name")

        tip_data = TipCreate(
            creator_profile_id=creator_profile_id,
            amount=amount,
            name=name,
            message=message,
            stripe_session_id=session["id"]
        )
        create_tip(db=db, tip_data=tip_data)

        profile = get_creator_profile_by_id(db, creator_profile_id)

        task_send_payment_success_email.delay(
            to_email=email,
            display_name=profile.display_name,
            amount=str(amount/100),
            currency=currency
        )

    return {"status": "success"}

@router.post("/webhook/connect")
async def webhook_connect(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    Logger.log(LogLevel.DEBUG, "Webhook call")


    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret_connect
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    Logger.log(LogLevel.DEBUG, "Webhook call")
    Logger.log(LogLevel.DEBUG, event["type"])


    if event["type"] == "account.updated":
        account = event["data"]["object"]
        stripe_account_id = account["id"]
        charges_enabled = account["charges_enabled"]
        payouts_enabled = account["payouts_enabled"]

        Logger.log(LogLevel.DEBUG, charges_enabled)

        if charges_enabled:
            profile = (
                db.query(CreatorProfile)
                .filter_by(stripe_account_id=stripe_account_id)
                .first()
            )
            if profile:
                profile.is_bank_connected = True
                db.commit()

    return {"status": "success"}
