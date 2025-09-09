from app.core import settings

def build_s3_url(key: str) -> str:
    return f"https://{settings.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{key}"