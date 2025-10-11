from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Event, EventParticipant
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(Q(is_public=True) | Q(creator=user) | Q(participants__user=user)).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=["get"], url_path="public")
    def public(self, request):
        qs = Event.objects.filter(is_public=True).order_by("-created_at")
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(ser.data)
        return Response(ser.data)

    @action(detail=True, methods=["post"], url_path="rsvp")
    def rsvp(self, request, pk=None):
        event = self.get_object()
        status_value = request.data.get("status", "GOING")
        if status_value not in {"GOING", "INTERESTED", "DECLINED"}:
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        obj, _ = EventParticipant.objects.update_or_create(
            event=event, user=request.user, defaults={"status": status_value}
        )
        return Response({"status": obj.status})

