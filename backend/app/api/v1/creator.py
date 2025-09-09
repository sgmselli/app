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
from app.utils.logging import Logger, LogLevel

router = APIRouter()

@router.get("/me", response_model=CurrentUserDataOut, status_code=HTTP_200_OK)
async def get_logged_in_user(current_user: CreatorWithProfileOut = Depends(get_current_user_with_profile)):
    try:
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "has_profile": current_user.has_profile,
            "is_bank_connected": current_user.is_bank_connected
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
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
