from app.core.settings.app import AppSettings
from pydantic_settings import SettingsConfigDict

class DevelopmentSettings(AppSettings):
    debug: bool = True
    database_url: str = "postgresql://postgres:password@db:5432/guitardb"
    frontend_url: str = "http://localhost:3000"
    stripe_return_url: str = "http://localhost:3000/bank/connect/success"
    stripe_refresh_url: str = "http://localhost:3000/bank/connect/failure"
    model_config = SettingsConfigDict(
        env_file='.env'
    )