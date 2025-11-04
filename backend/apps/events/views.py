from rest_framework import viewsets, permissions
from apps.users.permissions import IsAuthenticatedOrReadOnly, IsMentorOrAdmin, IsMemberOrAbove
from .models import Event, EventRegistration


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    # Only mentors/moderators/admin can create/update; everyone can read
    permission_classes = [IsMentorOrAdmin]


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all()
    permission_classes = [IsMemberOrAbove]
