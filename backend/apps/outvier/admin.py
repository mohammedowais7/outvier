from django.contrib import admin
from .models import (
    PersonalProfile, Goal, GoalMilestone, TeamMatch, 
    GrowthPathway, ProgressInsight
)


@admin.register(PersonalProfile)
class PersonalProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'personality_type', 'is_complete', 'last_updated']
    list_filter = ['is_complete', 'personality_type', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['created_at', 'last_updated']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Personality Assessment', {
            'fields': ('personality_type', 'communication_style', 'work_preference')
        }),
        ('AI Insights', {
            'fields': ('strengths', 'weaknesses', 'opportunities', 'growth_areas')
        }),
        ('Assessment Scores', {
            'fields': ('leadership_score', 'technical_score', 'creativity_score', 'collaboration_score')
        }),
        ('Status', {
            'fields': ('is_complete', 'created_at', 'last_updated')
        }),
    )


class GoalMilestoneInline(admin.TabularInline):
    model = GoalMilestone
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'goal_type', 'priority', 'progress_percentage', 'is_completed', 'target_date']
    list_filter = ['goal_type', 'priority', 'is_completed', 'created_at']
    search_fields = ['title', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [GoalMilestoneInline]
    
    fieldsets = (
        ('Goal Information', {
            'fields': ('user', 'title', 'description', 'goal_type', 'priority')
        }),
        ('Timeline', {
            'fields': ('start_date', 'target_date', 'completed_date')
        }),
        ('Progress', {
            'fields': ('progress_percentage', 'is_completed')
        }),
        ('Related Items', {
            'fields': ('related_skills', 'related_project')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(TeamMatch)
class TeamMatchAdmin(admin.ModelAdmin):
    list_display = ['user', 'match_type', 'compatibility_score', 'is_active', 'is_accepted', 'created_at']
    list_filter = ['match_type', 'is_active', 'is_accepted', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'match_reason']
    readonly_fields = ['created_at', 'updated_at', 'accepted_at']
    filter_horizontal = ['matched_users', 'required_skills', 'project_categories']
    
    fieldsets = (
        ('Match Information', {
            'fields': ('user', 'match_type', 'matched_users')
        }),
        ('Matching Criteria', {
            'fields': ('required_skills', 'preferred_roles', 'project_categories')
        }),
        ('Match Quality', {
            'fields': ('compatibility_score', 'match_reason', 'suggested_roles')
        }),
        ('Status', {
            'fields': ('is_active', 'is_accepted', 'accepted_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(GrowthPathway)
class GrowthPathwayAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'pathway_type', 'difficulty_level', 'current_step', 'total_steps', 'is_completed']
    list_filter = ['pathway_type', 'difficulty_level', 'is_completed', 'created_at']
    search_fields = ['title', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    filter_horizontal = ['required_skills', 'recommended_projects']
    
    fieldsets = (
        ('Pathway Information', {
            'fields': ('user', 'title', 'description', 'pathway_type', 'difficulty_level')
        }),
        ('Learning Resources', {
            'fields': ('required_skills', 'recommended_projects', 'learning_resources')
        }),
        ('Progress', {
            'fields': ('current_step', 'total_steps', 'is_completed', 'completed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ProgressInsight)
class ProgressInsightAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'insight_type', 'is_positive', 'is_read', 'confidence_score', 'created_at']
    list_filter = ['insight_type', 'is_positive', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Insight Information', {
            'fields': ('user', 'insight_type', 'title', 'message')
        }),
        ('Related Items', {
            'fields': ('related_goal', 'related_match', 'related_pathway')
        }),
        ('Insight Metadata', {
            'fields': ('confidence_score', 'is_positive', 'is_read')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )


@admin.register(GoalMilestone)
class GoalMilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'goal', 'target_date', 'is_completed', 'completed_date']
    list_filter = ['is_completed', 'created_at']
    search_fields = ['title', 'goal__title', 'goal__user__first_name', 'goal__user__last_name']
    readonly_fields = ['created_at']
