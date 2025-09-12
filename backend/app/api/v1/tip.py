from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.crud import tip as tip_crud
from app.schemas.tip import TipOut
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST
)

router = APIRouter()

@router.get("/{creator_profile_id}")
async def get_creator_and_tips(creator_profile_id: int, limit: int = Query(10, ge=1, le=50), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    if limit < 1 or limit > 20:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 50."
        )
    if offset < 0:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Offset must be 0 or greater."
        )

    tips = tip_crud.get_tips_by_creator(
        db=db,
        creator_profile_id=creator_profile_id,
        limit=limit,
        offset=offset,
    )
    return {"tips": tips}
