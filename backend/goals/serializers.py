from rest_framework import serializers
from .models import Goal, GoalParticipant
class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = [
            "id",
            "title",
            "progress",
            "created_at",
            "due_at",
            "reminder_at",
            "reminder_channel",
            "reminder_repeat",
            "timezone_str",
        ]


class GoalParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalParticipant
        fields = ["id", "user", "role", "added_at"]
        read_only_fields = ["added_at"]
