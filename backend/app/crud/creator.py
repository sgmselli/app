from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.creator import CreatorCreate
from app.models.creator import Creator
from app.utils.auth import hash_password
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST
)
from app.utils.logging import Logger, LogLevel
from app.utils.constants.http_error_details import (
    CREATOR_NOT_FOUND_ERROR, 
    EMAIL_USED_ERROR,
    USERNAME_USED_ERROR
)

def get_creator_by_email(db: Session, email: str):
    creator = db.query(Creator).filter(Creator.email == email).first()

    if not creator:
        Logger.log(LogLevel.ERROR, f"Could not find the creator with email {email} on get request.")
        raise ValueError(CREATOR_NOT_FOUND_ERROR)
    
    return creator

def get_creator_by_username(db: Session, username: str):
    creator = db.query(Creator).filter(Creator.username == username).first()

    if not creator:
        Logger.log(LogLevel.ERROR, f"Could not find the creator with username {username} on get request.")
        raise ValueError(CREATOR_NOT_FOUND_ERROR)
    
    return creator
    
def create_creator(db: Session, creator_in: CreatorCreate):
    existing = db.query(Creator).filter(
        (Creator.email == creator_in.email.lower()) | 
        (Creator.username == creator_in.username)
    ).first()

    if existing:
        if existing.email == creator_in.email.lower():
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=EMAIL_USED_ERROR)
        else:
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=USERNAME_USED_ERROR)

    hashed_password = hash_password(creator_in.password_hash)

    creator = Creator(
        email=creator_in.email.lower(),
        username=creator_in.username,
        auth_provider=creator_in.auth_provider,
        password_hash=hashed_password
    )

    db.add(creator)
    db.commit()
    db.refresh(creator)
    return creator