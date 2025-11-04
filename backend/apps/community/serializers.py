from rest_framework import serializers
from .models import Connection, Mentorship, CommunityGroup, ActivityFeed, Achievement


class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = '__all__'


class MentorshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentorship
        fields = '__all__'


class CommunityGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityGroup
        fields = '__all__'


class ActivityFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityFeed
        fields = '__all__'


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'
