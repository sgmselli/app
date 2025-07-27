from app.core.settings.app import AppSettings

class DevelopmentSettings(AppSettings):
    debug: bool = True