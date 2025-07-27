import enum
from datetime import datetime, timezone

class LogLevel(enum.Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    ERROR = "ERROR"
    WARN = "WARN"

class Logger:
    
    @staticmethod
    def log(log_level: LogLevel, msg: str):
        print(f"({datetime.now(timezone.utc).isoformat()}) {log_level.value}: {msg}")