from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Custom error pages
    path('error/<str:error_code>/', views.CustomErrorView.as_view(), name='custom_error'),
    
    # Specific error routes
    path('400/', views.error_400, name='error_400'),
    path('401/', views.error_401, name='error_401'),
    path('403/', views.error_403, name='error_403'),
    path('404/', views.error_404, name='error_404'),
    path('500/', views.error_500, name='error_500'),
    path('502/', views.error_502, name='error_502'),
    path('503/', views.error_503, name='error_503'),
    path('504/', views.error_504, name='error_504'),
]

