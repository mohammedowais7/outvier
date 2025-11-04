from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IntegrationViewSet, SyncLogViewSet

router = DefaultRouter()
router.register(r'integrations', IntegrationViewSet)
router.register(r'sync-logs', SyncLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
