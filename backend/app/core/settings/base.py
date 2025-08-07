from enum import Enum
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from typing import Optional

class AppEnvTypes(Enum):
    PRODUCTION: str = 'PRODUCTION'
    DEVELOPMENT: str = 'DEVELOPMENT'
    TEST: str = 'TEST'

env = os.getenv("APP_ENV", "DEVELOPMENT").upper()

try:
    selected_env = AppEnvTypes(env)
except ValueError:
    selected_env = AppEnvTypes.DEVELOPMENT 

class BaseAppSettings(BaseSettings):
    app_env: AppEnvTypes = selected_env
    database_url: Optional[str] = None
    access_secret_key: str = 'None'
    refresh_secret_key: str = 'None'
    jwt_encryption_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    stripe_secret_key: str
    stripe_connect_return_url: Optional[str] = None
    stripe_connect_refresh_url: Optional[str] = None
    stripe_checkout_return_url: Optional[str] = None
    stripe_checkout_refresh_url: Optional[str] = None
    application_fee_percentage: float = 0.15
    stripe_webhook_secret: Optional[str] = None



