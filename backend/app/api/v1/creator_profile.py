from fileinput import filename

from fastapi import APIRouter, Depends, Form, File, UploadFile
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.external_services.aws_s3_client import AwsS3Client
from app.utils.constants.http_codes import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR
)
from app.schemas.creator_profile import CreatorProfileCreate, CreatorProfileUpdate, CreatorProfileOut, \
    CreatorProfileUploadPictures
from app.db.base import Creator, Tip
from app.db.session import get_db
from app.crud import creator_profile as crud_creator_profile
from app.utils.auth import get_current_user, get_optional_user
from app.utils.constants.http_error_details import (
    CREATOR_PROFILE_NOT_FOUND_ERROR,
    CREATOR_PROFILE_ALREADY_EXISTS,
    CREATOR_PROFILE_DOES_NOT_EXIST
)
from app.utils.exceptions.custom_exceptions import FieldValidationError
from app.utils.logging import Logger, LogLevel
from app.utils.s3 import build_s3_url, upload_profile_picture_to_s3, delete_profile_picture_from_s3, \
    upload_profile_banner_to_s3, delete_profile_banner_from_s3
from app.utils.upload import validate_uploaded_image

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
            tube_tip_value=creator_profile.get_tube_tip_value,
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
    profile_in: CreatorProfileCreate,
    current_user: Creator = Depends(get_current_user),
    db: Session = Depends(get_db),
    ):
    if current_user.has_profile:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=CREATOR_PROFILE_ALREADY_EXISTS)
    try:
        creator_profile = crud_creator_profile.create_user_profile(
            db=db,
            user_id=current_user.id,
            creator_profile_in=profile_in,
        )
        db.commit()
        return creator_profile
    except Exception as e:
        db.rollback()
        Logger.log(LogLevel.ERROR, f"Error creating profile: {str(e)}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating profile",
        )

@router.put("/profile-pictures")
async def upload_profile_pictures(
    profile_picture: UploadFile = File(None),
    profile_banner: UploadFile = File(None),
    current_user: Creator = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.has_profile:
        raise HTTPException(status_code=400, detail=CREATOR_PROFILE_DOES_NOT_EXIST)

    profile = current_user.profile
    s3_client = AwsS3Client()
    args = {}

    try:
        if profile_picture:
            await validate_uploaded_image(image=profile_picture, field="profile_picture")
        if profile_banner:
            await validate_uploaded_image(image=profile_banner, field="profile_banner")
    except FieldValidationError as e:
        raise e

    if profile_picture:
        profile_picture_key = upload_profile_picture_to_s3(
            s3_client=s3_client,
            user_id=current_user.id,
            filename=profile_picture.filename,
            file=profile_picture.file
        )
        args["profile_picture_key"] = profile_picture_key

    if profile_banner:
        profile_banner_key = upload_profile_banner_to_s3(
            s3_client=s3_client,
            user_id=current_user.id,
            filename=profile_banner.filename,
            file=profile_banner.file
        )
        args["profile_banner_key"] = profile_banner_key

    update_in = CreatorProfileUploadPictures(**args)
    updated_profile = crud_creator_profile.update_creator_profile_pictures(db, profile, update_in)
    db.commit()

    return {
        "profile_picture_url": updated_profile.profile_picture_url,
        "profile_banner_url": updated_profile.profile_banner_url
    }


@router.patch("/update")
async def update_profile(
    display_name: str = Form(None),
    bio: str = Form(None),
    profile_picture: UploadFile = File(None),
    profile_banner: UploadFile = File(None),
    current_user: Creator = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.has_profile:
        raise HTTPException(status_code=400, detail=CREATOR_PROFILE_DOES_NOT_EXIST)

    if not display_name and not bio and not profile_picture and not profile_banner:
        return {}

    profile = current_user.profile
    old_picture_key = profile.profile_picture_key
    old_banner_key = profile.profile_banner_key
    new_picture_key = None
    new_banner_key = None
    s3_client = AwsS3Client()

    try:
        update_text_args = {}
        if display_name:
            update_text_args["display_name"] = display_name
        if bio:
            update_text_args["bio"] = bio
        update_text_data = CreatorProfileUpdate(
            **update_text_args
        )
    except ValueError as e:
        raise e

    try:
        if profile_picture:
            await validate_uploaded_image(image=profile_picture, field="profile_picture")
        if profile_banner:
            await validate_uploaded_image(image=profile_banner, field="profile_banner")
    except FieldValidationError as e:
        raise e

    try:
        update_pictures_args = {}
        if profile_picture:
            #Upload new profile picture
            new_picture_key = upload_profile_picture_to_s3(
                s3_client=s3_client,
                user_id=current_user.id,
                filename=profile_picture.filename,
                file=profile_picture.file
            )
            update_pictures_args['profile_picture_key'] = new_picture_key
        if profile_banner:
            # Upload new profile banner
            new_banner_key = upload_profile_banner_to_s3(
                s3_client=s3_client,
                user_id=current_user.id,
                filename=profile_banner.filename,
                file=profile_banner.file
            )
            update_pictures_args['profile_banner_key'] = new_banner_key

        update_upload_data = CreatorProfileUploadPictures(
            **update_pictures_args
        )

        updated_profile_text = crud_creator_profile.update_creator_profile(db, profile, update_text_data)
        updated_profile_uploads= crud_creator_profile.update_creator_profile_pictures(db, profile, update_upload_data)

        db.commit()

        if new_picture_key and old_picture_key:
            #Delete old profile picture
            delete_profile_picture_from_s3(
                s3_client=s3_client,
                key=old_picture_key,
            )
        if new_banner_key and old_picture_key:
            # Delete old profile banner
            delete_profile_banner_from_s3(
                s3_client=s3_client,
                key=old_banner_key,
            )

        profile_picture_url = None
        profile_banner_url = None

        if updated_profile_uploads.profile_picture_key:
            profile_picture_url=build_s3_url(updated_profile_uploads.profile_picture_key)
        if updated_profile_uploads.profile_banner_key:
            profile_banner_url = build_s3_url(updated_profile_uploads.profile_banner_key)

        return CreatorProfileOut(
            id=updated_profile_text.id,
            display_name=updated_profile_text.display_name,
            bio=updated_profile_text.bio,
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