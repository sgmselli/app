from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_400_BAD_REQUEST

from app.models.creator import Creator
from app.schemas.creator import CreatorOut, CreatorCreate, CurrentUserDataOut, CreatorWithProfileOut
from app.db.session import get_db
from app.crud import creator as creator_crud
from app.utils.auth import get_current_user_with_profile
from app.utils.constants.http_codes import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_404_NOT_FOUND
)
from app.utils.exceptions.custom_exceptions import FieldValidationError
from app.utils.logging import Logger, LogLevel
from app.utils.s3 import build_s3_url

router = APIRouter()

@router.get("/me", response_model=CurrentUserDataOut, status_code=HTTP_200_OK)
async def get_logged_in_user(current_user: CreatorWithProfileOut = Depends(get_current_user_with_profile)):
    try:
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "has_profile": current_user.has_profile,
            "is_bank_connected": current_user.is_bank_connected,
            "profile_picture_url": current_user.profile_picture_url
        }
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/create", response_model=CreatorOut, status_code=HTTP_201_CREATED)
async def create(creator_in: CreatorCreate, db: Session = Depends(get_db)):
    try:
        user =  creator_crud.create_user(
            creator_in=creator_in,
            db=db
        )
        db.commit()
        return user
    except FieldValidationError as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
