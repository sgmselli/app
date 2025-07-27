from enum import Enum
from pydantic_settings import BaseSettings, SettingsConfigDict

class AppEnvTypes(Enum):
    PRODUCTION: str = 'PRODUCTION'
    DEVELOPMENT: str = 'DEVELOPMENT'
    TEST: str = 'TEST'

class BaseAppSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env')
    app_env: AppEnvTypes = AppEnvTypes.DEVELOPMENT
    database_url: str
