"""
URL configuration for DNC platform project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    # Django built-in admin moved to a separate path
    path('django-admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/community/', include('apps.community.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/forum/', include('apps.forum.urls')),
    path('api/integrations/', include('apps.integrations.urls')),
    path('api/outvier/', include('apps.outvier.urls')),
    
    # Authentication pages
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('password-reset/', TemplateView.as_view(template_name='auth/password_reset.html'), name='password_reset'),
    path('logout/', views.logout_view, name='logout'),
    
    # User pages
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', TemplateView.as_view(template_name='users/profile.html'), name='user_profile'),
    
    # Admin pages (custom admin dashboard at /admin/)
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/analytics/', views.admin_analytics, name='admin_analytics'),
    
    # Community pages
    path('community/', views.community_directory, name='community_directory'),
    path('community/member/<int:user_id>/', views.member_profile, name='member_profile'),
    path('community/connect/<int:user_id>/', views.connect_request, name='connect_request'),
    
    # Project pages
    path('projects/', views.ProjectListView.as_view(), name='projects_listing'),
    path('projects/create/', views.project_create, name='project_create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:project_id>/apply/', views.project_apply, name='project_apply'),
    
    # Event pages
    path('events/', views.EventListView.as_view(), name='events_listing'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event_detail'),
    path('events/<int:event_id>/register/', views.event_register, name='event_register'),
    
    # Forum pages
    path('forum/', views.CategoryListView.as_view(), name='forum_categories'),
    path('forum/category/<int:category_id>/', views.TopicListView.as_view(), name='forum_topics'),
    path('forum/topic/<int:pk>/', views.TopicDetailView.as_view(), name='topic_detail'),
    path('forum/category/<int:category_id>/create/', views.topic_create, name='topic_create'),
    path('forum/topic/<int:topic_id>/post/', views.post_create, name='post_create'),
    
    # Documentation
    path('api/docs/', TemplateView.as_view(template_name='api_docs.html'), name='api_docs'),
    
    # Home page
    path('', views.home, name='home'),
    
    # Analytics
    path('analytics/', views.analytics_dashboard, name='analytics_dashboard'),
    
    # Error pages
    path('error/', include('apps.core.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Add Django Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
