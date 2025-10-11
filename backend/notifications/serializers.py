from rest_framework import serializers
from .models import NotificationDevice


class NotificationDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationDevice
        fields = ["id", "expo_push_token", "platform", "device_id", "last_seen"]

