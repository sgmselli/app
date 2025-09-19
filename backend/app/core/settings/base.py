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
    debug: Optional[bool] = None
    database_url: Optional[str] = None
    frontend_url: Optional[str] = None
    access_secret_key: Optional[str] = None
    refresh_secret_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_connect_return_url: Optional[str] = None
    stripe_connect_failed_url: Optional[str] = None
    stripe_connect_success_url: Optional[str] = None
    stripe_checkout_return_url: Optional[str] = None
    stripe_checkout_refresh_url: Optional[str] = None
    application_fee_percentage: float = 0.15
    stripe_webhook_secret: Optional[str] = None
    redis_host: Optional[str] = None
    redis_port: Optional[int] = None
    redis_db: Optional[int] = None
    redis_password: Optional[str] = None
    send_grid_api_key: Optional[str] = None
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    jwt_encryption_algorithm: str = "HS256"
    from_email: str = "noreply@tubetip.co"
    aws_region: str = "eu-west-2"
    bucket_name: str = "tubetip-dev"
    cloud_front_url: str = "d357a07t61on3p.cloudfront.net"


