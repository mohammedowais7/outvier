from rest_framework import serializers
from .models import Event, EventParticipant


class EventSerializer(serializers.ModelSerializer):
    going_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "start_at",
            "end_at",
            "is_public",
            "location",
            "capacity",
            "calendar_sync_enabled",
            "google_event_id",
            "created_at",
            "going_count",
        ]

    def get_going_count(self, obj):
        return obj.participants.filter(status="GOING").count()


class EventParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = ["id", "event", "user", "status", "created_at"]
        read_only_fields = ["user", "created_at"]

