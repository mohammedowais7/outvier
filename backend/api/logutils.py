import logging
from contextvars import ContextVar
from typing import Any, Dict


_request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


def set_request_id(rid: str) -> None:
    _request_id_ctx.set(rid)


def get_request_id() -> str:
    return _request_id_ctx.get()


class RequestIDFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Inject request_id into every log record
        record.request_id = get_request_id()
        return True


REDACT_KEYS = {"password", "current_password", "new_password", "token", "access", "refresh"}


def redact_value(key: str, value: Any) -> Any:
    try:
        if key.lower() in REDACT_KEYS:
            return "***"
        return value
    except Exception:
        return value


def redact_obj(obj: Any) -> Any:
    try:
        if isinstance(obj, dict):
            return {k: redact_obj(redact_value(k, v)) for k, v in obj.items()}
        if isinstance(obj, list):
            return [redact_obj(i) for i in obj]
        return obj
    except Exception:
        return obj

