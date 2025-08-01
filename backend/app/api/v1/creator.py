from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.creator import CreatorOut, CreatorCreate
from app.db.session import get_db
from app.crud import creator as creator_crud
from app.utils.constants.http_codes import (
    HTTP_201_CREATED
)

router = APIRouter()

@router.post("/create", response_model=CreatorOut, status_code=HTTP_201_CREATED)
def create(creator_in: CreatorCreate, db: Session = Depends(get_db)):
    return creator_crud.create_creator(
        creator_in=creator_in,
        db=db
    )