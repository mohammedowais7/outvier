from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ForumCategoryViewSet,
    ForumTopicViewSet,
    ForumPostViewSet,
)

router = DefaultRouter()
router.register(r'categories', ForumCategoryViewSet)
router.register(r'topics', ForumTopicViewSet)
router.register(r'posts', ForumPostViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
