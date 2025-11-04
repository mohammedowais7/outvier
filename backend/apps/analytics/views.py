from rest_framework import viewsets, permissions
from .models import (
    AnalyticsSource, AnalyticsMetric, AnalyticsData, Dashboard,
    DashboardWidget, AnalyticsReport, UserActivity
)


class AnalyticsSourceViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsSource.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class AnalyticsMetricViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsMetric.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class DashboardViewSet(viewsets.ModelViewSet):
    queryset = Dashboard.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class DashboardWidgetViewSet(viewsets.ModelViewSet):
    queryset = DashboardWidget.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class AnalyticsReportViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsReport.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserActivity.objects.all()
    permission_classes = [permissions.IsAuthenticated]
