from app.core.config import get_app_settings

settings = get_app_settings()

if not settings.database_url:
    raise RuntimeError("DATABASE_URL is not set. Cannot start the application without it.")
