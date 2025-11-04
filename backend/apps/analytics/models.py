from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AnalyticsSource(models.Model):
    """
    Different sources of analytics data
    """
    SOURCE_TYPES = [
        ('google_analytics', 'Google Analytics'),
        ('social_media', 'Social Media'),
        ('wordpress', 'WordPress'),
        ('discourse', 'Discourse'),
        ('internal', 'Internal Platform'),
        ('salesforce', 'Salesforce'),
        ('quickbooks', 'QuickBooks'),
    ]
    
    name = models.CharField(max_length=100)
    source_type = models.CharField(max_length=30, choices=SOURCE_TYPES)
    description = models.TextField(blank=True, null=True)
    
    # API Configuration
    api_endpoint = models.URLField(blank=True, null=True)
    api_key = models.CharField(max_length=200, blank=True, null=True)
    api_secret = models.CharField(max_length=200, blank=True, null=True)
    
    # Connection settings
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_frequency = models.PositiveIntegerField(default=3600)  # seconds
    
    # Metadata
    configuration = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analytics_sources'
        verbose_name = 'Analytics Source'
        verbose_name_plural = 'Analytics Sources'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_source_type_display()})"


class AnalyticsMetric(models.Model):
    """
    Different types of metrics that can be tracked
    """
    METRIC_TYPES = [
        ('page_views', 'Page Views'),
        ('unique_visitors', 'Unique Visitors'),
        ('session_duration', 'Session Duration'),
        ('bounce_rate', 'Bounce Rate'),
        ('conversion_rate', 'Conversion Rate'),
        ('user_registrations', 'User Registrations'),
        ('active_users', 'Active Users'),
        ('social_engagement', 'Social Engagement'),
        ('revenue', 'Revenue'),
        ('mentorship_sessions', 'Mentorship Sessions'),
        ('project_contributions', 'Project Contributions'),
        ('community_engagement', 'Community Engagement'),
    ]
    
    name = models.CharField(max_length=100)
    metric_type = models.CharField(max_length=30, choices=METRIC_TYPES)
    description = models.TextField(blank=True, null=True)
    
    # Metric configuration
    unit = models.CharField(max_length=20, default='count')  # count, percentage, duration, etc.
    aggregation_type = models.CharField(
        max_length=20,
        choices=[
            ('sum', 'Sum'),
            ('average', 'Average'),
            ('count', 'Count'),
            ('min', 'Minimum'),
            ('max', 'Maximum'),
        ],
        default='sum'
    )
    
    # Display settings
    display_name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#007bff')
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_metrics'
        verbose_name = 'Analytics Metric'
        verbose_name_plural = 'Analytics Metrics'
        ordering = ['metric_type', 'name']
    
    def __str__(self):
        return f"{self.display_name} ({self.get_metric_type_display()})"


class AnalyticsData(models.Model):
    """
    Raw analytics data from various sources
    """
    source = models.ForeignKey(AnalyticsSource, on_delete=models.CASCADE, related_name='data')
    metric = models.ForeignKey(AnalyticsMetric, on_delete=models.CASCADE, related_name='data')
    
    # Data values
    value = models.DecimalField(max_digits=15, decimal_places=4)
    date = models.DateTimeField()
    
    # Additional dimensions
    dimensions = models.JSONField(default=dict)  # Additional data like page, user, etc.
    
    # Metadata
    raw_data = models.JSONField(default=dict)  # Original data from source
    processed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_data'
        verbose_name = 'Analytics Data Point'
        verbose_name_plural = 'Analytics Data'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['source', 'metric', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.source.name} - {self.metric.display_name}: {self.value} ({self.date})"


class Dashboard(models.Model):
    """
    User-created dashboards for analytics visualization
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Dashboard settings
    is_public = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    
    # Layout configuration
    layout_config = models.JSONField(default=dict)
    
    # Access control
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_dashboards')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_dashboards')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dashboards'
        verbose_name = 'Dashboard'
        verbose_name_plural = 'Dashboards'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class DashboardWidget(models.Model):
    """
    Widgets within dashboards
    """
    WIDGET_TYPES = [
        ('line_chart', 'Line Chart'),
        ('bar_chart', 'Bar Chart'),
        ('pie_chart', 'Pie Chart'),
        ('metric_card', 'Metric Card'),
        ('table', 'Table'),
        ('gauge', 'Gauge'),
        ('heatmap', 'Heatmap'),
    ]
    
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE, related_name='widgets')
    name = models.CharField(max_length=200)
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPES)
    
    # Data configuration
    metrics = models.ManyToManyField(AnalyticsMetric, related_name='widgets')
    sources = models.ManyToManyField(AnalyticsSource, blank=True, related_name='widgets')
    
    # Display configuration
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    position_x = models.PositiveIntegerField(default=0)
    position_y = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=4)
    height = models.PositiveIntegerField(default=3)
    
    # Chart configuration
    chart_config = models.JSONField(default=dict)
    
    # Filters
    date_range = models.JSONField(default=dict)  # Start and end dates
    filters = models.JSONField(default=dict)  # Additional filters
    
    # Settings
    refresh_interval = models.PositiveIntegerField(default=300)  # seconds
    is_visible = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dashboard_widgets'
        verbose_name = 'Dashboard Widget'
        verbose_name_plural = 'Dashboard Widgets'
        ordering = ['position_y', 'position_x']
    
    def __str__(self):
        return f"{self.dashboard.name}: {self.title}"


class AnalyticsReport(models.Model):
    """
    Scheduled analytics reports
    """
    REPORT_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Report configuration
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf')
    
    # Data sources
    dashboards = models.ManyToManyField(Dashboard, blank=True)
    metrics = models.ManyToManyField(AnalyticsMetric, blank=True)
    
    # Scheduling
    is_scheduled = models.BooleanField(default=True)
    next_run = models.DateTimeField(null=True, blank=True)
    last_run = models.DateTimeField(null=True, blank=True)
    
    # Recipients
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_reports')
    recipients = models.ManyToManyField(User, related_name='report_recipients')
    
    # Settings
    is_active = models.BooleanField(default=True)
    include_charts = models.BooleanField(default=True)
    include_raw_data = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analytics_reports'
        verbose_name = 'Analytics Report'
        verbose_name_plural = 'Analytics Reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class UserActivity(models.Model):
    """
    Track user activities for internal analytics
    """
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('page_view', 'Page View'),
        ('profile_update', 'Profile Update'),
        ('skill_added', 'Skill Added'),
        ('connection_made', 'Connection Made'),
        ('project_joined', 'Project Joined'),
        ('event_attended', 'Event Attended'),
        ('forum_post', 'Forum Post'),
        ('mentorship_session', 'Mentorship Session'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    
    # Activity details
    description = models.TextField(blank=True, null=True)
    page_url = models.URLField(blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Additional data
    metadata = models.JSONField(default=dict)
    
    # Device and location info
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    referrer = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'activity_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username}: {self.get_activity_type_display()} ({self.created_at})"
