from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Event(models.Model):
    """
    Event model for community events, webinars, meetups, etc.
    """
    EVENT_TYPES = [
        ('webinar', 'Webinar'),
        ('workshop', 'Workshop'),
        ('meetup', 'Meetup'),
        ('conference', 'Conference'),
        ('training', 'Training'),
        ('networking', 'Networking'),
        ('social', 'Social Event'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    # Basic information
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500)
    
    # Event details
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Organizer
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    organizers = models.ManyToManyField(User, blank=True, related_name='organized_events')
    
    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Location
    is_virtual = models.BooleanField(default=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    virtual_meeting_url = models.URLField(blank=True, null=True)
    virtual_meeting_id = models.CharField(max_length=100, blank=True, null=True)
    virtual_meeting_password = models.CharField(max_length=100, blank=True, null=True)
    
    # Mentor-specific fields
    is_mentor_event = models.BooleanField(default=False, help_text="Event created by a mentor")
    mentor_notes = models.TextField(blank=True, null=True, help_text="Special notes from mentor")
    max_mentees = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum mentees for this event")
    requires_approval = models.BooleanField(default=False, help_text="Requires mentor approval to join")
    
    # Registration
    requires_registration = models.BooleanField(default=True)
    max_attendees = models.PositiveIntegerField(null=True, blank=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    
    # External integration
    eventbrite_id = models.CharField(max_length=100, blank=True, null=True)
    eventbrite_url = models.URLField(blank=True, null=True)
    
    # Media
    cover_image = models.ImageField(upload_to='events/covers/', blank=True, null=True)
    gallery = models.JSONField(default=list)
    
    # Settings
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    allow_comments = models.BooleanField(default=True)
    
    # Statistics
    view_count = models.PositiveIntegerField(default=0)
    registration_count = models.PositiveIntegerField(default=0)
    attendance_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['-start_date']
    
    def __str__(self):
        return self.title


class EventRegistration(models.Model):
    """
    Event registrations
    """
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    
    # Registration details
    registration_message = models.TextField(blank=True, null=True)
    dietary_requirements = models.TextField(blank=True, null=True)
    accessibility_needs = models.TextField(blank=True, null=True)
    
    # Attendance tracking
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    
    # Feedback
    feedback_rating = models.PositiveIntegerField(null=True, blank=True)  # 1-5
    feedback_comments = models.TextField(blank=True, null=True)
    
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_registrations'
        unique_together = ['event', 'user']
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.user.username} registered for {self.event.title}"
