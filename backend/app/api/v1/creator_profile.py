from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException 

from sqlalchemy.orm import Session

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
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/{username}", response_model=CreatorProfileOut, status_code=HTTP_200_OK)
async def get(username: str, db: Session = Depends(get_db)):
    try:
        return crud_creator_profile.get_creator_profile(
            db=db,
            username=username
        )
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
@router.post("/create", response_model=CreatorProfileOut, status_code=HTTP_201_CREATED)
async def create(creator_profile_in: CreatorProfileCreate, user: Creator = Depends(get_current_user) , db: Session = Depends(get_db)):
    try:
        return crud_creator_profile.create_creator_profile(
            db=db,
            creator_id=user.id,
            creator_profile_in=creator_profile_in,
        )
    
    except HTTPException as e:
        raise 

    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )