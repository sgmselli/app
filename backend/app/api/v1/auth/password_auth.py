from fastapi import APIRouter, Depends, HTTPException, Response, Cookie 
from fastapi.security import OAuth2PasswordRequestForm
from uuid import uuid4

from app.core import settings
from app.crud.creator import get_user_by_email
from app.db.session import get_db
from app.utils.auth import verify_password
from app.utils.constants.http_codes import (
    HTTP_204_NO_CONTENT,
    HTTP_401_UNAUTHORIZED, 
)
from app.utils.constants.http_error_details import (
    INVALID_LOGIN_CREDENTIALS_ERROR,
)
from app.utils.auth import create_access_token, create_refresh_token, decode_refresh_token, store_tokens, store_access_token
from app.utils.logging import Logger, LogLevel

router = APIRouter()

@router.post('/login')
async def login(response: Response, db = Depends(get_db) , form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username
    password = form_data.password
    user = get_user_by_email(db=db, email=email)
    if user is None or not verify_password(password, user.password_hash):
        Logger.log(LogLevel.ERROR, "Incorrect login credentials.")
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=INVALID_LOGIN_CREDENTIALS_ERROR)
    access_token = create_access_token(data={
        "sub": str(user.id)
    })
    refresh_token = create_refresh_token(data={
        "sub": str(user.id),
        "jti": str(uuid4())
    })
    store_tokens(response, access_token, refresh_token)
    if not user.has_profile:
        return {
            "id": user.id,
            "username": user.username,
            "has_profile": False,
            "is_bank_connected": False
        }
    else:
        return {
            "id": user.id,
            "username": user.username,
            "has_profile": True,
            "is_bank_connected": user.is_bank_connected
        }

@router.post('/refresh')
async def refresh_auth_tokens(response: Response, refresh_token: str = Cookie(None)):
    if refresh_token is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=INVALID_LOGIN_CREDENTIALS_ERROR)
    decoded = decode_refresh_token(refresh_token)
    if decoded is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=INVALID_LOGIN_CREDENTIALS_ERROR)
    sub = decoded.get("sub")
    access_token = create_access_token(data={
        "sub": sub,
    })
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite='lax',
        max_age=60 * settings.access_token_expire_minutes
    )
    response.status_code = HTTP_204_NO_CONTENT
    return response

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,      
        samesite="lax",
        path="/"
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )
    response.status_code = HTTP_204_NO_CONTENT
    return response