from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ProjectCategory(models.Model):
    """
    Categories for projects
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=7, default='#007bff')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_categories'
        verbose_name = 'Project Category'
        verbose_name_plural = 'Project Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """
    Main project model
    """
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
        ('members_only', 'Members Only'),
    ]
    
    # Basic information
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500)
    
    # Project details
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    
    # Project management
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    project_lead = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_projects')
    
    # Timeline
    start_date = models.DateTimeField(null=True, blank=True)
    expected_end_date = models.DateTimeField(null=True, blank=True)
    actual_end_date = models.DateTimeField(null=True, blank=True)
    
    # Project goals and requirements
    goals = models.JSONField(default=list)  # List of project goals
    required_skills = models.ManyToManyField('users.Skill', blank=True, related_name='required_for_projects')
    preferred_skills = models.ManyToManyField('users.Skill', blank=True, related_name='preferred_for_projects')
    
    # Project settings
    max_team_size = models.PositiveIntegerField(null=True, blank=True)
    requires_approval = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Project statistics
    view_count = models.PositiveIntegerField(default=0)
    application_count = models.PositiveIntegerField(default=0)
    member_count = models.PositiveIntegerField(default=0)
    
    # Media
    cover_image = models.ImageField(upload_to='projects/covers/', blank=True, null=True)
    gallery = models.JSONField(default=list)  # List of image URLs
    
    # External links
    repository_url = models.URLField(blank=True, null=True)
    demo_url = models.URLField(blank=True, null=True)
    documentation_url = models.URLField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def is_completed(self):
        return self.status == 'completed'


class ProjectMember(models.Model):
    """
    Project team members
    """
    ROLE_CHOICES = [
        ('lead', 'Project Lead'),
        ('developer', 'Developer'),
        ('designer', 'Designer'),
        ('analyst', 'Analyst'),
        ('tester', 'Tester'),
        ('contributor', 'Contributor'),
        ('mentor', 'Mentor'),
        ('observer', 'Observer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('removed', 'Removed'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='contributor')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Member details
    responsibilities = models.TextField(blank=True, null=True)
    time_commitment = models.CharField(
        max_length=20,
        choices=[
            ('part_time', 'Part Time'),
            ('full_time', 'Full Time'),
            ('volunteer', 'Volunteer'),
            ('as_needed', 'As Needed'),
        ],
        default='volunteer'
    )
    weekly_hours = models.PositiveIntegerField(default=0)
    
    # Application details
    application_message = models.TextField(blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Performance tracking
    contribution_score = models.PositiveIntegerField(default=0)
    last_contribution = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'project_members'
        unique_together = ['project', 'user']
        verbose_name = 'Project Member'
        verbose_name_plural = 'Project Members'
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.user.username} in {self.project.title} ({self.get_role_display()})"


class ProjectMilestone(models.Model):
    """
    Project milestones and deliverables
    """
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Milestone details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        default='medium'
    )
    
    # Timeline
    due_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Assignment
    assigned_to = models.ManyToManyField(User, blank=True, related_name='assigned_milestones')
    
    # Dependencies
    depends_on = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='dependents')
    
    # Progress tracking
    progress_percentage = models.PositiveIntegerField(default=0)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    actual_hours = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_milestones'
        verbose_name = 'Project Milestone'
        verbose_name_plural = 'Project Milestones'
        ordering = ['due_date', 'priority']
    
    def __str__(self):
        return f"{self.project.title}: {self.title}"


class ProjectUpdate(models.Model):
    """
    Project updates and progress reports
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='updates')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_updates')
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Update type
    update_type = models.CharField(
        max_length=20,
        choices=[
            ('progress', 'Progress Update'),
            ('milestone', 'Milestone Reached'),
            ('issue', 'Issue/Blocking'),
            ('announcement', 'Announcement'),
            ('general', 'General Update'),
        ],
        default='progress'
    )
    
    # Related milestone (optional)
    related_milestone = models.ForeignKey(ProjectMilestone, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Media
    attachments = models.JSONField(default=list)  # List of file URLs
    
    # Engagement
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    
    # Visibility
    is_pinned = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_updates'
        verbose_name = 'Project Update'
        verbose_name_plural = 'Project Updates'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.project.title}: {self.title}"


class ProjectApplication(models.Model):
    """
    Project applications from users
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_applications')
    
    # Application details
    message = models.TextField()
    relevant_experience = models.TextField()
    time_commitment = models.CharField(
        max_length=20,
        choices=[
            ('part_time', 'Part Time'),
            ('full_time', 'Full Time'),
            ('volunteer', 'Volunteer'),
            ('as_needed', 'As Needed'),
        ]
    )
    weekly_hours = models.PositiveIntegerField()
    start_date = models.DateTimeField(null=True, blank=True)
    
    # Application status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    review_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'project_applications'
        unique_together = ['project', 'applicant']
        verbose_name = 'Project Application'
        verbose_name_plural = 'Project Applications'
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.applicant.username} applied to {self.project.title}"
