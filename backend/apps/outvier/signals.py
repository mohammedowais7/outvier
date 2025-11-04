"""
Signal handlers for Outvier notifications
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from .models import Goal, TeamMatch, MentorEvent
from apps.events.models import Event
from .email_templates import EmailService
from .tasks import send_goal_reminder_task, send_event_reminder_task
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Goal)
def goal_notification_handler(sender, instance, created, **kwargs):
    """Handle goal creation and completion notifications"""
    try:
        if created:
            # Goal was created
            logger.info(f"Goal created: {instance.title} for user {instance.user.username}")
            EmailService.send_goal_created_notification(instance)
            
            # Schedule reminder emails based on user preferences
            if instance.reminder_frequency != 'none':
                schedule_goal_reminders(instance)
                
        else:
            # Goal was updated - check if it was completed
            if instance.is_completed and not getattr(instance, '_was_completed', False):
                logger.info(f"Goal completed: {instance.title} for user {instance.user.username}")
                EmailService.send_goal_completed_notification(instance)
                instance._was_completed = True
                
    except Exception as e:
        logger.error(f"Error sending goal notification: {e}")


@receiver(post_save, sender=MentorEvent)
def mentor_event_notification_handler(sender, instance, created, **kwargs):
    """Handle mentor event creation notifications"""
    try:
        if created and instance.status == 'published':
            logger.info(f"Mentor event created: {instance.title}")
            
            # Get users who should be notified (mentees, members interested in this event type)
            from apps.users.models import User
            users_to_notify = get_users_for_event_notification(instance)
            
            if users_to_notify:
                EmailService.send_event_created_notification(instance, users_to_notify)
                
            # Schedule event reminder emails
            schedule_event_reminders(instance)
            
    except Exception as e:
        logger.error(f"Error sending mentor event notification: {e}")


@receiver(post_save, sender=TeamMatch)
def match_notification_handler(sender, instance, created, **kwargs):
    """Handle match found notifications"""
    try:
        if created and instance.is_active:
            logger.info(f"Match created: {instance.match_type} for user {instance.user.username}")
            EmailService.send_match_found_notification(instance)
            
    except Exception as e:
        logger.error(f"Error sending match notification: {e}")


def schedule_goal_reminders(goal):
    """Schedule reminder emails for a goal"""
    try:
        from django_celery_beat.models import PeriodicTask, CrontabSchedule
        import json
        from datetime import timedelta
        
        # Create reminder schedule based on goal settings
        if goal.reminder_frequency == 'daily':
            # Send daily reminders starting 7 days before deadline
            schedule, created = CrontabSchedule.objects.get_or_create(
                hour=9,  # 9 AM
                minute=0,
                day_of_week='*',
                day_of_month='*',
                month_of_year='*',
            )
            
            task_name = f"goal_reminder_{goal.id}_daily"
            PeriodicTask.objects.get_or_create(
                name=task_name,
                defaults={
                    'task': 'apps.outvier.tasks.send_goal_reminder_task',
                    'crontab': schedule,
                    'args': json.dumps([goal.id]),
                    'enabled': True,
                }
            )
            
        elif goal.reminder_frequency == 'weekly':
            # Send weekly reminders on Mondays
            schedule, created = CrontabSchedule.objects.get_or_create(
                hour=9,
                minute=0,
                day_of_week=1,  # Monday
                day_of_month='*',
                month_of_year='*',
            )
            
            task_name = f"goal_reminder_{goal.id}_weekly"
            PeriodicTask.objects.get_or_create(
                name=task_name,
                defaults={
                    'task': 'apps.outvier.tasks.send_goal_reminder_task',
                    'crontab': schedule,
                    'args': json.dumps([goal.id]),
                    'enabled': True,
                }
            )
            
    except Exception as e:
        logger.error(f"Error scheduling goal reminders: {e}")


def schedule_event_reminders(event):
    """Schedule reminder emails for a mentor event"""
    try:
        from django_celery_beat.models import PeriodicTask, CrontabSchedule
        import json
        from datetime import timedelta
        
        # Send reminder 24 hours before event
        reminder_time = event.start_date - timedelta(hours=24)
        
        schedule, created = CrontabSchedule.objects.get_or_create(
            hour=reminder_time.hour,
            minute=reminder_time.minute,
            day_of_week=reminder_time.weekday(),
            day_of_month=reminder_time.day,
            month_of_year=reminder_time.month,
        )
        
        task_name = f"mentor_event_reminder_{event.id}_24h"
        PeriodicTask.objects.get_or_create(
            name=task_name,
            defaults={
                'task': 'apps.outvier.tasks.send_mentor_event_reminder_task',
                'crontab': schedule,
                'args': json.dumps([event.id, 24]),
                'enabled': True,
            }
        )
        
        # Send reminder 1 hour before event
        reminder_time_1h = event.start_date - timedelta(hours=1)
        
        schedule_1h, created = CrontabSchedule.objects.get_or_create(
            hour=reminder_time_1h.hour,
            minute=reminder_time_1h.minute,
            day_of_week=reminder_time_1h.weekday(),
            day_of_month=reminder_time_1h.day,
            month_of_year=reminder_time_1h.month,
        )
        
        task_name_1h = f"mentor_event_reminder_{event.id}_1h"
        PeriodicTask.objects.get_or_create(
            name=task_name_1h,
            defaults={
                'task': 'apps.outvier.tasks.send_mentor_event_reminder_task',
                'crontab': schedule_1h,
                'args': json.dumps([event.id, 1]),
                'enabled': True,
            }
        )
        
    except Exception as e:
        logger.error(f"Error scheduling mentor event reminders: {e}")


def get_users_for_event_notification(event):
    """Get users who should be notified about a new event"""
    try:
        from apps.users.models import User
        
        # Get users based on event type and user preferences
        users = User.objects.filter(
            status='active',
            email_notifications=True
        ).exclude(
            id=event.created_by.id  # Don't notify the creator
        )
        
        # Filter by user preferences if available
        # This could be enhanced based on user interests, skills, etc.
        return users[:50]  # Limit to 50 users to avoid spam
        
    except Exception as e:
        logger.error(f"Error getting users for event notification: {e}")
        return []
