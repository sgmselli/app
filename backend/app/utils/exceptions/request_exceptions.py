from typing import List
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.exceptions import StarletteHTTPException
from datetime import datetime, timezone

from app.utils.constants.http_codes import (
    HTTP_422_UNPROCESSABLE_ENTITY
)
from app.utils.exceptions.custom_exceptions import FieldValidationError


def format_error_response(request: Request, status_code: int, detail: List[dict[str, str]]):
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status_code,
        "errors": detail,
        "path": request.url.path,
    }

async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    body = format_error_response(request, exc.status_code, [{"field": None, "message": exc.detail}])
    return JSONResponse(content=body, status_code=exc.status_code)

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for err in exc.errors():
        msg = err["msg"]
        if msg.lower().startswith("value error, "):
            msg = msg[len("value error, "):]
        loc = [str(loc) for loc in err["loc"] if isinstance(loc, (str, int))]
        if loc and loc[0] == "body":
            loc = loc[1:]
        errors.append({
            "field": ".".join(loc),
            "message": msg
        })
    body = format_error_response(request, HTTP_422_UNPROCESSABLE_ENTITY, errors)
    return JSONResponse(content=body, status_code=HTTP_422_UNPROCESSABLE_ENTITY)

async def field_validation_exception_handler(request: Request, exc: FieldValidationError) -> JSONResponse:
    body = format_error_response(
        request,
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=[{"field": exc.field, "message": exc.message}]
    )
    return JSONResponse(content=body, status_code=status.HTTP_400_BAD_REQUEST)