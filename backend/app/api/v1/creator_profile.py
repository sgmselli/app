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
from app.db.base import Creator
from app.db.session import get_db
from app.crud import creator_profile as crud_creator_profile
from app.utils.auth import get_current_user, get_optional_user, get_current_user_with_profile
from app.utils.constants.http_error_details import (
    CREATOR_PROFILE_NOT_FOUND_ERROR,
    CREATOR_PROFILE_ALREADY_EXISTS
)
from app.utils.s3 import build_s3_url

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
        tips = creator_profile.tips
        if not current_user or current_user.username != username:
            tips = [tip for tip in tips if not tip.isPrivate]
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