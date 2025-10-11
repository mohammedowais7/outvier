from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    progress = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    # Reminders and scheduling
    due_at = models.DateTimeField(null=True, blank=True)
    reminder_at = models.DateTimeField(null=True, blank=True)
    REMINDER_CHANNEL_CHOICES = (
        ("NONE", "None"),
        ("PUSH", "Push"),
        ("EMAIL", "Email"),
        ("BOTH", "Both"),
    )
    reminder_channel = models.CharField(max_length=8, choices=REMINDER_CHANNEL_CHOICES, default="NONE")
    REMINDER_REPEAT_CHOICES = (
        ("NONE", "None"),
        ("DAILY", "Daily"),
        ("WEEKLY", "Weekly"),
    )
    reminder_repeat = models.CharField(max_length=8, choices=REMINDER_REPEAT_CHOICES, default="NONE")
    timezone_str = models.CharField(max_length=64, default="UTC")
    last_reminded_at = models.DateTimeField(null=True, blank=True)
    def __str__(self): return self.title


class GoalParticipant(models.Model):
    ROLE_CHOICES = (
        ("OWNER", "Owner"),
        ("EDITOR", "Editor"),
        ("VIEWER", "Viewer"),
    )
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="goal_participation")
    role = models.CharField(max_length=8, choices=ROLE_CHOICES, default="VIEWER")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("goal", "user")
