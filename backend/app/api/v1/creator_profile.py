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
from app.db.session import get_db
from app.crud import creator_profile as crud_creator_profile

router = APIRouter()

@router.get("/{slug}", response_model=CreatorProfileOut, status_code=HTTP_200_OK)
def get(slug: str, db: Session = Depends(get_db)):
    try:
        return crud_creator_profile.get_creator_profile(
            db=db,
            slug=slug
        )
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
@router.post("/create", response_model=CreatorProfileOut, status_code=HTTP_201_CREATED)
def create(creator_profile_in: CreatorProfileCreate, db: Session = Depends(get_db)):
    try:
        return crud_creator_profile.create_creator_profile(
            db=db,
            creator_profile_in=creator_profile_in,
        )
    
    except HTTPException as e:
        raise 

    except Exception as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )