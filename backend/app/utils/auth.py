from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core import settings
from app.db.session import get_db
from app.db.base import Creator
from app.utils.constants.http_codes import (
    HTTP_401_UNAUTHORIZED
)
from app.utils.constants.http_error_details import (
    INVALID_LOGIN_CREDENTIALS_ERROR
)
from app.utils.logging import Logger, LogLevel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

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
        return jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        Logger.log(LogLevel.ERROR, str(e))
        return None

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> Creator:
    from app.crud.creator import get_creator

    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail=INVALID_LOGIN_CREDENTIALS_ERROR,
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception

    user = get_creator(db, email)
    if user is None:
        raise credentials_exception

    return user