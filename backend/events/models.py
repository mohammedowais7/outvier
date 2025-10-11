from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_events")
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    is_public = models.BooleanField(default=False)
    location = models.CharField(max_length=255, blank=True)
    capacity = models.IntegerField(blank=True, null=True)
    calendar_sync_enabled = models.BooleanField(default=False)
    google_event_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class EventParticipant(models.Model):
    STATUS_CHOICES = (
        ("GOING", "Going"),
        ("INTERESTED", "Interested"),
        ("DECLINED", "Declined"),
    )
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_participation")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="GOING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "user")

