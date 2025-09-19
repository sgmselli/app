from fastapi import HTTPException
from uuid import uuid4
import os

from app.core import settings
from app.utils.logging import Logger, LogLevel

def build_s3_url(key: str) -> str:
    return f"https://{settings.cloud_front_url}/{key}"

def upload_profile_picture_to_s3(s3_client, user_id, filename, file):
    profile_picture_key = f"{user_id}/profile_picture/{unify_filename(filename)}"
    if not s3_client.upload_fileobj(profile_picture_key, file):
        raise ValueError("Error uploading profile picture")
    return profile_picture_key

def upload_profile_banner_to_s3(s3_client, user_id, filename, file):
    profile_banner_key = f"{user_id}/profile_banner/{unify_filename(filename)}"
    if not s3_client.upload_fileobj(profile_banner_key, file):
        raise ValueError("Error uploading profile banner")
    return profile_banner_key

def delete_profile_picture_from_s3(s3_client, key):
    if not s3_client.delete_object(key):
        Logger.log(LogLevel.ERROR, "Error deleting profile picture")
    return key

def delete_profile_banner_from_s3(s3_client, key):
    if not s3_client.delete_object(key):
        Logger.log(LogLevel.ERROR, "Error deleting profile banner")
    return key

def unify_filename(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    return f"{name}_{uuid4().hex}{ext}"