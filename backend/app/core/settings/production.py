from app.core.settings.app import AppSettings

class ProductionSettings(AppSettings):
    debug: bool = False