from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import Optional

from app.models.creator import Creator
from app.models.creator_profile import CreatorProfile
from app.schemas.creator_profile import CreatorProfileCreate, CreatorProfileUpdate
from app.utils.constants.http_error_details import CREATOR_PROFILE_NOT_FOUND_ERROR
from app.utils.logging import LogLevel, Logger
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST,
    HTTP_500_INTERNAL_SERVER_ERROR
)

def get_creator_profile_by_id(db: Session, creator_profile_id: int):
    user_profile = (
        db.query(CreatorProfile)
        .filter_by(id=creator_profile_id)
        .first()
    )
    if not user_profile:
        Logger.log(LogLevel.ERROR, f"Could not find the creator profile with id {creator_profile_id} on get request.")
        return None
    return user_profile

def get_creator_profile_by_username(db: Session, username: str):
    user_profile = (
        db.query(CreatorProfile)
        .join(Creator)
        .options(joinedload(CreatorProfile.creator))
        .filter(Creator.username == username)
        .first()
    )
    if not user_profile:
        Logger.log(LogLevel.ERROR, f"Could not find the creator profile with username {username} on get request.")
        return None
    return user_profile

def create_user_profile(db: Session, user_id: int, creator_profile_in: CreatorProfileCreate):
    creator_profile = CreatorProfile(
        creator_id = user_id,
        display_name = creator_profile_in.display_name,
        bio = creator_profile_in.bio,
        youtube_channel_name = creator_profile_in.youtube_channel_name,
        profile_picture_key = creator_profile_in.profile_picture_key,
        profile_banner_key= creator_profile_in.profile_banner_key,
    )
    db.add(creator_profile)
    db.flush()
    return creator_profile

def update_creator_profile(db: Session, creator_profile: CreatorProfile, update_in: CreatorProfileUpdate):

    for field, value in update_in.dict(exclude_unset=True).items():
        setattr(creator_profile, field, value)

    db.add(creator_profile)
    db.flush()
    return creator_profile

