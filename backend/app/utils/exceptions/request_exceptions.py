from fastapi.exceptions import StarletteHTTPException 
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    body = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status":exc.status_code,
        "error": exc.detail,
        "path": request.url.path
    }
    return JSONResponse(content=body, status_code=exc.status_code)