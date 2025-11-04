from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Integration(models.Model):
    """
    Third-party integrations configuration
    """
    INTEGRATION_TYPES = [
        ('salesforce', 'Salesforce'),
        ('quickbooks', 'QuickBooks'),
        ('wordpress', 'WordPress'),
        ('discourse', 'Discourse'),
        ('eventbrite', 'EventBrite'),
        ('google_analytics', 'Google Analytics'),
        ('social_media', 'Social Media'),
        ('email_marketing', 'Email Marketing'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
        ('pending', 'Pending'),
    ]
    
    name = models.CharField(max_length=100)
    integration_type = models.CharField(max_length=30, choices=INTEGRATION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Configuration
    api_endpoint = models.URLField(blank=True, null=True)
    api_key = models.CharField(max_length=200, blank=True, null=True)
    api_secret = models.CharField(max_length=200, blank=True, null=True)
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    
    # Settings
    is_enabled = models.BooleanField(default=True)
    auto_sync = models.BooleanField(default=False)
    sync_frequency = models.PositiveIntegerField(default=3600)  # seconds
    
    # Metadata
    configuration = models.JSONField(default=dict)
    last_sync = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'integrations'
        verbose_name = 'Integration'
        verbose_name_plural = 'Integrations'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_integration_type_display()})"


class SyncLog(models.Model):
    """
    Log of synchronization activities
    """
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('partial', 'Partial Success'),
        ('in_progress', 'In Progress'),
    ]
    
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='sync_logs')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Sync details
    records_processed = models.PositiveIntegerField(default=0)
    records_created = models.PositiveIntegerField(default=0)
    records_updated = models.PositiveIntegerField(default=0)
    records_failed = models.PositiveIntegerField(default=0)
    
    # Error details
    error_message = models.TextField(blank=True, null=True)
    error_details = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'sync_logs'
        verbose_name = 'Sync Log'
        verbose_name_plural = 'Sync Logs'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.integration.name} sync at {self.started_at}"
