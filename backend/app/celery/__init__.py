from celery import Celery

from app.core import settings

redis_url = f"redis://{settings.redis_host}:{settings.redis_port}/{settings.redis_db}"

celery_task_queue = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url,
    include=["app.celery.tasks"]
)