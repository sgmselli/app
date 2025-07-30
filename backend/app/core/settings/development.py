from app.core.settings.app import AppSettings
from pydantic_settings import SettingsConfigDict

class DevelopmentSettings(AppSettings):
    debug: bool = True
    database_url: str = "postgresql://postgres:password@db:5432/guitardb"
    model_config = SettingsConfigDict(
        env_file='.env'
    )