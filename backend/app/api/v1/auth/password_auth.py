from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta

from app.crud.creator import get_creator_by_email
from app.db.session import get_db
from app.utils.auth import verify_password
from app.utils.constants.http_codes import (
    HTTP_401_UNAUTHORIZED
)
from app.utils.constants.http_error_details import (
    INVALID_LOGIN_CREDENTIALS_ERROR,
    INVALID_REFRESH_TOKEN_ERROR,
    INVALID_SUB_ERROR
)
from app.utils.auth import create_access_token, create_refresh_token, decode_refresh_token, get_current_user
from app.db.base import Creator
from app.schemas.tokens import TokenRefreshRequest
from app.utils.logging import Logger, LogLevel

router = APIRouter()

@router.post('/login')
def login(db = Depends(get_db) , form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username
    password = form_data.password

    Logger.log(LogLevel.DEBUG, f"email: {email}")
    Logger.log(LogLevel.DEBUG, f"password: {password}")

    creator = get_creator_by_email(db=db, email=email)

    Logger.log(LogLevel.DEBUG, f"creator u: {creator.email}")

    if not creator or not verify_password(password, creator.password_hash):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=INVALID_LOGIN_CREDENTIALS_ERROR)

    access_token = create_access_token(data={"sub": email})
    refresh_token = create_refresh_token(data={"sub": email})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post('/refresh')
def refresh_token(payload: TokenRefreshRequest):
    token = payload.refresh_token
    decoded = decode_refresh_token(token)

    if decoded is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=INVALID_REFRESH_TOKEN_ERROR)

    email = decoded.get("sub")
    if not email:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=INVALID_SUB_ERROR)

    access_token = create_access_token(data={"sub": email})
    refresh_token = create_refresh_token(data={"sub": email})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}