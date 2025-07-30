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
