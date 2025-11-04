from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConnectionViewSet,
    MentorshipViewSet,
    CommunityGroupViewSet,
    ActivityFeedViewSet,
    AchievementViewSet,
)

router = DefaultRouter()
router.register(r'connections', ConnectionViewSet)
router.register(r'mentorships', MentorshipViewSet)
router.register(r'groups', CommunityGroupViewSet)
router.register(r'activities', ActivityFeedViewSet)
router.register(r'achievements', AchievementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
