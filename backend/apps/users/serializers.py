from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, Skill, UserSkill, Certification, UserPreference


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    full_name = serializers.ReadOnlyField()
    user_skills = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'status', 'bio', 'avatar', 'phone', 'location', 'timezone',
            'company', 'job_title', 'years_experience', 'linkedin_url',
            'github_url', 'portfolio_url', 'reputation_score',
            'total_contributions', 'last_active', 'user_skills',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reputation_score', 'total_contributions',
            'last_active', 'created_at', 'updated_at'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'bio', 'phone',
            'location', 'company', 'job_title', 'years_experience'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates
    """
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'bio', 'avatar', 'phone', 'location', 'timezone',
            'company', 'job_title', 'years_experience', 'linkedin_url',
            'github_url', 'portfolio_url', 'email_notifications',
            'sms_notifications', 'newsletter_subscription'
        ]
        read_only_fields = ['id', 'username']


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs


class SkillSerializer(serializers.ModelSerializer):
    """
    Serializer for Skill model
    """
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSkillSerializer(serializers.ModelSerializer):
    """
    Serializer for UserSkill model
    """
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True)
    
    class Meta:
        model = UserSkill
        fields = [
            'id', 'user', 'skill', 'skill_name', 'skill_category',
            'proficiency_level', 'years_experience', 'is_verified',
            'verified_by', 'verified_by_username', 'verified_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'verified_by', 'verified_at', 'created_at'
        ]


class CertificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Certification model
    """
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True)
    
    class Meta:
        model = Certification
        fields = [
            'id', 'user', 'name', 'issuing_organization', 'credential_id',
            'credential_url', 'issue_date', 'expiry_date', 'is_verified',
            'verified_by', 'verified_by_username', 'verified_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'verified_by', 'verified_at', 'created_at'
        ]


class UserPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for UserPreference model
    """
    preferred_mentor_skills_names = serializers.StringRelatedField(
        source='preferred_mentor_skills', many=True, read_only=True
    )
    preferred_mentee_skills_names = serializers.StringRelatedField(
        source='preferred_mentee_skills', many=True, read_only=True
    )
    
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'interested_in_mentoring', 'interested_in_being_mentored',
            'preferred_mentor_skills', 'preferred_mentor_skills_names',
            'preferred_mentee_skills', 'preferred_mentee_skills_names',
            'preferred_communication_method', 'timezone',
            'available_hours_start', 'available_hours_end', 'available_days',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
