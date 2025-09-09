from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from fastapi import HTTPException

from app.schemas.creator import CreatorCreate
from app.models.creator import Creator
from app.utils.auth import hash_password
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST
)
from app.utils.logging import Logger, LogLevel
from app.utils.constants.http_error_details import (
    EMAIL_USED_ERROR,
    USERNAME_USED_ERROR
)

def get_user_by_id(db: Session, id: str):
    creator = db.query(Creator).filter(Creator.id == id).first()
    if not creator:
        Logger.log(LogLevel.ERROR, f"Could not find the creator with id {id} on get request.")
        return None
    return creator

def get_user_by_email(db: Session, email: str):
    creator = db.query(Creator).filter(Creator.email == email).first()
    if not creator:
        Logger.log(LogLevel.ERROR, f"Could not find the creator with email {email} on get request.")
        return None
    return creator

def get_user_by_username(db: Session, username: str):
    creator = db.query(Creator).filter(Creator.username == username).first()
    if not creator:
        Logger.log(LogLevel.ERROR, f"Could not find the creator with username {username} on get request.")
        return None
    return creator

def get_user_with_profile(db: Session, user_id: int):
    return (
        db.query(Creator)
        .options(joinedload(Creator.profile))
        .filter(Creator.id == user_id)
        .first()
    )
    
def create_user(db: Session, creator_in: CreatorCreate):
    existing = db.query(Creator).filter(
        (Creator.email == creator_in.email.lower()) | 
        (Creator.username == creator_in.username)
    ).first()
    if existing:
        if existing.email == creator_in.email.lower():
            raise ValueError(EMAIL_USED_ERROR)
        else:
            raise ValueError(USERNAME_USED_ERROR)
    hashed_password = hash_password(creator_in.password)
    creator = Creator(
        email=creator_in.email.lower(),
        username=creator_in.username,
        password_hash=hashed_password
    )
    db.add(creator)
    db.flush()
    return creator


# def update_user_password(db: Session, password: str, user = Depends(get_current_user)):
#     creator = db.query(Creator).filter(Creator.username == username).first()
#
#     if not creator:
#         Logger.log(LogLevel.ERROR, f"Could not find the creator with username {username} on get request.")
#         return None
#
#     return creator