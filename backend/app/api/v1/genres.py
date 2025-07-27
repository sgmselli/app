from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException 

from sqlalchemy.orm import Session

from app.utils.constants.http_codes import (
    HTTP_200_OK,
    HTTP_201_CREATED,       
    HTTP_404_NOT_FOUND
)
from app.schemas.genre import GenreCreate, GenreOut, GenreUpdate
from app.db.session import get_db
from app.crud import genre as crud_genre

router = APIRouter()


@router.post("/", response_model=GenreOut, status_code=HTTP_201_CREATED)  
async def create(genre_in: GenreCreate, db: Session = Depends(get_db)):
    return crud_genre.create_genre(
        db=db,
        genre_in=genre_in
    )

@router.get("/", response_model=list[GenreOut], status_code=HTTP_200_OK)
async def get_all(db: Session = Depends(get_db)):
    return crud_genre.get_all_genres(
        db=db
    )

@router.get("/{genre_id}", response_model=GenreOut, status_code=HTTP_200_OK)
async def get(genre_id: int, db: Session = Depends(get_db)):
    try:
        return crud_genre.get_genre(
            db=db,
            genre_id=genre_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.put("/{genre_id}", response_model=GenreOut, status_code=HTTP_200_OK)
async def update(genre_id: int, genre_update: GenreUpdate, db: Session = Depends(get_db)):
    try:
        return crud_genre.update_genre(
            db=db,
            genre_id=genre_id,
            genre_update=genre_update
        )    
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.delete("/{genre_id}", response_model=GenreOut, status_code=HTTP_200_OK)
async def delete(genre_id: int, db: Session = Depends(get_db)):
    try:
        return crud_genre.delete_genre(
            db=db,
            genre_id=genre_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=str(e)
        )