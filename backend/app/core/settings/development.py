from app.core.settings.app import AppSettings
from pydantic_settings import SettingsConfigDict

class DevelopmentSettings(AppSettings):
    debug: bool = True
    frontend_url: str = "http://localhost:80"
    stripe_connect_return_url: str = "http://localhost:8000/api/v1/stripe/connect/callback"
    stripe_connect_success_url: str = "http://localhost:80/bank/connect/success"
    stripe_connect_failed_url: str = "http://localhost:80/bank/connect?result=cancel"
    application_fee_percentage: float = 0.15
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0

    model_config = SettingsConfigDict(
        env_file='.env'
    )