from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.conf import settings
from .models import Integration, SyncLog


def _is_integrations_enabled() -> bool:
    return getattr(settings, 'INTEGRATIONS_API_ENABLED', True)


class IntegrationViewSet(viewsets.ModelViewSet):
    queryset = Integration.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        if not _is_integrations_enabled():
            return Response(
                {
                    'detail': 'Integrations API is currently disabled. This endpoint is preserved for future use.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return super().dispatch(request, *args, **kwargs)


class SyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SyncLog.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        if not _is_integrations_enabled():
            return Response(
                {
                    'detail': 'Integrations API is currently disabled. This endpoint is preserved for future use.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return super().dispatch(request, *args, **kwargs)
