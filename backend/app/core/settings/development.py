from app.core.settings.app import AppSettings
from pydantic_settings import SettingsConfigDict

class DevelopmentSettings(AppSettings):
    debug: bool = True
    database_url: str = "postgresql://postgres:password@db:5432/tiptubedb"
    frontend_url: str = "http://localhost:3000"
    stripe_connect_return_url: str = "http://localhost:3000/bank/connect/success"
    stripe_connect_refresh_url: str = "http://localhost3000/bank/connect?result=cancel"
    model_config = SettingsConfigDict(
        env_file='.env'
    )