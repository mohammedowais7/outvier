from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import NotificationDevice
from .serializers import NotificationDeviceSerializer


class NotificationDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NotificationDevice.objects.filter(user=self.request.user).order_by("-last_seen")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="test")
    def send_test(self, request):
        # Placeholder endpoint; integrate push send in a worker later.
        return Response({"status": "queued"}, status=status.HTTP_202_ACCEPTED)

