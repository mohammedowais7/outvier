from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Skill, UserSkill, Certification, UserPreference


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'full_name', 'role', 'status', 'reputation_score', 'last_active', 'is_staff')
    list_filter = ('role', 'status', 'is_staff', 'is_superuser', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'company')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('role', 'status', 'bio', 'avatar', 'phone', 'location', 'timezone')
        }),
        ('Professional Information', {
            'fields': ('company', 'job_title', 'years_experience', 'linkedin_url', 'github_url', 'portfolio_url')
        }),
        ('Community Engagement', {
            'fields': ('reputation_score', 'total_contributions', 'last_active')
        }),
        ('Preferences', {
            'fields': ('email_notifications', 'sms_notifications', 'newsletter_subscription')
        }),
    )
    
    readonly_fields = ('reputation_score', 'total_contributions', 'created_at', 'updated_at')
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'category', 'description')
    ordering = ('category', 'name')


class UserSkillInline(admin.TabularInline):
    model = UserSkill
    extra = 0
    fields = ('skill', 'proficiency_level', 'years_experience', 'is_verified')
    readonly_fields = ('verified_by', 'verified_at')


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'proficiency_level', 'years_experience', 'is_verified', 'created_at')
    list_filter = ('proficiency_level', 'is_verified', 'skill__category', 'created_at')
    search_fields = ('user__username', 'skill__name')
    ordering = ('-created_at',)
    
    def save_model(self, request, obj, form, change):
        if not change and obj.is_verified:
            obj.verified_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'issuing_organization', 'issue_date', 'expiry_date', 'is_verified')
    list_filter = ('is_verified', 'issuing_organization', 'issue_date', 'created_at')
    search_fields = ('user__username', 'name', 'issuing_organization', 'credential_id')
    ordering = ('-issue_date',)
    
    def save_model(self, request, obj, form, change):
        if not change and obj.is_verified:
            obj.verified_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'interested_in_mentoring', 'interested_in_being_mentored', 'preferred_communication_method')
    list_filter = ('interested_in_mentoring', 'interested_in_being_mentored', 'preferred_communication_method')
    search_fields = ('user__username',)
    filter_horizontal = ('preferred_mentor_skills', 'preferred_mentee_skills')
