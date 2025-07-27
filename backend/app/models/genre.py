from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from app.db.base_class import Base

class Genre(Base):
    __tablename__ = 'genres'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)