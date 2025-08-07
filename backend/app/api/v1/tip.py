from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
# from app.utils.auth import get_current_user_optional
from app.crud import tip as tip_crud
from app.schemas.tip import TipOut
from app.db.base import Creator

router = APIRouter()

@router.get("/", response_model=List[TipOut])
async def get_creator_and_tips(creator_id: int, limit: int = Query(10, ge=1, le=50), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    # include_private=False
    # if current_user is not None and current_user.username == username:
    #     include_private=True

    result = tip_crud.get_tips_by_creator(
        db=db,
        creator_id=creator_id,
        limit=limit,
        offset=offset,
        include_private=True,
    )
    return result