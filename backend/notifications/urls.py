from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationDeviceViewSet

router = DefaultRouter()
router.register(r"notifications/devices", NotificationDeviceViewSet, basename="notification-devices")

urlpatterns = [
    path("", include(router.urls)),
]

