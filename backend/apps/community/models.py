from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Connection(models.Model):
    """
    Connections between users (mentor-mentee relationships, collaborations, etc.)
    """
    CONNECTION_TYPES = [
        ('mentor_mentee', 'Mentor-Mentee'),
        ('collaboration', 'Collaboration'),
        ('peer', 'Peer Connection'),
        ('friend', 'Friend'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('blocked', 'Blocked'),
    ]
    
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_connections')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_connections')
    connection_type = models.CharField(max_length=20, choices=CONNECTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'connections'
        unique_together = ['from_user', 'to_user']
        verbose_name = 'Connection'
        verbose_name_plural = 'Connections'
    
    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} ({self.get_connection_type_display()})"


class Mentorship(models.Model):
    """
    Mentorship relationships with specific goals and tracking
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]
    
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentoring_relationships')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_relationships')
    connection = models.OneToOneField(Connection, on_delete=models.CASCADE, related_name='mentorship')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    goals = models.JSONField(default=list)  # List of mentorship goals
    skills_focus = models.ManyToManyField('users.Skill', blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    expected_duration_weeks = models.PositiveIntegerField(default=12)
    
    # Meeting preferences
    meeting_frequency = models.CharField(
        max_length=20,
        choices=[
            ('weekly', 'Weekly'),
            ('biweekly', 'Bi-weekly'),
            ('monthly', 'Monthly'),
            ('as_needed', 'As Needed'),
        ],
        default='weekly'
    )
    preferred_meeting_duration = models.PositiveIntegerField(default=60)  # minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorships'
        verbose_name = 'Mentorship'
        verbose_name_plural = 'Mentorships'
    
    def __str__(self):
        return f"{self.mentor.username} mentoring {self.mentee.username}: {self.title}"


class MentorshipSession(models.Model):
    """
    Individual mentorship sessions
    """
    mentorship = models.ForeignKey(Mentorship, on_delete=models.CASCADE, related_name='sessions')
    scheduled_date = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    
    agenda = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    action_items = models.JSONField(default=list)
    mentee_feedback = models.TextField(blank=True, null=True)
    mentor_feedback = models.TextField(blank=True, null=True)
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorship_sessions'
        verbose_name = 'Mentorship Session'
        verbose_name_plural = 'Mentorship Sessions'
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"Session {self.id} - {self.mentorship.title} ({self.scheduled_date})"


class CommunityGroup(models.Model):
    """
    Community groups for specific interests or skills
    """
    name = models.CharField(max_length=200)
    description = models.TextField()
    slug = models.SlugField(unique=True)
    
    # Group settings
    is_public = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=False)
    max_members = models.PositiveIntegerField(null=True, blank=True)
    
    # Group focus
    focus_skills = models.ManyToManyField('users.Skill', blank=True)
    focus_areas = models.JSONField(default=list)  # List of focus areas
    
    # Group management
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_community_groups')
    moderators = models.ManyToManyField(User, blank=True, related_name='moderated_groups')
    
    # Group statistics
    member_count = models.PositiveIntegerField(default=0)
    post_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'community_groups'
        verbose_name = 'Community Group'
        verbose_name_plural = 'Community Groups'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    """
    Membership in community groups
    """
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('left', 'Left'),
    ]
    
    group = models.ForeignKey(CommunityGroup, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'group_memberships'
        unique_together = ['group', 'user']
        verbose_name = 'Group Membership'
        verbose_name_plural = 'Group Memberships'
    
    def __str__(self):
        return f"{self.user.username} in {self.group.name} ({self.get_role_display()})"


class ActivityFeed(models.Model):
    """
    Activity feed for community engagement
    """
    ACTIVITY_TYPES = [
        ('connection_made', 'Connection Made'),
        ('mentorship_started', 'Mentorship Started'),
        ('session_completed', 'Session Completed'),
        ('skill_added', 'Skill Added'),
        ('certification_earned', 'Certification Earned'),
        ('group_joined', 'Group Joined'),
        ('project_joined', 'Project Joined'),
        ('achievement_earned', 'Achievement Earned'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Related objects (polymorphic)
    related_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='related_activities')
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    
    # Metadata
    metadata = models.JSONField(default=dict)
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activity_feeds'
        verbose_name = 'Activity Feed'
        verbose_name_plural = 'Activity Feeds'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.title}"


class Achievement(models.Model):
    """
    Achievements and badges for community members
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='achievements/', blank=True, null=True)
    category = models.CharField(max_length=50)
    
    # Achievement criteria
    criteria_type = models.CharField(
        max_length=30,
        choices=[
            ('connections', 'Number of Connections'),
            ('mentorship_sessions', 'Mentorship Sessions Completed'),
            ('skills_verified', 'Skills Verified'),
            ('certifications', 'Certifications Earned'),
            ('group_participation', 'Group Participation'),
            ('project_contributions', 'Project Contributions'),
        ]
    )
    criteria_value = models.PositiveIntegerField()
    criteria_metadata = models.JSONField(default=dict)
    
    # Achievement settings
    is_active = models.BooleanField(default=True)
    is_rare = models.BooleanField(default=False)
    points_value = models.PositiveIntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'achievements'
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """
    User achievements tracking
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_achievements')
    earned_at = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']
        verbose_name = 'User Achievement'
        verbose_name_plural = 'User Achievements'
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.username} earned {self.achievement.name}"
