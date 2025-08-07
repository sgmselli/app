# models/tip.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base_class import Base
from app.db.base import CreatorProfile

class Tip(Base):
    __tablename__ = "tips"

    id = Column(Integer, primary_key=True, index=True)
    creator_profile_id = Column(Integer, ForeignKey("creator_profiles.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    message = Column(String, nullable=True)
    private = Column(Boolean, nullable=False, default=False)
    stripe_session_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())

    creator = relationship("CreatorProfile", back_populates="tips")