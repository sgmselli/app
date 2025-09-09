from sqlalchemy import Column, Enum, Integer, String
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class AuthProvider(enum.Enum):
    PASSWORD = 'PASSWORD'

class Creator(Base):
    __tablename__ = 'creators'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=True)
    profile = relationship("CreatorProfile", back_populates="creator", uselist=False, cascade="all, delete", passive_deletes=True)

    @property
    def has_profile(self) -> bool:
        return self.profile is not None

    @property
    def is_bank_connected(self) -> bool:
        """Return True if the user has a profile and Stripe is connected."""
        return self.profile.is_bank_connected if self.has_profile else False
