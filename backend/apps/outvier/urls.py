from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'outvier'

router = DefaultRouter()
router.register(r'profiles', views.PersonalProfileViewSet, basename='profile')
router.register(r'goals', views.GoalViewSet, basename='goal')
router.register(r'matches', views.TeamMatchViewSet, basename='match')
router.register(r'pathways', views.GrowthPathwayViewSet, basename='pathway')
router.register(r'pathway-steps', views.PathwayStepViewSet, basename='pathway-step')
router.register(r'learning-progress', views.LearningProgressViewSet, basename='learning-progress')
router.register(r'achievements', views.AchievementViewSet, basename='achievement')
router.register(r'learning-streaks', views.LearningStreakViewSet, basename='learning-streak')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'notification-preferences', views.NotificationPreferenceViewSet, basename='notification-preference')
router.register(r'notification-schedules', views.NotificationScheduleViewSet, basename='notification-schedule')
router.register(r'insights', views.ProgressInsightViewSet, basename='insight')
router.register(r'dashboard', views.OutvierDashboardViewSet, basename='dashboard')
router.register(r'mentor-events', views.MentorEventViewSet, basename='mentor-event')
router.register(r'mentor-event-registrations', views.MentorEventRegistrationViewSet, basename='mentor-event-registration')
router.register(r'user-groups', views.UserGroupViewSet, basename='user-group')
router.register(r'user-matching', views.UserMatchingViewSet, basename='user-matching')

urlpatterns = [
    path('', include(router.urls)),
]
