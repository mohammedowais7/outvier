from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone as django_timezone


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
        ('mentor', 'Mentor'),
        ('mentee', 'Mentee'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending Approval'),
    ]
    
    # Basic profile information
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Professional information
    company = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    years_experience = models.PositiveIntegerField(default=0)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    
    # Community engagement
    reputation_score = models.PositiveIntegerField(default=0)
    total_contributions = models.PositiveIntegerField(default=0)
    last_active = models.DateTimeField(default=django_timezone.now)
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    newsletter_subscription = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_mentor(self):
        return self.role in ['mentor', 'admin', 'moderator']
    
    def is_mentee(self):
        return self.role in ['mentee', 'member']


class Skill(models.Model):
    """
    Skills that users can have
    """
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'skills'
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class UserSkill(models.Model):
    """
    Many-to-many relationship between users and skills with proficiency levels
    """
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='user_skills')
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='beginner')
    years_experience = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_skills')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_skills'
        unique_together = ['user', 'skill']
        verbose_name = 'User Skill'
        verbose_name_plural = 'User Skills'
    
    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.get_proficiency_level_display()})"


class Certification(models.Model):
    """
    Certifications that users can have
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    credential_id = models.CharField(max_length=100, blank=True, null=True)
    credential_url = models.URLField(blank=True, null=True)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_certifications')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'certifications'
        verbose_name = 'Certification'
        verbose_name_plural = 'Certifications'
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"


class UserPreference(models.Model):
    """
    User preferences for matching and notifications
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Matching preferences
    interested_in_mentoring = models.BooleanField(default=False)
    interested_in_being_mentored = models.BooleanField(default=True)
    preferred_mentor_skills = models.ManyToManyField(Skill, blank=True, related_name='mentor_preferences')
    preferred_mentee_skills = models.ManyToManyField(Skill, blank=True, related_name='mentee_preferences')
    
    # Communication preferences
    preferred_communication_method = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Email'),
            ('sms', 'SMS'),
            ('platform', 'Platform Messages'),
        ],
        default='email'
    )
    
    # Availability
    timezone = models.CharField(max_length=50, default='UTC')
    available_hours_start = models.TimeField(default='09:00')
    available_hours_end = models.TimeField(default='17:00')
    available_days = models.JSONField(default=list)  # List of days of week
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'User Preference'
        verbose_name_plural = 'User Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.username}"
