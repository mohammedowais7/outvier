from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import Skill
from apps.projects.models import ProjectCategory

User = get_user_model()


class PersonalProfile(models.Model):
    """AI-driven personal profiling for DNC members"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='outvier_profile')
    
    # Personality & Skills Assessment
    personality_type = models.CharField(max_length=50, blank=True, null=True)
    communication_style = models.CharField(max_length=50, blank=True, null=True)
    work_preference = models.CharField(max_length=50, blank=True, null=True)
    
    # AI Insights
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    opportunities = models.JSONField(default=list, blank=True)
    growth_areas = models.JSONField(default=list, blank=True)
    
    # Assessment Scores (1-10 scale)
    leadership_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5
    )
    technical_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5
    )
    creativity_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5
    )
    collaboration_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5
    )
    
    # Profile Status
    is_complete = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Personal Profile"
        verbose_name_plural = "Personal Profiles"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Profile"


class Goal(models.Model):
    """Personal and professional goals for DNC members"""
    GOAL_TYPES = [
        ('personal', 'Personal Development'),
        ('professional', 'Professional Growth'),
        ('skill', 'Skill Development'),
        ('project', 'Project Completion'),
        ('network', 'Networking'),
        ('learning', 'Learning Goal'),
        ('fitness', 'Health & Fitness'),
        ('financial', 'Financial Goal'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outvier_goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='not_started')
    
    # Goal Timeline
    start_date = models.DateField()
    target_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    
    # Progress Tracking
    progress_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    is_completed = models.BooleanField(default=False)
    
    # Goal Metrics
    target_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Target value for measurable goals")
    current_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Current progress value")
    unit = models.CharField(max_length=20, blank=True, help_text="Unit of measurement (e.g., hours, books, kg)")
    
    # Related Skills/Projects
    related_skills = models.ManyToManyField(Skill, blank=True)
    related_project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True)
    related_pathway = models.ForeignKey('GrowthPathway', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Goal Settings
    is_public = models.BooleanField(default=False, help_text="Share goal with community")
    allow_mentorship = models.BooleanField(default=True, help_text="Allow others to mentor this goal")
    reminder_frequency = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('none', 'No Reminders'),
    ], default='weekly')
    
    # Analytics
    time_spent = models.IntegerField(default=0, help_text="Total time spent in minutes")
    last_activity = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', 'target_date']
        verbose_name = "Goal"
        verbose_name_plural = "Goals"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"
    
    @property
    def days_remaining(self):
        """Calculate days remaining until target date"""
        from django.utils import timezone
        today = timezone.now().date()
        if self.target_date:
            delta = self.target_date - today
            return delta.days
        return 0
    
    @property
    def is_overdue(self):
        """Check if goal is overdue"""
        return self.days_remaining < 0 and not self.is_completed
    
    @property
    def progress_status(self):
        """Get progress status based on completion and timeline"""
        if self.is_completed:
            return 'completed'
        elif self.is_overdue:
            return 'overdue'
        elif self.days_remaining <= 7:
            return 'urgent'
        elif self.progress_percentage >= 75:
            return 'almost_done'
        else:
            return 'on_track'


class GoalMilestone(models.Model):
    """Milestones for tracking goal progress"""
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['target_date']
        verbose_name = "Goal Milestone"
        verbose_name_plural = "Goal Milestones"
    
    def __str__(self):
        return f"{self.goal.title} - {self.title}"


class TeamMatch(models.Model):
    """Intelligent team matching for DNC members"""
    MATCH_TYPES = [
        ('project', 'Project Collaboration'),
        ('mentorship', 'Mentorship'),
        ('peer_learning', 'Peer Learning'),
        ('skill_exchange', 'Skill Exchange'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outvier_matches')
    match_type = models.CharField(max_length=20, choices=MATCH_TYPES)
    
    # Matched Users
    matched_users = models.ManyToManyField(User, related_name='matched_with', blank=True)
    
    # Matching Criteria
    required_skills = models.ManyToManyField(Skill, blank=True)
    preferred_roles = models.JSONField(default=list, blank=True)
    project_categories = models.ManyToManyField(ProjectCategory, blank=True)
    
    # Match Quality Score (1-10)
    compatibility_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5
    )
    
    # Match Status
    is_active = models.BooleanField(default=True)
    is_accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    is_public = models.BooleanField(default=False, help_text="Show this match to anonymous users")
    
    # AI Recommendations
    match_reason = models.TextField(blank=True)
    suggested_roles = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-compatibility_score', '-created_at']
        verbose_name = "Team Match"
        verbose_name_plural = "Team Matches"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.match_type} Match"


class GrowthPathway(models.Model):
    """Personalized growth pathways for DNC members"""
    PATHWAY_TYPES = [
        ('ai_ml', 'AI & Machine Learning'),
        ('devops', 'DevOps & Cloud'),
        ('web_dev', 'Web Development'),
        ('mobile_dev', 'Mobile Development'),
        ('data_science', 'Data Science'),
        ('cybersecurity', 'Cybersecurity'),
        ('digital_marketing', 'Digital Marketing'),
        ('ui_ux', 'UI/UX Design'),
        ('blockchain', 'Blockchain'),
        ('iot', 'Internet of Things'),
        ('leadership', 'Leadership & Management'),
        ('entrepreneurship', 'Entrepreneurship'),
    ]
    
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outvier_pathways')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Pathway Structure
    pathway_type = models.CharField(max_length=50, choices=PATHWAY_TYPES)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ])
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='not_started')
    
    # Learning Resources
    required_skills = models.ManyToManyField(Skill, blank=True)
    recommended_projects = models.ManyToManyField('projects.Project', blank=True)
    learning_resources = models.JSONField(default=list, blank=True)
    
    # Progress Tracking
    current_step = models.IntegerField(default=0)
    total_steps = models.IntegerField(default=1)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Pathway Settings
    estimated_duration = models.IntegerField(default=30, help_text="Estimated duration in days")
    is_public = models.BooleanField(default=False, help_text="Share pathway with community")
    allow_collaboration = models.BooleanField(default=True, help_text="Allow others to join this pathway")
    
    # Analytics
    total_time_spent = models.IntegerField(default=0, help_text="Total time spent in minutes")
    last_activity = models.DateTimeField(null=True, blank=True)
    completion_rate = models.FloatField(default=0.0, help_text="Completion rate percentage")
    
    # Learning Preferences
    preferred_learning_style = models.CharField(max_length=20, choices=[
        ('visual', 'Visual'),
        ('auditory', 'Auditory'),
        ('kinesthetic', 'Hands-on'),
        ('reading', 'Reading/Writing'),
        ('mixed', 'Mixed'),
    ], default='mixed')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Growth Pathway"
        verbose_name_plural = "Growth Pathways"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage based on completed steps"""
        if self.total_steps == 0:
            return 0
        return int((self.current_step / self.total_steps) * 100)
    
    @property
    def estimated_completion_date(self):
        """Estimate completion date based on current progress and learning pace"""
        from django.utils import timezone
        if self.is_completed or self.current_step == 0:
            return None
        
        remaining_steps = self.total_steps - self.current_step
        if self.total_time_spent > 0 and self.current_step > 0:
            avg_time_per_step = self.total_time_spent / self.current_step
            estimated_remaining_time = remaining_steps * avg_time_per_step
            # Convert minutes to days (assuming 2 hours per day)
            estimated_days = estimated_remaining_time / (2 * 60)
            return timezone.now().date() + timezone.timedelta(days=int(estimated_days))
        
        return None
    
    @property
    def learning_velocity(self):
        """Calculate learning velocity (steps per week)"""
        if self.current_step == 0:
            return 0
        
        from django.utils import timezone
        days_since_start = (timezone.now().date() - self.created_at.date()).days
        if days_since_start == 0:
            return 0
        
        weeks = days_since_start / 7
        return round(self.current_step / weeks, 2) if weeks > 0 else 0


