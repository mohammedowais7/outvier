from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q, Avg, Count
from django.utils import timezone
from datetime import date, timedelta

from .models import (
    PersonalProfile, Goal, GoalMilestone, TeamMatch, 
    GrowthPathway, PathwayStep, LearningProgress, Achievement,
    LearningStreak, ProgressInsight, Notification, NotificationPreference,
    NotificationSchedule, MentorEvent, MentorEventRegistration, UserGroup, GroupMembership
)
from .serializers import (
    PersonalProfileSerializer, GoalSerializer, GoalMilestoneSerializer,
    TeamMatchSerializer, GrowthPathwaySerializer, PathwayStepSerializer,
    LearningProgressSerializer, AchievementSerializer, LearningStreakSerializer,
    ProgressInsightSerializer, UserDashboardSerializer, NotificationSerializer,
    NotificationPreferenceSerializer, NotificationScheduleSerializer,
    MentorEventSerializer, MentorEventRegistrationSerializer, UserGroupSerializer,
    GroupMembershipSerializer, UserMatchingSerializer, GroupCreationSerializer
)
from .services import NotificationService, NotificationScheduler
from apps.users.permissions import IsMemberOrAbove, IsMentorOrAdmin
from apps.users.models import Skill
from apps.projects.models import Project, ProjectCategory

User = get_user_model()


