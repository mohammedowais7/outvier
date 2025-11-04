from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    UserViewSet,
    SkillViewSet,
    UserSkillViewSet,
    CertificationViewSet,
    UserPreferenceViewSet,
    UserRegistrationView,
    CustomLoginView,
    UserProfileView,
    PasswordChangeView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'user-skills', UserSkillViewSet)
router.register(r'certifications', CertificationViewSet)
router.register(r'preferences', UserPreferenceViewSet)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomLoginView.as_view(), name='custom-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
    
    # API endpoints
    path('', include(router.urls)),
]
