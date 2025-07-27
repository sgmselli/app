from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.genre import Genre
from app.schemas.genre import GenreCreate, GenreUpdate
from app.utils.constants.http_codes import HTTP_404_NOT_FOUND
from app.utils.constants.http_error_details import GENRE_NOT_FOUND_ERROR
from app.utils.logging import LogLevel, Logger

def create_genre(db: Session, genre_in: GenreCreate):
    genre = Genre(
        name=genre_in.name
    )
    db.add(genre)
    db.commit()
    db.refresh(genre)
    return genre

def get_all_genres(db: Session):
    return db.query(Genre).all()

def get_genre(db: Session, genre_id: int):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()

    if not genre:
        Logger.log(LogLevel.ERROR, f"Could not find genre with id {str(genre_id)} on get request.")
        raise ValueError(GENRE_NOT_FOUND_ERROR)
    
    return genre

def update_genre(db: Session, genre_id: int, genre_update: GenreUpdate):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()

    if not genre:
        Logger.log(LogLevel.ERROR, f"Could not find genre with id {str(genre_id)} on update request.")
        raise ValueError(GENRE_NOT_FOUND_ERROR)

    for key, value in genre_update.dict(exclude_unset=True).items():
        setattr(genre, key, value)

    db.commit()
    db.refresh(genre)

    return genre

def delete_genre(db: Session, genre_id: int):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()

    if not genre:
        Logger.log(LogLevel.ERROR, f"Could not find genre with id {str(genre_id)} on delete request.")
        raise ValueError(GENRE_NOT_FOUND_ERROR)

    db.delete(genre)
    db.commit()

    return genre