import os
import logging

celery_app = None
try:
    if os.getenv("DISABLE_CELERY", "False") != "True":
        from .celery import app as celery_app  # type: ignore
except Exception as e:
    logging.getLogger(__name__).warning("Celery not available: %s", str(e))

__all__ = ("celery_app",)
