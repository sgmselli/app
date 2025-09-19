from app.core.settings.app import AppSettings

class ProductionSettings(AppSettings):
    debug: bool = False
    frontend_url: str = "https://www.tubtip.co"
    stripe_connect_return_url: str = "https://www.tubtip.co/api/v1/stripe/connect/callback"
    stripe_connect_success_url: str = "https://www.tubtip.co/bank/connect/success"
    stripe_connect_failed_url: str = "https://www.tubtip.co/bank/connect?result=cancel"
    application_fee_percentage: float = 0.15
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0


