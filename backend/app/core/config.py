from app.core.settings.base import AppEnvTypes, BaseAppSettings
from app.core.settings.app import AppSettings
from app.core.settings.development import DevelopmentSettings
from app.core.settings.production import ProductionSettings
from app.core.settings.test import TestSettings

from functools import lru_cache

environments: dict[AppEnvTypes, type[AppSettings]] = {
    AppEnvTypes.PRODUCTION: ProductionSettings,
    AppEnvTypes.DEVELOPMENT: DevelopmentSettings,
    AppEnvTypes.TEST: TestSettings,
}

@lru_cache
def get_app_settings() -> AppSettings:
    app_env = BaseAppSettings().app_env
    config = environments[app_env]
    return config()
