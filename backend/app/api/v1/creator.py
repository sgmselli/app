from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.creator import CreatorOut, CreatorCreate
from app.db.session import get_db
from app.crud import creator as creator_crud
from app.utils.constants.http_codes import (
    HTTP_200_OK,
    HTTP_201_CREATED
)

router = APIRouter()

@router.get("/{username}", response_model=CreatorOut, status_code=HTTP_200_OK)
async def get(username: str, db: Session = Depends(get_db)):
    return creator_crud.get_creator_by_username(
        username=username,
        db=db
    )

@router.post("/create", response_model=CreatorOut, status_code=HTTP_201_CREATED)
async def create(creator_in: CreatorCreate, db: Session = Depends(get_db)):
    return creator_crud.create_creator(
        creator_in=creator_in,
        db=db
    )