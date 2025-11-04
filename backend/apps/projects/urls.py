from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    ProjectCategoryViewSet,
    ProjectMemberViewSet,
    ProjectMilestoneViewSet,
    ProjectUpdateViewSet,
    ProjectApplicationViewSet,
)

router = DefaultRouter()
router.register(r'categories', ProjectCategoryViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'members', ProjectMemberViewSet)
router.register(r'milestones', ProjectMilestoneViewSet)
router.register(r'updates', ProjectUpdateViewSet)
router.register(r'applications', ProjectApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