class PersonalProfileViewSet(viewsets.ModelViewSet):
    queryset = PersonalProfile.objects.all()
    serializer_class = PersonalProfileSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return PersonalProfile.objects.all()
        return PersonalProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's profile"""
        try:
            profile = PersonalProfile.objects.get(user=request.user)
        except PersonalProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = PersonalProfile.objects.create(user=request.user)
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def complete_assessment(self, request):
        """Complete personality and skills assessment"""
        try:
            profile = PersonalProfile.objects.get(user=request.user)
        except PersonalProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = PersonalProfile.objects.create(user=request.user)
        
        # Update assessment data
        profile.personality_type = request.data.get('personality_type')
        profile.communication_style = request.data.get('communication_style')
        profile.work_preference = request.data.get('work_preference')
        profile.strengths = request.data.get('strengths', [])
        profile.weaknesses = request.data.get('weaknesses', [])
        profile.opportunities = request.data.get('opportunities', [])
        profile.growth_areas = request.data.get('growth_areas', [])
        
        # Update scores
        profile.leadership_score = request.data.get('leadership_score', 5)
        profile.technical_score = request.data.get('technical_score', 5)
        profile.creativity_score = request.data.get('creativity_score', 5)
        profile.collaboration_score = request.data.get('collaboration_score', 5)
        
        profile.is_complete = True
        profile.save()
        
        # Generate initial insights
        self._generate_initial_insights(profile)
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def _generate_initial_insights(self, profile):
        """Generate initial AI insights based on assessment"""
        insights = []
        
        # Strength-based insights
        if profile.leadership_score >= 8:
            insights.append({
                'insight_type': 'recommendation',
                'title': 'Leadership Potential Detected',
                'message': f'Your leadership score of {profile.leadership_score}/10 suggests strong leadership potential. Consider mentoring opportunities and project leadership roles.',
                'confidence_score': 0.9,
                'is_positive': True
            })
        
        # Growth area insights
        if profile.technical_score < 6:
            insights.append({
                'insight_type': 'recommendation',
                'title': 'Technical Skills Development',
                'message': f'Your technical score of {profile.technical_score}/10 indicates room for growth. Consider joining technical projects or taking relevant courses.',
                'confidence_score': 0.8,
                'is_positive': True
            })
        
        # Create insight objects
        for insight_data in insights:
            ProgressInsight.objects.create(
                user=profile.user,
                **insight_data
            )


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Goal.objects.all()
        return Goal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Automatically set the user when creating a goal"""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Override create to provide better error handling"""
        try:
            # Log the incoming data for debugging
            print(f"Creating goal with data: {request.data}")
            print(f"User: {request.user}")
            
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error creating goal: {str(e)}")
            return Response(
                {'detail': f'Error creating goal: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update goal progress"""
        goal = self.get_object()
        progress = request.data.get('progress_percentage', 0)
        
        if not 0 <= progress <= 100:
            return Response(
                {'detail': 'Progress must be between 0 and 100'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        goal.progress_percentage = progress
        if progress == 100:
            goal.is_completed = True
            goal.completed_date = date.today()
        
        goal.save()
        
        # Generate progress insight
        self._generate_progress_insight(goal)
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)
    
    def _generate_progress_insight(self, goal):
        """Generate insights based on goal progress"""
        if goal.progress_percentage == 100:
            ProgressInsight.objects.create(
                user=goal.user,
                insight_type='achievement',
                title='Goal Completed!',
                message=f'Congratulations! You have successfully completed your goal: {goal.title}',
                related_goal=goal,
                confidence_score=1.0,
                is_positive=True
            )
        elif goal.progress_percentage >= 75:
            ProgressInsight.objects.create(
                user=goal.user,
                insight_type='progress',
                title='Almost There!',
                message=f'Great progress on "{goal.title}"! You\'re {goal.progress_percentage}% complete.',
                related_goal=goal,
                confidence_score=0.8,
                is_positive=True
            )


class TeamMatchViewSet(viewsets.ModelViewSet):
    queryset = TeamMatch.objects.all()
    serializer_class = TeamMatchSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return TeamMatch.objects.all()
        
        # If user is authenticated, show their matches
        if self.request.user.is_authenticated:
            return TeamMatch.objects.filter(
                Q(user=self.request.user) | 
                Q(matched_users=self.request.user)
            ).distinct()
        
        # For anonymous users, show public matches (is_public=True)
        return TeamMatch.objects.filter(is_public=True)
    
    @action(detail=False, methods=['post'])
    def find_matches(self, request):
        """Find potential team matches for user"""
        user = request.user
        
        # Get user's skills and preferences
        user_skills = user.user_skills.values_list('skill__name', flat=True)
        preferred_roles = request.data.get('preferred_roles', [])
        match_type = request.data.get('match_type', 'project')
        
        # Find potential matches based on complementary skills
        potential_matches = User.objects.filter(
            user_skills__skill__name__in=user_skills
        ).exclude(id=user.id).distinct()
        
        # Create match suggestions
        matches = []
        for match_user in potential_matches[:5]:  # Limit to 5 matches
            compatibility_score = self._calculate_compatibility(user, match_user)
            
            if compatibility_score >= 6:  # Only suggest good matches
                team_match = TeamMatch.objects.create(
                    user=user,
                    match_type=match_type,
                    compatibility_score=compatibility_score,
                    match_reason=f"Complementary skills and similar interests",
                    suggested_roles=preferred_roles
                )
                team_match.matched_users.add(match_user)
                matches.append(team_match)
        
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)
    
    def _calculate_compatibility(self, user1, user2):
        """Calculate compatibility score between two users"""
        # Simple compatibility algorithm
        score = 5  # Base score
        
        # Check shared skills
        user1_skills = set(user1.user_skills.values_list('skill__name', flat=True))
        user2_skills = set(user2.user_skills.values_list('skill__name', flat=True))
        shared_skills = len(user1_skills.intersection(user2_skills))
        score += min(shared_skills * 0.5, 3)  # Max 3 points for shared skills
        
        # Check role compatibility
        if user1.role == user2.role:
            score += 1
        
        return min(int(score), 10)  # Cap at 10
    
    @action(detail=True, methods=['post'])
    def accept_match(self, request, pk=None):
        """Accept a team match"""
        team_match = self.get_object()
        team_match.is_accepted = True
        team_match.accepted_at = timezone.now()
        team_match.save()
        
        # Generate insight
        ProgressInsight.objects.create(
            user=team_match.user,
            insight_type='achievement',
            title='New Team Connection!',
            message=f'You\'ve accepted a {team_match.match_type} match. Great networking!',
            related_match=team_match,
            confidence_score=0.9,
            is_positive=True
        )
        
        serializer = self.get_serializer(team_match)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject_match(self, request, pk=None):
        """Reject a team match"""
        team_match = self.get_object()
        team_match.is_active = False
        team_match.save()
        
        serializer = self.get_serializer(team_match)
        return Response(serializer.data)


class GrowthPathwayViewSet(viewsets.ModelViewSet):
    queryset = GrowthPathway.objects.all()
    serializer_class = GrowthPathwaySerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return GrowthPathway.objects.all()
        return GrowthPathway.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def recommend_pathways(self, request):
        """Recommend growth pathways based on user profile"""
        user = request.user
        
        # Get user's current skills and goals
        user_skills = user.user_skills.values_list('skill__name', flat=True)
        user_goals = user.outvier_goals.filter(is_completed=False)
        
        # Define pathway templates
        pathway_templates = [
            {
                'title': 'AI & Machine Learning Specialist',
                'description': 'Master AI/ML technologies and become a specialist in the field',
                'pathway_type': 'AI',
                'difficulty_level': 'intermediate',
                'required_skills': ['Python', 'Machine Learning', 'Data Science'],
                'learning_resources': [
                    'Complete Python for Data Science course',
                    'Build 3 ML projects',
                    'Join AI-focused DNC projects'
                ]
            },
            {
                'title': 'DevOps & Cloud Engineering',
                'description': 'Learn modern DevOps practices and cloud technologies',
                'pathway_type': 'DevOps',
                'difficulty_level': 'intermediate',
                'required_skills': ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
                'learning_resources': [
                    'Docker and Kubernetes fundamentals',
                    'AWS certification path',
                    'Implement CI/CD pipelines'
                ]
            },
            {
                'title': 'Digital Marketing Expert',
                'description': 'Become proficient in digital marketing strategies and tools',
                'pathway_type': 'Digital Marketing',
                'difficulty_level': 'beginner',
                'required_skills': ['SEO', 'Social Media Marketing', 'Analytics'],
                'learning_resources': [
                    'Google Analytics certification',
                    'Social media marketing course',
                    'Create marketing campaigns'
                ]
            }
        ]
        
        # Recommend pathways based on user profile
        recommended_pathways = []
        for template in pathway_templates:
            pathway = GrowthPathway.objects.create(
                user=user,
                title=template['title'],
                description=template['description'],
                pathway_type=template['pathway_type'],
                difficulty_level=template['difficulty_level'],
                learning_resources=template['learning_resources'],
                total_steps=len(template['learning_resources'])
            )
            recommended_pathways.append(pathway)
        
        serializer = self.get_serializer(recommended_pathways, many=True)
        return Response(serializer.data)


class ProgressInsightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProgressInsight.objects.all()
    serializer_class = ProgressInsightSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return ProgressInsight.objects.all()
        return ProgressInsight.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark insight as read"""
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        
        serializer = self.get_serializer(insight)
        return Response(serializer.data)


class OutvierDashboardViewSet(viewsets.ReadOnlyModelViewSet):
    """Dashboard view for Outvier mobile app"""
    queryset = User.objects.all()
    serializer_class = UserDashboardSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def my_dashboard(self, request):
        """Get current user's dashboard data"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get analytics data for dashboard"""
        user = request.user
        
        # Goal analytics
        goals = user.outvier_goals.all()
        goal_stats = {
            'total_goals': goals.count(),
            'completed_goals': goals.filter(is_completed=True).count(),
            'overdue_goals': goals.filter(
                target_date__lt=date.today(),
                is_completed=False
            ).count(),
            'upcoming_deadlines': goals.filter(
                target_date__lte=date.today() + timedelta(days=7),
                is_completed=False
            ).count()
        }
        
        # Match analytics
        matches = user.outvier_matches.all()
        match_stats = {
            'total_matches': matches.count(),
            'accepted_matches': matches.filter(is_accepted=True).count(),
            'active_matches': matches.filter(is_active=True).count()
        }
        
        # Pathway analytics
        pathways = user.outvier_pathways.all()
        pathway_stats = {
            'total_pathways': pathways.count(),
            'completed_pathways': pathways.filter(is_completed=True).count(),
            'in_progress_pathways': pathways.filter(is_completed=False).count()
        }
        
        return Response({
            'goals': goal_stats,
            'matches': match_stats,
            'pathways': pathway_stats
        })


class PathwayStepViewSet(viewsets.ModelViewSet):
    """Manage pathway learning steps"""
    queryset = PathwayStep.objects.all()
    serializer_class = PathwayStepSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        pathway_id = self.request.query_params.get('pathway_id')
        if pathway_id:
            return PathwayStep.objects.filter(pathway_id=pathway_id, pathway__user=self.request.user)
        return PathwayStep.objects.filter(pathway__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete_step(self, request, pk=None):
        """Mark a pathway step as completed"""
        step = self.get_object()
        
        # Check if user has access to this pathway
        if step.pathway.user != request.user:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Update step completion
        step.is_completed = True
        step.completed_at = timezone.now()
        step.completion_notes = request.data.get('completion_notes', '')
        step.save()
        
        # Update pathway progress
        pathway = step.pathway
        completed_steps = pathway.steps.filter(is_completed=True).count()
        pathway.current_step = completed_steps
        
        if completed_steps >= pathway.total_steps:
            pathway.is_completed = True
            pathway.completed_at = timezone.now()
            pathway.status = 'completed'
        
        pathway.save()
        
        # Create learning progress record
        learning_progress, created = LearningProgress.objects.get_or_create(
            user=request.user,
            pathway_step=step,
            defaults={
                'completed_at': timezone.now(),
                'time_spent': request.data.get('time_spent', 0),
                'quiz_score': request.data.get('quiz_score'),
                'difficulty_rating': request.data.get('difficulty_rating'),
                'helpfulness_rating': request.data.get('helpfulness_rating'),
                'notes': request.data.get('notes', '')
            }
        )
        
        if not created:
            learning_progress.completed_at = timezone.now()
            learning_progress.time_spent = request.data.get('time_spent', learning_progress.time_spent)
            learning_progress.quiz_score = request.data.get('quiz_score', learning_progress.quiz_score)
            learning_progress.difficulty_rating = request.data.get('difficulty_rating', learning_progress.difficulty_rating)
            learning_progress.helpfulness_rating = request.data.get('helpfulness_rating', learning_progress.helpfulness_rating)
            learning_progress.notes = request.data.get('notes', learning_progress.notes)
            learning_progress.save()
        
        # Update learning streak
        self._update_learning_streak(request.user)
        
        # Check for achievements
        self._check_step_achievements(request.user, step)
        
        serializer = self.get_serializer(step)
        return Response(serializer.data)
    
    def _update_learning_streak(self, user):
        """Update user's learning streak"""
        today = timezone.now().date()
        streak, created = LearningStreak.objects.get_or_create(user=user)
        
        if streak.last_activity_date is None or streak.last_activity_date < today:
            if streak.last_activity_date is None or (today - streak.last_activity_date).days == 1:
                streak.current_streak += 1
            elif (today - streak.last_activity_date).days > 1:
                streak.current_streak = 1
            
            streak.longest_streak = max(streak.longest_streak, streak.current_streak)
            streak.last_activity_date = today
            
            if streak.current_streak >= streak.target_streak:
                streak.streak_goal_achieved = True
            
            streak.save()
    
    def _check_step_achievements(self, user, step):
        """Check and create achievements for step completion"""
        # First step achievement
        if step.step_number == 1:
            Achievement.objects.get_or_create(
                user=user,
                achievement_type='pathway_completion',
                title='First Step',
                description=f'Completed the first step in {step.pathway.title}',
                related_pathway=step.pathway,
                defaults={'is_unlocked': True, 'unlocked_at': timezone.now()}
            )


class LearningProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """View learning progress for pathway steps"""
    queryset = LearningProgress.objects.all()
    serializer_class = LearningProgressSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        return LearningProgress.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get current user's learning progress summary"""
        user = request.user
        progress_records = LearningProgress.objects.filter(user=user)
        
        total_time_spent = sum(p.time_spent for p in progress_records)
        completed_steps = progress_records.filter(completed_at__isnull=False).count()
        average_quiz_score = progress_records.filter(quiz_score__isnull=False).aggregate(
            avg_score=Avg('quiz_score')
        )['avg_score'] or 0
        
        pathway_progress = {}
        for record in progress_records:
            pathway_title = record.pathway_step.pathway.title
            if pathway_title not in pathway_progress:
                pathway_progress[pathway_title] = {
                    'total_steps': 0,
                    'completed_steps': 0,
                    'time_spent': 0
                }
            
            pathway_progress[pathway_title]['total_steps'] += 1
            if record.completed_at:
                pathway_progress[pathway_title]['completed_steps'] += 1
            pathway_progress[pathway_title]['time_spent'] += record.time_spent
        
        return Response({
            'total_time_spent': total_time_spent,
            'completed_steps': completed_steps,
            'average_quiz_score': round(average_quiz_score, 2),
            'pathway_progress': pathway_progress
        })


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """View user achievements"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_achievements(self, request):
        """Get current user's achievements"""
        achievements = Achievement.objects.filter(user=request.user)
        unlocked = achievements.filter(is_unlocked=True)
        locked = achievements.filter(is_unlocked=False)
        
        total_points = sum(a.points_earned for a in unlocked)
        
        return Response({
            'unlocked_achievements': AchievementSerializer(unlocked, many=True).data,
            'locked_achievements': AchievementSerializer(locked, many=True).data,
            'total_points': total_points,
            'achievement_count': {
                'unlocked': unlocked.count(),
                'locked': locked.count(),
                'total': achievements.count()
            }
        })


class LearningStreakViewSet(viewsets.ReadOnlyModelViewSet):
    """View learning streaks"""
    queryset = LearningStreak.objects.all()
    serializer_class = LearningStreakSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        return LearningStreak.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_streak(self, request):
        """Get current user's learning streak"""
        streak, created = LearningStreak.objects.get_or_create(user=request.user)
        return Response(LearningStreakSerializer(streak).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """View and manage user notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_notifications(self, request):
        """Get current user's notifications"""
        limit = int(request.query_params.get('limit', 20))
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        
        notifications = NotificationService.get_user_notifications(
            user=request.user,
            limit=limit,
            unread_only=unread_only
        )
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        success = NotificationService.mark_notification_read(pk, request.user)
        if success:
            return Response({'detail': 'Notification marked as read'})
        return Response({'detail': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated_count = NotificationService.mark_all_notifications_read(request.user)
        return Response({'detail': f'{updated_count} notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """Manage user notification preferences"""
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get current user's notification preferences"""
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_preferences(self, request):
        """Update current user's notification preferences"""
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationScheduleViewSet(viewsets.ModelViewSet):
    """Manage notification schedules"""
    queryset = NotificationSchedule.objects.all()
    serializer_class = NotificationScheduleSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        return NotificationSchedule.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_schedules(self, request):
        """Get current user's notification schedules"""
        schedules = NotificationSchedule.objects.filter(user=request.user)
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_goal_reminder(self, request):
        """Create a reminder schedule for a goal"""
        goal_id = request.data.get('goal_id')
        frequency = request.data.get('frequency', 'weekly')
        
        try:
            goal = Goal.objects.get(id=goal_id, user=request.user)
            NotificationScheduler.create_goal_reminder_schedule(goal, frequency)
            return Response({'detail': 'Goal reminder schedule created'})
        except Goal.DoesNotExist:
            return Response({'detail': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_pathway_reminder(self, request):
        """Create a reminder schedule for a pathway"""
        pathway_id = request.data.get('pathway_id')
        frequency = request.data.get('frequency', 'daily')
        
        try:
            pathway = GrowthPathway.objects.get(id=pathway_id, user=request.user)
            NotificationScheduler.create_pathway_reminder_schedule(pathway, frequency)
            return Response({'detail': 'Pathway reminder schedule created'})
        except GrowthPathway.DoesNotExist:
            return Response({'detail': 'Pathway not found'}, status=status.HTTP_404_NOT_FOUND)


class MentorEventViewSet(viewsets.ModelViewSet):
    """Manage mentor events with zoom integration"""
    queryset = MentorEvent.objects.all()
    serializer_class = MentorEventSerializer
    permission_classes = [IsMentorOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return MentorEvent.objects.all()
        return MentorEvent.objects.filter(mentor=self.request.user)
    
    def perform_create(self, serializer):
        """Set mentor when creating event"""
        serializer.save(mentor=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):
        """Get upcoming mentor events"""
        events = MentorEvent.objects.filter(
            start_date__gte=timezone.now(),
            status='published'
        ).order_by('start_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register for a mentor event"""
        event = self.get_object()
        user = request.user
        
        # Check if already registered
        if MentorEventRegistration.objects.filter(event=event, user=user).exists():
            return Response({'detail': 'Already registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if event is full
        if event.is_full:
            return Response({'detail': 'Event is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create registration
        registration = MentorEventRegistration.objects.create(
            event=event,
            user=user,
            motivation=request.data.get('motivation', ''),
            goals=request.data.get('goals', ''),
            experience_level=request.data.get('experience_level', 'beginner')
        )
        
        # Update participant count
        event.current_participants += 1
        event.save()
        
        serializer = MentorEventRegistrationSerializer(registration)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_registration(self, request, pk=None):
        """Approve a registration (mentor only)"""
        event = self.get_object()
        registration_id = request.data.get('registration_id')
        
        try:
            registration = MentorEventRegistration.objects.get(
                id=registration_id,
                event=event
            )
            registration.status = 'approved'
            registration.approved_by = request.user
            registration.approved_at = timezone.now()
            registration.mentor_notes = request.data.get('mentor_notes', '')
            registration.save()
            
            serializer = MentorEventRegistrationSerializer(registration)
            return Response(serializer.data)
        except MentorEventRegistration.DoesNotExist:
            return Response({'detail': 'Registration not found'}, status=status.HTTP_404_NOT_FOUND)


class MentorEventRegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    """View mentor event registrations"""
    queryset = MentorEventRegistration.objects.all()
    serializer_class = MentorEventRegistrationSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return MentorEventRegistration.objects.all()
        return MentorEventRegistration.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        """Get current user's event registrations"""
        registrations = MentorEventRegistration.objects.filter(user=request.user)
        serializer = self.get_serializer(registrations, many=True)
        return Response(serializer.data)


class UserGroupViewSet(viewsets.ModelViewSet):
    """Manage user groups for collaboration"""
    queryset = UserGroup.objects.all()
    serializer_class = UserGroupSerializer
    permission_classes = [IsMemberOrAbove]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserGroup.objects.all()
        return UserGroup.objects.filter(
            Q(created_by=self.request.user) | 
            Q(members=self.request.user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Set creator when creating group"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def create_from_goals(self, request):
        """Create group based on similar goals"""
        serializer = GroupCreationSerializer(data=request.data)
        if serializer.is_valid():
            # Get users with similar goals
            goal_ids = serializer.validated_data.get('related_goals', [])
            goals = Goal.objects.filter(id__in=goal_ids)
            
            # Find users with similar goals
            similar_users = User.objects.filter(
                outvier_goals__goal_type__in=goals.values_list('goal_type', flat=True)
            ).distinct()
            
            # Create group
            group = UserGroup.objects.create(
                name=serializer.validated_data['name'],
                description=serializer.validated_data['description'],
                group_type=serializer.validated_data['group_type'],
                created_by=request.user,
                max_members=serializer.validated_data.get('max_members', 10),
                requires_approval=serializer.validated_data.get('requires_approval', False),
                allow_self_join=serializer.validated_data.get('allow_self_join', True)
            )
            
            # Add related goals and skills
            group.related_goals.set(goals)
            if 'related_skills' in serializer.validated_data:
                group.related_skills.set(serializer.validated_data['related_skills'])
            
            # Add similar users as members
            for user in similar_users[:group.max_members]:
                GroupMembership.objects.create(
                    group=group,
                    user=user,
                    status='active' if not group.requires_approval else 'pending'
                )
            
            response_serializer = self.get_serializer(group)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def join_group(self, request, pk=None):
        """Join a user group"""
        group = self.get_object()
        user = request.user
        
        # Check if already a member
        if GroupMembership.objects.filter(group=group, user=user).exists():
            return Response({'detail': 'Already a member of this group'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if group is full
        if group.is_full:
            return Response({'detail': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create membership
        membership = GroupMembership.objects.create(
            group=group,
            user=user,
            status='active' if not group.requires_approval else 'pending'
        )
        
        serializer = GroupMembershipSerializer(membership)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_member(self, request, pk=None):
        """Approve a group membership (group creator only)"""
        group = self.get_object()
        membership_id = request.data.get('membership_id')
        
        if group.created_by != request.user:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            membership = GroupMembership.objects.get(
                id=membership_id,
                group=group
            )
            membership.status = 'active'
            membership.approved_by = request.user
            membership.approved_at = timezone.now()
            membership.save()
            
            serializer = GroupMembershipSerializer(membership)
            return Response(serializer.data)
        except GroupMembership.DoesNotExist:
            return Response({'detail': 'Membership not found'}, status=status.HTTP_404_NOT_FOUND)


class UserMatchingViewSet(viewsets.ViewSet):
    """Handle user matching and group creation"""
    permission_classes = [IsMemberOrAbove]
    
    @action(detail=False, methods=['post'])
    def find_matches(self, request):
        """Find potential matches for users"""
        serializer = UserMatchingSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            match_type = serializer.validated_data['match_type']
            
            try:
                user = User.objects.get(id=user_id)
                
                # Find users with similar skills
                user_skills = user.user_skills.values_list('skill__name', flat=True)
                potential_matches = User.objects.filter(
                    user_skills__skill__name__in=user_skills
                ).exclude(id=user_id).distinct()
                
                matches = []
                for match_user in potential_matches[:5]:
                    compatibility_score = self._calculate_compatibility(user, match_user)
                    
                    if compatibility_score >= 6:
                        team_match = TeamMatch.objects.create(
                            user=user,
                            match_type=match_type,
                            compatibility_score=compatibility_score,
                            match_reason="Similar skills and interests"
                        )
                        team_match.matched_users.add(match_user)
                        matches.append(team_match)
                
                match_serializer = TeamMatchSerializer(matches, many=True)
                return Response(match_serializer.data)
                
            except User.DoesNotExist:
                return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_group_from_event(self, request):
        """Create group based on event participants"""
        event_id = request.data.get('event_id')
        group_name = request.data.get('name')
        group_description = request.data.get('description')
        
        try:
            from apps.events.models import Event
            event = Event.objects.get(id=event_id)
            
            # Get event participants
            participants = [reg.user for reg in event.registrations.filter(status='registered')]
            
            if len(participants) < 2:
                return Response({'detail': 'Not enough participants to create a group'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create group
            group = UserGroup.objects.create(
                name=group_name,
                description=group_description,
                group_type='event_based',
                created_by=request.user,
                max_members=len(participants) + 5  # Allow some growth
            )
            
            # Add participants as members
            for participant in participants:
                GroupMembership.objects.create(
                    group=group,
                    user=participant,
                    status='active'
                )
            
            serializer = UserGroupSerializer(group)
            return Response(serializer.data)
            
        except Event.DoesNotExist:
            return Response({'detail': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def _calculate_compatibility(self, user1, user2):
        """Calculate compatibility score between two users"""
        score = 5  # Base score
        
        # Check shared skills
        user1_skills = set(user1.user_skills.values_list('skill__name', flat=True))
        user2_skills = set(user2.user_skills.values_list('skill__name', flat=True))
        shared_skills = len(user1_skills.intersection(user2_skills))
        score += min(shared_skills * 0.5, 3)
        
        # Check role compatibility
        if user1.role == user2.role:
            score += 1
        
        return min(int(score), 10)
