from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta, time
from typing import List, Dict, Any
import logging

from .models import (
    Notification, NotificationPreference, NotificationSchedule,
    Goal, GrowthPathway, Achievement, LearningStreak, User
)

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications"""
    
    @staticmethod
    def create_notification(
        user: User,
        notification_type: str,
        title: str,
        message: str,
        priority: str = 'medium',
        related_goal=None,
        related_pathway=None,
        related_achievement=None,
        related_match=None,
        action_url: str = None,
        action_text: str = None,
        scheduled_for: datetime = None,
        expires_at: datetime = None
    ) -> Notification:
        """Create a new notification"""
        
        # Check user preferences
        preferences = NotificationPreference.objects.get_or_create(user=user)[0]
        
        # Check if user wants this type of notification
        if not NotificationService._should_send_notification(preferences, notification_type):
            return None
        
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            related_goal=related_goal,
            related_pathway=related_pathway,
            related_achievement=related_achievement,
            related_match=related_match,
            action_url=action_url,
            action_text=action_text,
            scheduled_for=scheduled_for,
            expires_at=expires_at
        )
        
        # Send immediately if not scheduled
        if not scheduled_for:
            NotificationService._send_notification(notification, preferences)
        
        return notification
    
    @staticmethod
    def _should_send_notification(preferences: NotificationPreference, notification_type: str) -> bool:
        """Check if user wants to receive this type of notification"""
        type_mapping = {
            'goal_reminder': preferences.goal_reminders,
            'goal_deadline': preferences.goal_deadlines,
            'goal_milestone': preferences.goal_milestones,
            'pathway_reminder': preferences.pathway_reminders,
            'pathway_step': preferences.pathway_steps,
            'achievement_unlocked': preferences.achievements,
            'streak_reminder': preferences.streak_reminders,
            'streak_broken': preferences.streak_broken,
            'match_found': preferences.matches,
            'insight_available': preferences.insights,
            'system_update': preferences.system_updates,
        }
        
        return type_mapping.get(notification_type, True)
    
    @staticmethod
    def _send_notification(notification: Notification, preferences: NotificationPreference):
        """Send notification through available channels"""
        try:
            # Mark as sent
            notification.is_sent = True
            notification.sent_at = timezone.now()
            notification.save()
            
            # Here you would integrate with actual notification services:
            # - Push notifications (Firebase, APNs)
            # - Email notifications
            # - SMS notifications
            # - In-app notifications
            
            logger.info(f"Notification sent to {notification.user.email}: {notification.title}")
            
        except Exception as e:
            logger.error(f"Failed to send notification {notification.id}: {str(e)}")
    
    @staticmethod
    def check_goal_deadlines():
        """Check for upcoming goal deadlines and create notifications"""
        today = timezone.now().date()
        
        # Goals due in 3 days
        upcoming_goals = Goal.objects.filter(
            target_date=today + timedelta(days=3),
            is_completed=False
        )
        
        for goal in upcoming_goals:
            NotificationService.create_notification(
                user=goal.user,
                notification_type='goal_deadline',
                title=f'Goal Deadline Approaching',
                message=f'Your goal "{goal.title}" is due in 3 days. Don\'t forget to complete it!',
                priority='high',
                related_goal=goal,
                action_url=f'/goals/{goal.id}',
                action_text='View Goal'
            )
        
        # Goals due tomorrow
        urgent_goals = Goal.objects.filter(
            target_date=today + timedelta(days=1),
            is_completed=False
        )
        
        for goal in urgent_goals:
            NotificationService.create_notification(
                user=goal.user,
                notification_type='goal_deadline',
                title=f'Goal Due Tomorrow!',
                message=f'Your goal "{goal.title}" is due tomorrow. Time to finish it up!',
                priority='urgent',
                related_goal=goal,
                action_url=f'/goals/{goal.id}',
                action_text='View Goal'
            )
        
        # Overdue goals
        overdue_goals = Goal.objects.filter(
            target_date__lt=today,
            is_completed=False
        )
        
        for goal in overdue_goals:
            days_overdue = (today - goal.target_date).days
            NotificationService.create_notification(
                user=goal.user,
                notification_type='goal_deadline',
                title=f'Goal Overdue',
                message=f'Your goal "{goal.title}" is {days_overdue} days overdue. Consider updating the deadline or completing it.',
                priority='urgent',
                related_goal=goal,
                action_url=f'/goals/{goal.id}',
                action_text='Update Goal'
            )
    
    @staticmethod
    def check_pathway_reminders():
        """Check for pathway learning reminders"""
        # Find pathways that haven't been active for 3+ days
        inactive_threshold = timezone.now() - timedelta(days=3)
        
        inactive_pathways = GrowthPathway.objects.filter(
            last_activity__lt=inactive_threshold,
            is_completed=False,
            status='in_progress'
        )
        
        for pathway in inactive_pathways:
            days_inactive = (timezone.now().date() - pathway.last_activity.date()).days
            NotificationService.create_notification(
                user=pathway.user,
                notification_type='pathway_reminder',
                title=f'Continue Your Learning',
                message=f'You haven\'t worked on "{pathway.title}" for {days_inactive} days. Keep your momentum going!',
                priority='medium',
                related_pathway=pathway,
                action_url=f'/pathways/{pathway.id}',
                action_text='Continue Learning'
            )
    
    @staticmethod
    def check_streak_reminders():
        """Check for learning streak reminders"""
        today = timezone.now().date()
        
        # Users with active streaks who haven't learned today
        active_streaks = LearningStreak.objects.filter(
            current_streak__gt=0,
            last_activity_date__lt=today
        )
        
        for streak in active_streaks:
            if streak.current_streak >= 3:  # Only remind users with meaningful streaks
                NotificationService.create_notification(
                    user=streak.user,
                    notification_type='streak_reminder',
                    title=f'Don\'t Break Your Streak!',
                    message=f'You have a {streak.current_streak}-day learning streak. Learn something today to keep it going!',
                    priority='high',
                    action_url='/pathways',
                    action_text='Start Learning'
                )
    
    @staticmethod
    def create_achievement_notification(achievement: Achievement):
        """Create notification for unlocked achievement"""
        NotificationService.create_notification(
            user=achievement.user,
            notification_type='achievement_unlocked',
            title=f'🎉 Achievement Unlocked!',
            message=f'Congratulations! You\'ve unlocked "{achievement.title}". {achievement.description}',
            priority='medium',
            related_achievement=achievement,
            action_url='/achievements',
            action_text='View Achievement'
        )
    
    @staticmethod
    def create_goal_milestone_notification(goal: Goal, milestone_title: str):
        """Create notification for goal milestone completion"""
        NotificationService.create_notification(
            user=goal.user,
            notification_type='goal_milestone',
            title=f'Milestone Reached!',
            message=f'Great job! You\'ve completed the milestone "{milestone_title}" for your goal "{goal.title}".',
            priority='medium',
            related_goal=goal,
            action_url=f'/goals/{goal.id}',
            action_text='View Goal'
        )
    
    @staticmethod
    def create_pathway_step_notification(pathway: GrowthPathway, step_title: str):
        """Create notification for pathway step completion"""
        NotificationService.create_notification(
            user=pathway.user,
            notification_type='pathway_step',
            title=f'Step Completed!',
            message=f'Well done! You\'ve completed "{step_title}" in your "{pathway.title}" pathway.',
            priority='low',
            related_pathway=pathway,
            action_url=f'/pathways/{pathway.id}',
            action_text='Continue Learning'
        )
    
    @staticmethod
    def process_scheduled_notifications():
        """Process notifications that are scheduled to be sent"""
        now = timezone.now()
        
        scheduled_notifications = Notification.objects.filter(
            scheduled_for__lte=now,
            is_sent=False,
            expires_at__gt=now
        )
        
        for notification in scheduled_notifications:
            preferences = NotificationPreference.objects.get_or_create(user=notification.user)[0]
            NotificationService._send_notification(notification, preferences)
    
    @staticmethod
    def get_user_notifications(user: User, limit: int = 20, unread_only: bool = False) -> List[Notification]:
        """Get notifications for a user"""
        queryset = Notification.objects.filter(user=user)
        
        if unread_only:
            queryset = queryset.filter(is_read=False)
        
        return queryset.order_by('-created_at')[:limit]
    
    @staticmethod
    def mark_notification_read(notification_id: int, user: User) -> bool:
        """Mark a notification as read"""
        try:
            notification = Notification.objects.get(id=notification_id, user=user)
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @staticmethod
    def mark_all_notifications_read(user: User) -> int:
        """Mark all notifications as read for a user"""
        updated_count = Notification.objects.filter(
            user=user,
            is_read=False
        ).update(is_read=True)
        
        return updated_count
    
    @staticmethod
    def delete_expired_notifications():
        """Delete expired notifications"""
        now = timezone.now()
        deleted_count = Notification.objects.filter(
            expires_at__lt=now
        ).delete()[0]
        
        logger.info(f"Deleted {deleted_count} expired notifications")
        return deleted_count


class NotificationScheduler:
    """Service for managing scheduled notifications"""
    
    @staticmethod
    def create_goal_reminder_schedule(goal: Goal, frequency: str = 'weekly'):
        """Create a reminder schedule for a goal"""
        NotificationSchedule.objects.create(
            user=goal.user,
            notification_type='goal_reminder',
            title_template=f'Reminder: {goal.title}',
            message_template=f'Don\'t forget to work on your goal "{goal.title}". You have {{days_remaining}} days left.',
            frequency=frequency,
            time_of_day=time(9, 0),  # 9:00 AM
            start_date=timezone.now().date(),
            end_date=goal.target_date,
            related_goal=goal
        )
    
    @staticmethod
    def create_pathway_reminder_schedule(pathway: GrowthPathway, frequency: str = 'daily'):
        """Create a reminder schedule for a pathway"""
        NotificationSchedule.objects.create(
            user=pathway.user,
            notification_type='pathway_reminder',
            title_template=f'Continue Learning: {pathway.title}',
            message_template=f'Keep up with your "{pathway.title}" pathway. You\'re {{progress_percentage}}% complete.',
            frequency=frequency,
            time_of_day=time(19, 0),  # 7:00 PM
            start_date=timezone.now().date(),
            related_pathway=pathway
        )
    
    @staticmethod
    def process_schedules():
        """Process all active notification schedules"""
        now = timezone.now()
        today = now.date()
        current_time = now.time()
        current_weekday = today.weekday()  # 0 = Monday, 6 = Sunday
        
        active_schedules = NotificationSchedule.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )
        
        for schedule in active_schedules:
            should_send = False
            
            if schedule.frequency == 'daily':
                should_send = True
            elif schedule.frequency == 'weekly':
                if current_weekday in schedule.days_of_week:
                    should_send = True
            elif schedule.frequency == 'monthly':
                if today.day in schedule.days_of_month:
                    should_send = True
            
            if should_send and current_time >= schedule.time_of_day:
                # Check if we already sent a notification today
                today_start = timezone.make_aware(datetime.combine(today, time.min))
                today_end = timezone.make_aware(datetime.combine(today, time.max))
                
                existing_notification = Notification.objects.filter(
                    user=schedule.user,
                    notification_type=schedule.notification_type,
                    created_at__range=[today_start, today_end],
                    related_goal=schedule.related_goal,
                    related_pathway=schedule.related_pathway
                ).exists()
                
                if not existing_notification:
                    # Create the notification
                    title = schedule.title_template
                    message = schedule.message_template
                    
                    # Replace template variables
                    if schedule.related_goal:
                        days_remaining = (schedule.related_goal.target_date - today).days
                        message = message.replace('{{days_remaining}}', str(days_remaining))
                    
                    if schedule.related_pathway:
                        progress = schedule.related_pathway.progress_percentage
                        message = message.replace('{{progress_percentage}}', str(progress))
                    
                    NotificationService.create_notification(
                        user=schedule.user,
                        notification_type=schedule.notification_type,
                        title=title,
                        message=message,
                        related_goal=schedule.related_goal,
                        related_pathway=schedule.related_pathway
                    )

