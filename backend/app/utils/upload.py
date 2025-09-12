from fastapi import UploadFile, HTTPException, status

from app.utils.exceptions.custom_exceptions import FieldValidationError

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

async def validate_uploaded_image(image: UploadFile, field: str):
    if not image:
        return
    if image.content_type not in ALLOWED_TYPES:
        raise FieldValidationError(
            field=field,
            message=f"Invalid file type: {image.content_type}. Allowed types: JPEG, PNG, WEBP."
        )
    contents = await image.read()
    if len(contents) > MAX_FILE_SIZE:
        raise FieldValidationError(
            field=field,
            message=f"File too large. Max size is {MAX_FILE_SIZE // (1024 * 1024)} MB."
        )
    image.file.seek(0)