from pydantic import ConfigDict
from app.core.settings.base import BaseAppSettings
from typing import Any

class AppSettings(BaseAppSettings):
    model_config = ConfigDict(
        validate_assignment = True
    )

    #Fast api kwargs
    debug: bool = False
    title: str = 'Guitar song finder'
    docs_url: str = '/docs'
    version: str = '1.0.0'

    #Backend kwargs
    api_v1_prefix: str = '/api/v1'
    allowed_hosts: list[str] = ['*']
    
    @property
    def fast_api_kwargs(self) -> dict[str, Any]:
        return {
            "debug": self.debug,
            "docs_url": self.docs_url,
            "title": self.title,
            "version": self.version 
        }

