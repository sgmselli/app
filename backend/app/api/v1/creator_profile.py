from fileinput import filename

from fastapi import APIRouter, Depends, Form, File, UploadFile
from fastapi.exceptions import HTTPException 
from sqlalchemy.orm import Session
from typing import Optional
from starlette.status import HTTP_400_BAD_REQUEST

from app.external_services.aws_s3_client import AwsS3Client
from app.utils.constants.http_codes import (
    HTTP_200_OK,
    HTTP_201_CREATED,       
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR
)
from app.schemas.creator_profile import CreatorProfileCreate, CreatorProfileUpdate, CreatorProfileOut
from app.db.base import Creator, Tip
from app.db.session import get_db
from app.crud import creator_profile as crud_creator_profile
from app.utils.auth import get_current_user, get_optional_user, get_current_user_with_profile
from app.utils.constants.http_error_details import (
    CREATOR_PROFILE_NOT_FOUND_ERROR,
    CREATOR_PROFILE_ALREADY_EXISTS,
    CREATOR_PROFILE_DOES_NOT_EXIST
)
from app.utils.logging import Logger, LogLevel
from app.utils.s3 import build_s3_url, upload_profile_picture_to_s3, delete_profile_picture_from_s3, \
    upload_profile_banner_to_s3, delete_profile_banner_from_s3

router = APIRouter()

@router.get("/username/{username}", response_model=CreatorProfileOut, status_code=HTTP_200_OK)
async def get(username: str, db: Session = Depends(get_db), current_user: Optional[Creator] = Depends(get_optional_user)):
    try:
        creator_profile = crud_creator_profile.get_creator_profile_by_username(
            db=db,
            username=username
        )
        if not creator_profile:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail=CREATOR_PROFILE_NOT_FOUND_ERROR)
        tips = db.query(Tip).filter_by(creator_profile_id=creator_profile.id).order_by(Tip.created_at.desc()).limit(6).all()
        profile_picture_url=None
        if creator_profile.profile_picture_key:
            profile_picture_url=build_s3_url(creator_profile.profile_picture_key)
        profile_banner_url = None
        if creator_profile.profile_banner_key:
            profile_banner_url = build_s3_url(creator_profile.profile_banner_key)
        return CreatorProfileOut(
            id=creator_profile.id,
            display_name=creator_profile.display_name,
            bio=creator_profile.bio,
            created_at=creator_profile.created_at,
            is_bank_connected=creator_profile.is_bank_connected,
            currency=creator_profile.get_currency,
            tips=tips,
            number_of_tips=creator_profile.number_of_tips,
            youtube_channel_name=creator_profile.youtube_channel_name,
            profile_picture_url=profile_picture_url,
            profile_banner_url=profile_banner_url
        )
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
@router.post("/create", response_model=CreatorProfileOut, status_code=HTTP_201_CREATED)
async def create(
        display_name: str = Form(...),
        bio: str = Form(...),
        youtube_channel_name: str = Form(...),
        profile_picture: Optional[UploadFile] = File(None),
        profile_banner: Optional[UploadFile] = File(None),
        current_user: Creator = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        if current_user.has_profile:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail=CREATOR_PROFILE_ALREADY_EXISTS
            )
        user_id = current_user.id
        s3_client = AwsS3Client()
        profile_picture_key = None
        profile_banner_key = None
        if profile_picture:
            profile_picture_key = f"{user_id}/profile_picture/{profile_picture.filename}"
            if not s3_client.upload_fileobj(profile_picture_key, profile_picture.file):
                raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Error uploading profile picture")
        if profile_banner:
            profile_banner_key = f"{user_id}/profile_banner/{profile_banner.filename}"
            if not s3_client.upload_fileobj(profile_banner_key, profile_banner.file):
                s3_client.delete_object(profile_picture_key)
                raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Error uploading profile banner")
        creator_profile = crud_creator_profile.create_user_profile(
            db=db,
            user_id=user_id,
            creator_profile_in=CreatorProfileCreate(
                display_name=display_name,
                bio=bio,
                youtube_channel_name=youtube_channel_name,
                profile_picture_key=profile_picture_key if profile_picture else None,
                profile_banner_key=profile_banner_key
            ),
        )
        db.commit()
        return CreatorProfileOut(
            id=creator_profile.id,
            display_name=creator_profile.display_name,
            bio=creator_profile.bio,
            created_at=creator_profile.created_at,
            is_bank_connected=False,
            currency=None,
            tips=[],
            number_of_tips=0,
            youtube_channel_name=creator_profile.youtube_channel_name,
            profile_picture_url="",
            profile_banner_url=""
        )

    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.patch("/update")
def update_profile(
    display_name: str = Form(None),
    bio: str = Form(None),
    profile_picture: UploadFile = File(None),
    profile_banner: UploadFile = File(None),
    current_user: Creator = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.has_profile:
        raise HTTPException(status_code=400, detail=CREATOR_PROFILE_DOES_NOT_EXIST)

    profile = current_user.profile
    old_picture_key = profile.profile_picture_key
    old_banner_key = profile.profile_banner_key
    new_picture_key = None
    new_banner_key = None
    s3_client = AwsS3Client()
    args = {}

    try:
        if display_name is not None:
            args["display_name"] = display_name
        if bio is not None:
            args["bio"] = bio
        if profile_picture:
            #Upload new profile picture
            new_picture_key = upload_profile_picture_to_s3(
                s3_client=s3_client,
                user_id=current_user.id,
                filename=profile_picture.filename,
                file=profile_picture.file
            )
            args["profile_picture_key"] = new_picture_key
        if profile_banner:
            # Upload new profile banner
            new_banner_key = upload_profile_banner_to_s3(
                s3_client=s3_client,
                user_id=current_user.id,
                filename=profile_banner.filename,
                file=profile_banner.file
            )
            args["profile_banner_key"] = new_banner_key

        update_in = CreatorProfileUpdate(**args)
        updated_profile = crud_creator_profile.update_creator_profile(db, profile, update_in)
        db.commit()

        if new_picture_key:
            #Delete old profile picture
            delete_profile_picture_from_s3(
                s3_client=s3_client,
                key=old_picture_key,
            )
        if new_banner_key:
            # Delete old profile banner
            delete_profile_banner_from_s3(
                s3_client=s3_client,
                key=old_banner_key,
            )

        profile_picture_url = None
        profile_banner_url = None
        if updated_profile.profile_picture_key:
            profile_picture_url=build_s3_url(updated_profile.profile_picture_key)
        if updated_profile.profile_banner_key:
            profile_banner_url = build_s3_url(updated_profile.profile_banner_key)

        return CreatorProfileOut(
            id=updated_profile.id,
            display_name=updated_profile.display_name,
            bio=updated_profile.bio,
            profile_picture_url=profile_picture_url,
            profile_banner_url=profile_banner_url,
        )

    except Exception as e:
        if new_picture_key:
            delete_profile_picture_from_s3(s3_client, new_picture_key)
        if new_banner_key:
            delete_profile_banner_from_s3(s3_client, new_banner_key)
        db.rollback()
        Logger.log(LogLevel.ERROR, str(e))
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )