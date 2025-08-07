from app.core.settings.app import AppSettings

class ProductionSettings(AppSettings):
    debug: bool = False
    stripe_return_url: str = "https://www.app.com/stripe/connect/success"
    stripe_refresh_url: str = "https://www.app.com/stripe/connect/failure"