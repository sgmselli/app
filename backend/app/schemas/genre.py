from pydantic import BaseModel
from typing import Optional

class GenreCreate(BaseModel):
    name: str

class GenreUpdate(BaseModel):
    name: Optional[str]

class GenreOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True