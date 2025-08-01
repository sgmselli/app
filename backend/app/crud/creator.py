from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.creator import CreatorCreate
from app.models.creator import Creator
from app.auth.security import hash_password
from app.utils.constants.http_codes import (
    HTTP_400_BAD_REQUEST
)

def get_creator(db: Session):
    pass
    
def create_creator(db: Session, creator_in: CreatorCreate):

    existing = db.query(Creator).filter_by(email=creator_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Email already in use.")

    hashed_password = hash_password(creator_in.password_hash)

    creator = Creator(
        email=creator_in.email,
        auth_provider=creator_in.auth_provider,
        password_hash=hashed_password
    )

    db.add(creator)
    db.commit()
    db.refresh(creator)
    return creator