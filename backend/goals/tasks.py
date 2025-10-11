from datetime import timedelta
import logging
from django.utils import timezone
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from .models import Goal

log = logging.getLogger(__name__)


def _send_push_stub(user, title: str):
    # TODO: integrate Expo push API; for now, just log
    log.info("push queued", extra={"user_id": getattr(user, "id", None), "title": title})


def _send_email(user, subject: str, body: str):
    try:
        if not settings.EMAIL_HOST:
            log.info("email skipped (EMAIL_HOST not set)", extra={"user_id": getattr(user, "id", None)})
            return
        if not user.email:
            log.info("email skipped (no user email)", extra={"user_id": getattr(user, "id", None)})
            return
        send_mail(subject, body, settings.EMAIL_HOST_USER or "noreply@localhost", [user.email], fail_silently=True)
    except Exception as e:
        log.warning("email send failed: %s", str(e)[:200])


@shared_task
def run_reminder_scan():
    now = timezone.now()
    qs = Goal.objects.filter(reminder_channel__in=["PUSH", "EMAIL", "BOTH"]).filter(reminder_at__isnull=False).filter(reminder_at__lte=now)
    count = 0
    for g in qs.select_related("user"):
        try:
            # Avoid repeated sends when repeat is NONE
            if g.reminder_repeat == "NONE" and g.last_reminded_at:
                continue
            title = f"Reminder: {g.title}"
            body = f"It's time to work on '{g.title}'."
            if g.reminder_channel in ("PUSH", "BOTH"):
                _send_push_stub(g.user, title)
            if g.reminder_channel in ("EMAIL", "BOTH"):
                _send_email(g.user, subject=title, body=body)

            # Schedule next reminder if repeating
            if g.reminder_repeat == "DAILY":
                g.reminder_at = (g.reminder_at or now) + timedelta(days=1)
            elif g.reminder_repeat == "WEEKLY":
                g.reminder_at = (g.reminder_at or now) + timedelta(days=7)
            g.last_reminded_at = now
            g.save(update_fields=["reminder_at", "last_reminded_at"])
            count += 1
        except Exception as e:
            log.warning("reminder error: %s", str(e)[:200])
    log.info("reminder scan completed", extra={"sent": count})
    return count

