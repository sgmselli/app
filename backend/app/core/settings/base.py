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
    access_secret_key: str
    refresh_secret_key: str
    jwt_encryption_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30


