from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base_class import Base
from app.db.base import Creator

import enum

class Country(enum.Enum):
    Australia = "Australia"
    Austria = "Austria"
    Belgium = "Belgium"
    Brazil = "Brazil"
    Bulgaria = "Bulgaria"
    Canada = "Canada"
    Cyprus = "Cyprus"
    CzechRepublic = "CzechRepublic"
    Denmark = "Denmark"
    Estonia = "Estonia"
    Finland = "Finland"
    France = "France"
    Germany = "Germany"
    Ghana = "Ghana"
    Gibraltar = "Gibraltar"
    Greece = "Greece"
    HongKong = "HongKong"
    Hungary = "Hungary"
    India = "India"
    Indonesia = "Indonesia"
    Ireland = "Ireland"
    Italy = "Italy"
    Japan = "Japan"
    Kenya = "Kenya"
    Latvia = "Latvia"
    Liechtenstein = "Liechtenstein"
    Lithuania = "Lithuania"
    Luxembourg = "Luxembourg"
    Malta = "Malta"
    Mexico = "Mexico"
    Netherlands = "Netherlands"
    NewZealand = "NewZealand"
    Norway = "Norway"
    Poland = "Poland"
    Portugal = "Portugal"
    Romania = "Romania"
    Singapore = "Singapore"
    Slovakia = "Slovakia"
    Slovenia = "Slovenia"
    Spain = "Spain"
    Sweden = "Sweden"
    Switzerland = "Switzerland"
    Thailand = "Thailand"
    UnitedArabEmirates = "UnitedArabEmirates"
    UnitedKingdom = "UnitedKingdom"
    UnitedStates = "UnitedStates"
    Uruguay = "Uruguay"

class CreatorProfile(Base):
    __tablename__ = 'creator_profiles'

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False, unique=True)
    display_name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    stripe_account_id = Column(String, nullable=True)
    country = Column(Enum(Country, native_enum= False), nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).isoformat())

    tips = relationship("Tip", lazy="dynamic", back_populates="creator", cascade="all, delete-orphan")
    creator = relationship("Creator", back_populates="profile")
 