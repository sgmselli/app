from sqlalchemy import Column, Enum, Integer, String
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class AuthProvider(enum.Enum):
    PASSWORD = 'PASSWORD'
    GOOGLE = 'GOOGLE'

class Creator(Base):
    __tablename__ = 'creators'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.PASSWORD, nullable=False)
    password_hash = Column(String, nullable=True)

    profile = relationship("CreatorProfile", back_populates="creator", uselist=False)