class PathwayStep(models.Model):
    """Individual learning steps within a growth pathway"""
    STEP_TYPES = [
        ('reading', 'Reading Material'),
        ('video', 'Video Tutorial'),
        ('exercise', 'Practical Exercise'),
        ('quiz', 'Knowledge Check'),
        ('project', 'Project Work'),
        ('discussion', 'Community Discussion'),
    ]
    
    pathway = models.ForeignKey(GrowthPathway, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    
    # Learning Resources
    content_url = models.URLField(blank=True, null=True)
    estimated_duration = models.IntegerField(help_text="Duration in minutes", default=30)
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False)
    
    # Progress Tracking
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completion_notes = models.TextField(blank=True)
    
    # Assessment
    has_quiz = models.BooleanField(default=False)
    passing_score = models.IntegerField(default=70, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['pathway', 'step_number']
        unique_together = ['pathway', 'step_number']
        verbose_name = "Pathway Step"
        verbose_name_plural = "Pathway Steps"
    
    def __str__(self):
        return f"{self.pathway.title} - Step {self.step_number}: {self.title}"


class LearningProgress(models.Model):
    """Track detailed learning progress for pathway steps"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_progress')
    pathway_step = models.ForeignKey(PathwayStep, on_delete=models.CASCADE, related_name='user_progress')
    
    # Progress Data
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent = models.IntegerField(default=0, help_text="Time spent in minutes")
    
    # Assessment Results
    quiz_score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    quiz_attempts = models.IntegerField(default=0)
    
    # User Feedback
    difficulty_rating = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1=Very Easy, 5=Very Hard"
    )
    helpfulness_rating = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1=Not Helpful, 5=Very Helpful"
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['user', 'pathway_step']
        verbose_name = "Learning Progress"
        verbose_name_plural = "Learning Progress"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.pathway_step.title}"


class Achievement(models.Model):
    """Achievement system for goals and pathways"""
    ACHIEVEMENT_TYPES = [
        ('goal_completion', 'Goal Completion'),
        ('pathway_completion', 'Pathway Completion'),
        ('milestone_reached', 'Milestone Reached'),
        ('streak_achieved', 'Learning Streak'),
        ('skill_mastered', 'Skill Mastery'),
        ('community_contributor', 'Community Contributor'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outvier_achievements')
    achievement_type = models.CharField(max_length=30, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default='star')
    
    # Related Data
    related_goal = models.ForeignKey(Goal, on_delete=models.SET_NULL, null=True, blank=True)
    related_pathway = models.ForeignKey(GrowthPathway, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Achievement Data
    points_earned = models.IntegerField(default=10)
    is_unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-unlocked_at', '-created_at']
        verbose_name = "Achievement"
        verbose_name_plural = "Achievements"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class LearningStreak(models.Model):
    """Track learning streaks for motivation"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_streaks')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Streak Goals
    target_streak = models.IntegerField(default=7)
    streak_goal_achieved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Learning Streak"
        verbose_name_plural = "Learning Streaks"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.current_streak} day streak"


