from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.outvier.services import NotificationService, NotificationScheduler


class Command(BaseCommand):
    help = 'Send scheduled notifications and check for reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['all', 'deadlines', 'reminders', 'scheduled', 'cleanup'],
            default='all',
            help='Type of notifications to process'
        )

    def handle(self, *args, **options):
        notification_type = options['type']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting notification processing: {notification_type}')
        )
        
        try:
            if notification_type in ['all', 'deadlines']:
                self.stdout.write('Checking goal deadlines...')
                NotificationService.check_goal_deadlines()
                self.stdout.write(
                    self.style.SUCCESS('Goal deadline notifications processed')
                )
            
            if notification_type in ['all', 'reminders']:
                self.stdout.write('Checking pathway reminders...')
                NotificationService.check_pathway_reminders()
                self.stdout.write(
                    self.style.SUCCESS('Pathway reminder notifications processed')
                )
                
                self.stdout.write('Checking streak reminders...')
                NotificationService.check_streak_reminders()
                self.stdout.write(
                    self.style.SUCCESS('Streak reminder notifications processed')
                )
            
            if notification_type in ['all', 'scheduled']:
                self.stdout.write('Processing scheduled notifications...')
                NotificationService.process_scheduled_notifications()
                self.stdout.write(
                    self.style.SUCCESS('Scheduled notifications processed')
                )
                
                self.stdout.write('Processing notification schedules...')
                NotificationScheduler.process_schedules()
                self.stdout.write(
                    self.style.SUCCESS('Notification schedules processed')
                )
            
            if notification_type in ['all', 'cleanup']:
                self.stdout.write('Cleaning up expired notifications...')
                deleted_count = NotificationService.delete_expired_notifications()
                self.stdout.write(
                    self.style.SUCCESS(f'Deleted {deleted_count} expired notifications')
                )
            
            self.stdout.write(
                self.style.SUCCESS('Notification processing completed successfully')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error processing notifications: {str(e)}')
            )
            raise

