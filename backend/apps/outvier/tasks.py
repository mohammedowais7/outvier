"""
Celery tasks for Outvier notifications and background processing
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_goal_reminder_task(goal_id):
    """Send reminder email for a specific goal"""
    try:
        from .models import Goal
        from .email_templates import EmailService
        
        goal = Goal.objects.get(id=goal_id)
        
        # Check if goal is still active and not completed
        if not goal.is_completed and goal.status in ['not_started', 'in_progress']:
            # Determine reminder type based on days remaining
            if goal.days_remaining <= 1:
                reminder_type = 'deadline'
            elif goal.days_remaining <= 7:
                reminder_type = 'milestone'
            else:
                reminder_type = 'general'
            
            EmailService.send_goal_reminder_notification(goal, reminder_type)
            logger.info(f"Goal reminder sent for goal {goal_id}")
            
    except Exception as e:
        logger.error(f"Error sending goal reminder for goal {goal_id}: {e}")


@shared_task
def send_event_reminder_task(event_id, hours_before):
    """Send reminder email for a specific event"""
    try:
        from apps.events.models import Event
        from .email_templates import EmailService
        
        event = Event.objects.get(id=event_id)
        
        # Get registered users for the event
        registered_users = [reg.user for reg in event.registrations.filter(status='registered')]
        
        if registered_users:
            EmailService.send_event_reminder_notification(event, registered_users, hours_before)
            logger.info(f"Event reminder sent for event {event_id} to {len(registered_users)} users")
            
    except Exception as e:
        logger.error(f"Error sending event reminder for event {event_id}: {e}")


@shared_task
def process_user_matching():
    """Process user matching based on goals and events"""
    try:
        from .models import Goal, TeamMatch
        from apps.users.models import User
        from apps.events.models import Event
        from django.db.models import Q
        
        logger.info("Starting user matching process")
        
        # Get active users with goals
        users_with_goals = User.objects.filter(
            outvier_goals__isnull=False,
            outvier_goals__is_completed=False,
            status='active'
        ).distinct()
        
        for user in users_with_goals:
            # Find potential matches based on goals
            user_goals = user.outvier_goals.filter(is_completed=False)
            
            for goal in user_goals:
                # Find users with similar goals
                similar_goals = Goal.objects.filter(
                    goal_type=goal.goal_type,
                    is_completed=False,
                    user__status='active'
                ).exclude(user=user)
                
                for similar_goal in similar_goals:
                    # Check if match already exists
                    existing_match = TeamMatch.objects.filter(
                        user=user,
                        matched_users=similar_goal.user,
                        match_type='peer_learning'
                    ).exists()
                    
                    if not existing_match:
                        # Create new match
                        match = TeamMatch.objects.create(
                            user=user,
                            match_type='peer_learning',
                            compatibility_score=calculate_compatibility_score(user, similar_goal.user),
                            match_reason=f"Both users have {goal.get_goal_type_display()} goals"
                        )
                        match.matched_users.add(similar_goal.user)
                        logger.info(f"Created match between {user.username} and {similar_goal.user.username}")
        
        logger.info("User matching process completed")
        
    except Exception as e:
        logger.error(f"Error in user matching process: {e}")


@shared_task
def process_event_based_grouping():
    """Create groups based on events and goals"""
    try:
        from apps.events.models import Event, EventRegistration
        from .models import Goal
        from apps.users.models import User
        from django.db.models import Q
        
        logger.info("Starting event-based grouping process")
        
        # Get upcoming events
        upcoming_events = Event.objects.filter(
            start_date__gte=timezone.now(),
            status='published'
        )
        
        for event in upcoming_events:
            # Get registered users
            registered_users = [reg.user for reg in event.registrations.filter(status='registered')]
            
            if len(registered_users) >= 2:
                # Group users by similar interests/goals
                create_event_groups(event, registered_users)
        
        logger.info("Event-based grouping process completed")
        
    except Exception as e:
        logger.error(f"Error in event-based grouping: {e}")


@shared_task
def send_weekly_digest():
    """Send weekly digest emails to users"""
    try:
        from apps.users.models import User
        from .email_templates import EmailService
        from django.template.loader import render_to_string
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        
        # Get users who want weekly digests
        users = User.objects.filter(
            status='active',
            email_notifications=True,
            preferences__reminder_frequency='weekly'
        )
        
        for user in users:
            # Get user's weekly progress
            weekly_goals = user.outvier_goals.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            )
            completed_goals = user.outvier_goals.filter(
                is_completed=True,
                completed_date__gte=timezone.now() - timedelta(days=7)
            )
            
            if weekly_goals.exists() or completed_goals.exists():
                context = {
                    'user': user,
                    'weekly_goals': weekly_goals,
                    'completed_goals': completed_goals,
                    'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
                }
                
                subject = f"Weekly Progress Digest - {user.first_name or user.username}"
                html_content = render_to_string('emails/weekly_digest.html', context)
                text_content = render_to_string('emails/weekly_digest.txt', context)
                
                EmailService.send_email(
                    to_email=user.email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content
                )
                
        logger.info("Weekly digest emails sent")
        
    except Exception as e:
        logger.error(f"Error sending weekly digest: {e}")


def calculate_compatibility_score(user1, user2):
    """Calculate compatibility score between two users"""
    try:
        score = 5  # Base score
        
        # Check if they have similar skills
        user1_skills = set(user1.user_skills.values_list('skill__name', flat=True))
        user2_skills = set(user2.user_skills.values_list('skill__name', flat=True))
        
        if user1_skills and user2_skills:
            common_skills = len(user1_skills.intersection(user2_skills))
            total_skills = len(user1_skills.union(user2_skills))
            skill_similarity = common_skills / total_skills if total_skills > 0 else 0
            score += int(skill_similarity * 3)  # Add up to 3 points for skill similarity
        
        # Check if they have similar goal types
        user1_goal_types = set(user1.outvier_goals.values_list('goal_type', flat=True))
        user2_goal_types = set(user2.outvier_goals.values_list('goal_type', flat=True))
        
        if user1_goal_types and user2_goal_types:
            common_goal_types = len(user1_goal_types.intersection(user2_goal_types))
            if common_goal_types > 0:
                score += 2  # Add 2 points for common goal types
        
        return min(score, 10)  # Cap at 10
        
    except Exception as e:
        logger.error(f"Error calculating compatibility score: {e}")
        return 5


def create_event_groups(event, users):
    """Create groups for event participants"""
    try:
        from .models import TeamMatch
        
        # Group users by similar interests
        for i, user1 in enumerate(users):
            for user2 in users[i+1:]:
                # Check if they should be grouped
                if should_group_users(user1, user2):
                    # Create or update match
                    match, created = TeamMatch.objects.get_or_create(
                        user=user1,
                        match_type='project',
                        defaults={
                            'compatibility_score': calculate_compatibility_score(user1, user2),
                            'match_reason': f"Grouped for event: {event.title}"
                        }
                    )
                    match.matched_users.add(user2)
                    
                    if created:
                        logger.info(f"Created event group for {user1.username} and {user2.username}")
        
    except Exception as e:
        logger.error(f"Error creating event groups: {e}")


def should_group_users(user1, user2):
    """Determine if two users should be grouped together"""
    try:
        # Check if they have similar skills
        user1_skills = set(user1.user_skills.values_list('skill__name', flat=True))
        user2_skills = set(user2.user_skills.values_list('skill__name', flat=True))
        
        if user1_skills and user2_skills:
            common_skills = len(user1_skills.intersection(user2_skills))
            return common_skills >= 2  # Group if they have at least 2 common skills
        
        return False
        
    except Exception as e:
        logger.error(f"Error checking if users should be grouped: {e}")
        return False


@shared_task
def send_goal_reminders():
    """Send goal reminder emails to users"""
    try:
        from .models import Goal
        from .email_templates import EmailService
        from django.utils import timezone
        from datetime import timedelta
        
        # Get goals that need reminders
        today = timezone.now().date()
        
        # Goals due in 3 days
        urgent_goals = Goal.objects.filter(
            target_date__lte=today + timedelta(days=3),
            is_completed=False,
            user__email_notifications=True
        )
        
        for goal in urgent_goals:
            EmailService.send_goal_reminder_notification(goal, 'deadline')
        
        # Goals due in 7 days
        upcoming_goals = Goal.objects.filter(
            target_date__lte=today + timedelta(days=7),
            target_date__gt=today + timedelta(days=3),
            is_completed=False,
            user__email_notifications=True
        )
        
        for goal in upcoming_goals:
            EmailService.send_goal_reminder_notification(goal, 'milestone')
        
        logger.info(f"Sent goal reminders for {urgent_goals.count() + upcoming_goals.count()} goals")
        
    except Exception as e:
        logger.error(f"Error sending goal reminders: {e}")


@shared_task
def send_event_reminders():
    """Send event reminder emails to users"""
    try:
        from apps.events.models import Event, EventRegistration
        from .email_templates import EmailService
        from django.utils import timezone
        from datetime import timedelta
        
        # Get events starting in 24 hours
        tomorrow = timezone.now() + timedelta(hours=24)
        events_24h = Event.objects.filter(
            start_date__lte=tomorrow,
            start_date__gte=timezone.now(),
            status='published'
        )
        
        for event in events_24h:
            registrations = event.registrations.filter(status='registered')
            users = [reg.user for reg in registrations if reg.user.email]
            if users:
                EmailService.send_event_reminder_notification(event, users, 24)
        
        # Get events starting in 1 hour
        one_hour = timezone.now() + timedelta(hours=1)
        events_1h = Event.objects.filter(
            start_date__lte=one_hour,
            start_date__gte=timezone.now(),
            status='published'
        )
        
        for event in events_1h:
            registrations = event.registrations.filter(status='registered')
            users = [reg.user for reg in registrations if reg.user.email]
            if users:
                EmailService.send_event_reminder_notification(event, users, 1)
        
        logger.info(f"Sent event reminders for {events_24h.count() + events_1h.count()} events")
        
    except Exception as e:
        logger.error(f"Error sending event reminders: {e}")




@shared_task
def send_mentor_event_reminder_task(event_id, hours_before):
    """Send reminder email for a specific mentor event"""
    try:
        from .models import MentorEvent
        from .email_templates import EmailService
        
        event = MentorEvent.objects.get(id=event_id)
        
        # Get registered users for the event
        registered_users = [reg.user for reg in event.registrations.filter(status='approved')]
        
        if registered_users:
            EmailService.send_event_reminder_notification(event, registered_users, hours_before)
            logger.info(f"Mentor event reminder sent for event {event_id} to {len(registered_users)} users")
            
    except Exception as e:
        logger.error(f"Error sending mentor event reminder for event {event_id}: {e}")
