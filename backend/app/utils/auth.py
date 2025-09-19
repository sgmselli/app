from fastapi import Depends, HTTPException, Response, Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core import settings
from app.models.creator import Creator
from app.db.session import get_db
from app.utils.constants.http_codes import (
    HTTP_401_UNAUTHORIZED
)
from app.utils.constants.http_error_details import (
    INVALID_LOGIN_CREDENTIALS_ERROR,
    INVALID_REFRESH_TOKEN_ERROR,
)
from app.utils.logging import Logger, LogLevel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

ACCESS_SECRET_KEY = settings.access_secret_key
REFRESH_SECRET_KEY = settings.refresh_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = settings.refresh_token_expire_days
ALGORITHM = settings.jwt_encryption_algorithm


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    data_to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data_to_encode.update({"exp": expire})
    return jwt.encode(data_to_encode, ACCESS_SECRET_KEY, algorithm=settings.jwt_encryption_algorithm)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        Logger.log(LogLevel.ERROR, str(e))
        return None
    
def decode_refresh_token(token: str):
    try:
        decoded = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        Logger.log(LogLevel.ERROR, str(e))
        return None
    sub = decoded.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail=INVALID_REFRESH_TOKEN_ERROR)

    return {"sub": sub}

def get_current_user(access_token: str = Cookie(None), db: Session = Depends(get_db)) -> Creator:
    from app.crud.creator import get_user_by_id
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail=INVALID_LOGIN_CREDENTIALS_ERROR,
        headers={"WWW-Authenticate": "Bearer"},
    )
    if access_token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(access_token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_user_with_profile(access_token: str = Cookie(None), db: Session = Depends(get_db)) -> Creator:
    from app.crud.creator import get_user_with_profile
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail=INVALID_LOGIN_CREDENTIALS_ERROR,
        headers={"WWW-Authenticate": "Bearer"},
    )
    if access_token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(access_token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise credentials_exception
    user = get_user_with_profile(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_optional_user(access_token: str = Cookie(None), db: Session = Depends(get_db)) -> Optional[Creator]:
    from app.crud.creator import get_user_by_id
    if access_token is None:
        return None
    try:
        payload = jwt.decode(access_token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = get_user_by_id(db, user_id)
        return user
    except JWTError:
        return None
    
def store_tokens(response: Response, access_token: str, refresh_token: str):
    store_access_token(response, access_token)
    store_refresh_token(response, refresh_token)
    
def store_access_token(response: Response, access_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite='lax',
        max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES
    )

def store_refresh_token(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite='lax',
        max_age=60 * 60 * 24 * REFRESH_TOKEN_EXPIRE_DAYS
    )
    
