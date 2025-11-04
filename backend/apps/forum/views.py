from rest_framework import viewsets, permissions
from apps.users.permissions import IsAuthenticatedOrReadOnly, IsMemberOrAbove
from .models import ForumCategory, ForumTopic, ForumPost


class ForumCategoryViewSet(viewsets.ModelViewSet):
    queryset = ForumCategory.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]


class ForumTopicViewSet(viewsets.ModelViewSet):
    queryset = ForumTopic.objects.all()
    permission_classes = [IsMemberOrAbove]


class ForumPostViewSet(viewsets.ModelViewSet):
    queryset = ForumPost.objects.all()
    permission_classes = [IsMemberOrAbove]
