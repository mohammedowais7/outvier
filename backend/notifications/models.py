from django.db import models
from django.contrib.auth.models import User


class NotificationDevice(models.Model):
    PLATFORM_CHOICES = (
        ("ios", "iOS"),
        ("android", "Android"),
        ("web", "Web"),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="devices")
    expo_push_token = models.CharField(max_length=255)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default="android")
    device_id = models.CharField(max_length=120, blank=True, null=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("expo_push_token", "user")

    def __str__(self) -> str:
        return f"{self.user.username} - {self.platform}"

