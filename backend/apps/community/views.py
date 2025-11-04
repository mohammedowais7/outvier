from rest_framework import viewsets, permissions
from .models import Connection, Mentorship, CommunityGroup, ActivityFeed, Achievement
from .serializers import (
    ConnectionSerializer,
    MentorshipSerializer,
    CommunityGroupSerializer,
    ActivityFeedSerializer,
    AchievementSerializer,
)


class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]


class MentorshipViewSet(viewsets.ModelViewSet):
    queryset = Mentorship.objects.all()
    serializer_class = MentorshipSerializer
    permission_classes = [permissions.IsAuthenticated]


class CommunityGroupViewSet(viewsets.ModelViewSet):
    queryset = CommunityGroup.objects.all()
    serializer_class = CommunityGroupSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ActivityFeedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityFeed.objects.all()
    serializer_class = ActivityFeedSerializer
    permission_classes = [permissions.IsAuthenticated]


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
