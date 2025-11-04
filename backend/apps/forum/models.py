from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ForumCategory(models.Model):
    """
    Forum categories for organizing discussions
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=7, default='#007bff')
    
    # Category settings
    is_active = models.BooleanField(default=True)
    requires_moderation = models.BooleanField(default=False)
    
    # Permissions
    moderators = models.ManyToManyField(User, blank=True, related_name='moderated_categories')
    
    # Statistics
    topic_count = models.PositiveIntegerField(default=0)
    post_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forum_categories'
        verbose_name = 'Forum Category'
        verbose_name_plural = 'Forum Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ForumTopic(models.Model):
    """
    Forum topics/discussions
    """
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('pinned', 'Pinned'),
        ('archived', 'Archived'),
    ]
    
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='topics')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_topics')
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    
    # Topic settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    
    # Engagement
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    reply_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'forum_topics'
        verbose_name = 'Forum Topic'
        verbose_name_plural = 'Forum Topics'
        ordering = ['-is_pinned', '-last_activity']
    
    def __str__(self):
        return self.title


class ForumPost(models.Model):
    """
    Forum posts (replies to topics)
    """
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    content = models.TextField()
    
    # Post settings
    is_solution = models.BooleanField(default=False)  # Marked as solution
    is_edited = models.BooleanField(default=False)
    
    # Engagement
    like_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forum_posts'
        verbose_name = 'Forum Post'
        verbose_name_plural = 'Forum Posts'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Post by {self.author.username} in {self.topic.title}"
