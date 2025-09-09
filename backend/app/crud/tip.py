from sqlalchemy.orm import Session, joinedload
from app.db.base import Tip  
from app.schemas.tip import TipCreate  
from app.utils.logging import Logger, LogLevel  
from app.utils.constants.http_error_details import (
    TIP_NOT_FOUND_ERROR
)

def create_tip(db: Session, tip_data: TipCreate) -> Tip:
    tip = Tip(
        creator_profile_id=tip_data.creator_profile_id,
        amount=tip_data.amount,
        message=tip_data.message,
        isPrivate=tip_data.isPrivate,
        stripe_session_id=tip_data.stripe_session_id
    )
    db.add(tip)
    db.commit()
    db.refresh(tip)
    return tip

def get_tips_by_creator(db: Session, creator_id: int, include_private: bool = False, limit: int = 10, offset: int = 0):
    query = db.query(Tip).filter(Tip.creator_profile_id == creator_id)
    if not include_private:
        query = query.filter(Tip.isPrivate == False)
    
    tips = query.order_by(Tip.created_at.desc()).limit(limit).offset(offset).all()

    if not tips:
        Logger.log(LogLevel.ERROR, f"No tips found for creator with id {creator_id}.")

    return tips