class Notification(models.Model):
    """System notifications for users"""
    NOTIFICATION_TYPES = [
        ('goal_reminder', 'Goal Reminder'),
        ('goal_deadline', 'Goal Deadline'),
        ('goal_milestone', 'Goal Milestone'),
        ('pathway_reminder', 'Pathway Reminder'),
        ('pathway_step', 'Pathway Step'),
        ('achievement_unlocked', 'Achievement Unlocked'),
        ('streak_reminder', 'Streak Reminder'),
        ('streak_broken', 'Streak Broken'),
        ('match_found', 'Match Found'),
        ('insight_available', 'Insight Available'),
        ('system_update', 'System Update'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outvier_notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Related Data
    related_goal = models.ForeignKey(Goal, on_delete=models.SET_NULL, null=True, blank=True)
    related_pathway = models.ForeignKey(GrowthPathway, on_delete=models.SET_NULL, null=True, blank=True)
    related_achievement = models.ForeignKey(Achievement, on_delete=models.SET_NULL, null=True, blank=True)
    related_match = models.ForeignKey(TeamMatch, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Notification Status
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Action Data
    action_url = models.URLField(blank=True, null=True)
    action_text = models.CharField(max_length=100, blank=True)
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class NotificationPreference(models.Model):
    """User notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Goal Notifications
    goal_reminders = models.BooleanField(default=True)
    goal_deadlines = models.BooleanField(default=True)
    goal_milestones = models.BooleanField(default=True)
    
    # Pathway Notifications
    pathway_reminders = models.BooleanField(default=True)
    pathway_steps = models.BooleanField(default=True)
    
    # Achievement Notifications
    achievements = models.BooleanField(default=True)
    
    # Streak Notifications
    streak_reminders = models.BooleanField(default=True)
    streak_broken = models.BooleanField(default=True)
    
    # Match Notifications
    matches = models.BooleanField(default=True)
    
    # System Notifications
    insights = models.BooleanField(default=True)
    system_updates = models.BooleanField(default=False)
    
    # Delivery Preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    in_app_notifications = models.BooleanField(default=True)
    
    # Timing Preferences
    quiet_hours_start = models.TimeField(default='22:00')
    quiet_hours_end = models.TimeField(default='08:00')
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Frequency
    reminder_frequency = models.CharField(max_length=20, choices=[
        ('immediate', 'Immediate'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
        ('custom', 'Custom'),
    ], default='immediate')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Notification Preference"
        verbose_name_plural = "Notification Preferences"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Notification Preferences"


class NotificationSchedule(models.Model):
    """Scheduled notifications for recurring reminders"""
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_schedules')
    notification_type = models.CharField(max_length=30, choices=Notification.NOTIFICATION_TYPES)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    
    # Scheduling
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    time_of_day = models.TimeField()
    days_of_week = models.JSONField(default=list, blank=True)  # [0,1,2,3,4,5,6] for Mon-Sun
    days_of_month = models.JSONField(default=list, blank=True)  # [1,15,30] for specific days
    
    # Conditions
    is_active = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Related Data
    related_goal = models.ForeignKey(Goal, on_delete=models.CASCADE, null=True, blank=True)
    related_pathway = models.ForeignKey(GrowthPathway, on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Notification Schedule"
        verbose_name_plural = "Notification Schedules"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.notification_type} Schedule"


class ProgressInsight(models.Model):
    """AI-generated insights for member progress tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outvier_insights')
    
    # Insight Data
    insight_type = models.CharField(max_length=50)  # progress, achievement, recommendation
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related Data
    related_goal = models.ForeignKey(Goal, on_delete=models.SET_NULL, null=True, blank=True)
    related_match = models.ForeignKey(TeamMatch, on_delete=models.SET_NULL, null=True, blank=True)
    related_pathway = models.ForeignKey(GrowthPathway, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Insight Metadata
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        default=0.5
    )
    is_positive = models.BooleanField(default=True)
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Progress Insight"
        verbose_name_plural = "Progress Insights"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class MentorEvent(models.Model):
    """Enhanced mentor events with zoom integration and group management"""
    EVENT_TYPES = [
        ('webinar', 'Webinar'),
        ('workshop', 'Workshop'),
        ('mentoring_session', 'Mentoring Session'),
        ('group_discussion', 'Group Discussion'),
        ('skill_share', 'Skill Share'),
        ('networking', 'Networking Event'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.CharField(max_length=500)
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Mentor Information
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_events', limit_choices_to={'role__in': ['mentor', 'admin', 'moderator']})
    co_mentors = models.ManyToManyField(User, blank=True, related_name='co_mentored_events', limit_choices_to={'role__in': ['mentor', 'admin', 'moderator']})
    
    # Event Details
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Virtual Meeting Details
    is_virtual = models.BooleanField(default=True)
    zoom_meeting_url = models.URLField(blank=True, null=True)
    zoom_meeting_id = models.CharField(max_length=100, blank=True, null=True)
    zoom_password = models.CharField(max_length=100, blank=True, null=True)
    meeting_instructions = models.TextField(blank=True, null=True)
    
    # Physical Location (if applicable)
    location = models.CharField(max_length=200, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Group Management
    max_participants = models.PositiveIntegerField(default=10)
    current_participants = models.PositiveIntegerField(default=0)
    requires_approval = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    # Related Goals/Events
    related_goals = models.ManyToManyField(Goal, blank=True, related_name='mentor_events')
    related_skills = models.ManyToManyField(Skill, blank=True)
    
    # Event Materials
    agenda = models.TextField(blank=True, null=True)
    materials = models.JSONField(default=list, blank=True)  # List of file URLs
    recording_url = models.URLField(blank=True, null=True)
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    registration_count = models.PositiveIntegerField(default=0)
    attendance_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = "Mentor Event"
        verbose_name_plural = "Mentor Events"
    
    def __str__(self):
        return f"{self.title} - {self.mentor.get_full_name()}"
    
    @property
    def is_upcoming(self):
        """Check if event is upcoming"""
        from django.utils import timezone
        return self.start_date > timezone.now()
    
    @property
    def spots_remaining(self):
        """Calculate remaining spots"""
        return max(0, self.max_participants - self.current_participants)
    
    @property
    def is_full(self):
        """Check if event is full"""
        return self.current_participants >= self.max_participants


class MentorEventRegistration(models.Model):
    """Registration for mentor events"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('attended', 'Attended'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    ]
    
    event = models.ForeignKey(MentorEvent, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_event_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Registration Details
    motivation = models.TextField(blank=True, null=True, help_text="Why do you want to attend this event?")
    goals = models.TextField(blank=True, null=True, help_text="What do you hope to achieve?")
    experience_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ], default='beginner')
    
    # Mentor Review
    mentor_notes = models.TextField(blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_registrations')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Attendance Tracking
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    
    # Feedback
    feedback_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback_comments = models.TextField(blank=True, null=True)
    
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-registered_at']
        verbose_name = "Mentor Event Registration"
        verbose_name_plural = "Mentor Event Registrations"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title}"


class UserGroup(models.Model):
    """Groups created based on goals and events for collaboration"""
    GROUP_TYPES = [
        ('goal_based', 'Goal-Based Group'),
        ('event_based', 'Event-Based Group'),
        ('skill_based', 'Skill-Based Group'),
        ('mentor_led', 'Mentor-Led Group'),
        ('peer_learning', 'Peer Learning Group'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
        ('disbanded', 'Disbanded'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=200)
    description = models.TextField()
    group_type = models.CharField(max_length=20, choices=GROUP_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Group Management
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(User, related_name='user_groups', through='GroupMembership', through_fields=('group', 'user'))
    mentors = models.ManyToManyField(User, blank=True, related_name='mentored_groups', limit_choices_to={'role__in': ['mentor', 'admin', 'moderator']})
    
    # Related Data
    related_goals = models.ManyToManyField(Goal, blank=True, related_name='user_groups')
    related_events = models.ManyToManyField(MentorEvent, blank=True, related_name='user_groups')
    related_skills = models.ManyToManyField(Skill, blank=True)
    
    # Group Settings
    max_members = models.PositiveIntegerField(default=10)
    is_public = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=False)
    allow_self_join = models.BooleanField(default=True)
    
    # Group Activities
    meeting_schedule = models.JSONField(default=list, blank=True)  # Recurring meeting times
    communication_channel = models.URLField(blank=True, null=True)  # Discord, Slack, etc.
    
    # Analytics
    total_activities = models.PositiveIntegerField(default=0)
    active_members_count = models.PositiveIntegerField(default=0)
    completion_rate = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "User Group"
        verbose_name_plural = "User Groups"
    
    def __str__(self):
        return f"{self.name} ({self.get_group_type_display()})"
    
    @property
    def member_count(self):
        """Get current member count"""
        return self.members.count()
    
    @property
    def is_full(self):
        """Check if group is full"""
        return self.member_count >= self.max_members


class GroupMembership(models.Model):
    """Membership details for user groups"""
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('moderator', 'Moderator'),
        ('mentor', 'Mentor'),
        ('admin', 'Admin'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('removed', 'Removed'),
    ]
    
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Membership Details
    joined_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_memberships')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Activity Tracking
    last_active = models.DateTimeField(null=True, blank=True)
    contribution_score = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['group', 'user']
        ordering = ['-joined_at']
        verbose_name = "Group Membership"
        verbose_name_plural = "Group Memberships"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.group.name} ({self.get_role_display()})"
