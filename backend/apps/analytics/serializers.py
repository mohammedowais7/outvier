from rest_framework import serializers
from .models import (
    AnalyticsSource, AnalyticsMetric, AnalyticsData, Dashboard,
    DashboardWidget, AnalyticsReport, UserActivity
)


class AnalyticsSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsSource
        fields = '__all__'


class AnalyticsMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsMetric
        fields = '__all__'


class AnalyticsDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsData
        fields = '__all__'


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = '__all__'


class DashboardWidgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardWidget
        fields = '__all__'


class AnalyticsReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsReport
        fields = '__all__'


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = '__all__'
