from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base_class import Base
from app.models.creator import Creator

class CreatorProfile(Base):
    __tablename__ = 'creator_profiles'

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False, unique=True)
    display_name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    stripe_account_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())

    creator = relationship("Creator", back_populates="profile")
 