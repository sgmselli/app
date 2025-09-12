from fastapi import FastAPI
from fastapi.exceptions import StarletteHTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.core import settings
from app.api.v1 import api_router
from app.utils.exceptions.custom_exceptions import FieldValidationError
from app.utils.exceptions.request_exceptions import http_exception_handler, validation_exception_handler, \
    field_validation_exception_handler


def create_app() -> FastAPI:

    _app = FastAPI(**settings.fast_api_kwargs)

    _app.include_router(api_router, prefix=settings.api_v1_prefix)

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allow_origins, 
        allow_credentials=settings.allow_credentials,  
        allow_methods=settings.allow_methods, 
        allow_headers=settings.allow_headers,  
    )

    @_app.exception_handler(StarletteHTTPException)
    async def custom_starlette_http_exception_handler(request, exc):
        return await http_exception_handler(request, exc)

    @_app.exception_handler(RequestValidationError)
    async def custom_validation_handler(request, exc):
        return await validation_exception_handler(request, exc)

    @_app.exception_handler(FieldValidationError)
    async def custom_field_validation_handler(request, exc):
        return await field_validation_exception_handler(request, exc)

    return _app

app = create_app()