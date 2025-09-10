from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from typing import Optional

from app.external_services.stripe import get_stripe_country_currency, get_stripe_country_code
from app.models.country import Country
from app.db.base_class import Base
from app.utils.s3 import build_s3_url


class CreatorProfile(Base):
    __tablename__ = 'creator_profiles'

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False, unique=True)
    display_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture_key = Column(String, nullable=True)
    profile_banner_key = Column(String, nullable=True)
    stripe_account_id = Column(String, nullable=True)
    is_bank_connected = Column(Boolean, default=False)
    youtube_channel_name = Column(String, nullable=True)
    country = Column(Enum(Country, native_enum= False), nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())

    tips = relationship("Tip", lazy="dynamic", back_populates="creator", cascade="all, delete-orphan")
    creator = relationship("Creator", back_populates="profile")

    @property
    def get_currency(self) -> str:
        return get_stripe_country_currency(self.country)

    @property
    def get_country_code(self) -> str:
        return get_stripe_country_code(self.country)

    @property
    def number_of_tips(self) -> int:
        return self.tips.count()

    @property
    def profile_picture_url(self) -> Optional[str]:
        return build_s3_url(self.profile_picture_key)

    @property
    def profile_banner_url(self) -> Optional[str]:
        return build_s3_url(self.profile_banner_key)