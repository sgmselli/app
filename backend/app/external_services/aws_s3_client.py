
import boto3
from botocore.config import Config

from app.core import settings
from app.utils.logging import Logger, LogLevel


class AwsS3Client:

    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            region_name=settings.aws_region,
            config=Config(signature_version="s3v4")
        )
        self.bucket_name = settings.bucket_name

    def upload_fileobj(self, object_name, file):
        Logger.log(LogLevel.INFO, f"Uploading {object_name}, file - {file}")
        try:
            file.seek(0)
            self.s3.upload_fileobj(
                file,
                self.bucket_name,
                object_name,
                ExtraArgs={
                    "CacheControl": "public, max-age=31536000, immutable",
                }
            )
        except Exception as e:
            Logger.log(LogLevel.ERROR, e)
            return False
        return True

    def delete_object(self, object_name: str):
        Logger.log(LogLevel.INFO, f"Deleting {object_name}")
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except Exception as e:
            Logger.log(LogLevel.ERROR, f"Error deleting object {object_name}: {e}")
            return False



