from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnalyticsSourceViewSet,
    AnalyticsMetricViewSet,
    DashboardViewSet,
    DashboardWidgetViewSet,
    AnalyticsReportViewSet,
    UserActivityViewSet,
)

router = DefaultRouter()
router.register(r'sources', AnalyticsSourceViewSet)
router.register(r'metrics', AnalyticsMetricViewSet)
router.register(r'dashboards', DashboardViewSet)
router.register(r'widgets', DashboardWidgetViewSet)
router.register(r'reports', AnalyticsReportViewSet)
router.register(r'activities', UserActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
