import logging
import time
import uuid
from typing import Callable
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest, HttpResponse
import json
from .logutils import set_request_id, get_request_id, redact_obj


request_logger = logging.getLogger("api.request")


class RequestIDMiddleware(MiddlewareMixin):
    def process_request(self, request: HttpRequest):
        rid = request.META.get("HTTP_X_REQUEST_ID") or uuid.uuid4().hex
        set_request_id(rid)
        # Expose on request for downstream usage
        setattr(request, "request_id", rid)

    def process_response(self, request: HttpRequest, response: HttpResponse):
        rid = getattr(request, "request_id", get_request_id())
        if rid:
            response["X-Request-ID"] = rid
        return response


class APILoggingMiddleware(MiddlewareMixin):
    def process_request(self, request: HttpRequest):
        request._start_ts = time.time()
        user_repr = getattr(request, "user", None)
        user_id = getattr(user_repr, "id", None) if user_repr and user_repr.is_authenticated else None
        payload_preview = None
        if request.method in {"POST", "PUT", "PATCH"}:
            ctype = (request.META.get("CONTENT_TYPE") or "").split(";")[0]
            try:
                raw = request.body or b""
                if ctype == "application/json" and raw:
                    parsed = json.loads(raw.decode("utf-8", errors="ignore"))
                    payload_preview = redact_obj(parsed)
                else:
                    # log first 2KB safely
                    payload_preview = f"{len(raw)} bytes" if raw else "<empty>"
            except Exception:
                payload_preview = "<unreadable>"
        elif request.method == "GET":
            try:
                payload_preview = redact_obj(dict(request.GET)) if request.GET else None
            except Exception:
                payload_preview = None

        msg = "request start"
        if payload_preview is not None:
            try:
                snippet = payload_preview
                if isinstance(snippet, (dict, list)):
                    snippet = json.dumps(snippet)[:2000]
                msg = f"request start payload={snippet}"
            except Exception:
                pass
        request_logger.info(
            msg,
            extra={
                "method": request.method,
                "path": request.get_full_path(),
                "user_id": user_id,
                "remote_addr": request.META.get("REMOTE_ADDR"),
            },
        )

    def process_response(self, request: HttpRequest, response: HttpResponse):
        try:
            duration_ms = int((time.time() - getattr(request, "_start_ts", time.time())) * 1000)
        except Exception:
            duration_ms = -1
        user_repr = getattr(request, "user", None)
        user_id = getattr(user_repr, "id", None) if user_repr and user_repr.is_authenticated else None
        request_logger.info(
            "request end",
            extra={
                "method": getattr(request, "method", "-"),
                "path": getattr(request, "path", "-"),
                "status": getattr(response, "status_code", -1),
                "user_id": user_id,
                "duration_ms": duration_ms,
            },
        )
        return response
