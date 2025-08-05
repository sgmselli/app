from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models.creator_profile import CreatorProfile
from app.models.creator import Creator
from app.schemas.creator_profile import CreatorProfileCreate, CreatorProfileUpdate
from app.utils.constants.http_error_details import CREATOR_PROFILE_NOT_FOUND_ERROR
from app.utils.logging import LogLevel, Logger
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST,
    HTTP_500_INTERNAL_SERVER_ERROR
)

def get_creator_profile(db: Session, username: str):
    creator_profile = db.query(CreatorProfile).filter(username == username).first()

    if not creator_profile:
        Logger.log(LogLevel.ERROR, f"Could not find the creator profile with username {username} on get request.")
        raise ValueError(CREATOR_PROFILE_NOT_FOUND_ERROR)
    
    return creator_profile

def create_creator_profile(db: Session, creator_profile_in: CreatorProfileCreate):

    creator_id = creator_profile_in.creator_id

    creator = db.query(Creator).filter(Creator.id == creator_id).first()
    if not creator:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"Creator with id {creator_id} does not exist."
        )
    
    creator_profile = CreatorProfile(
        creator_id = creator_id,
        display_name = creator_profile_in.display_name,
        bio = creator_profile_in.bio,
        image_url = creator_profile_in.image_url,
        stripe_account_id = creator_profile_in.stripe_account_id
    )

    db.add(creator_profile)
    try:
        db.commit()

    except IntegrityError as e:
        db.rollback()
        # Check for FK violaton or unique username violation by inspecting e.orig or e.args
        error_message = str(e.orig).lower()
        if "foreign key constraint" in error_message:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail=f"Creator with id {creator_id} does not exist."
            )
        elif "unique constraint" in error_message or "duplicate key" in error_message:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="User already exists."
            )
        else:
            raise HTTPException(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database integrity error."
            )
         
    db.refresh(creator_profile)
    return creator_profile


