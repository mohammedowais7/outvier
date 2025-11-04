"""
Celery configuration for Outvier app
"""
from celery import Celery
from django.conf import settings
import os

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dnc.settings')

app = Celery('outvier')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'process-user-matching': {
        'task': 'apps.outvier.tasks.process_user_matching',
        'schedule': 60.0 * 60 * 24,  # Run daily
    },
    'process-event-grouping': {
        'task': 'apps.outvier.tasks.process_event_based_grouping',
        'schedule': 60.0 * 60 * 12,  # Run twice daily
    },
    'send-weekly-digest': {
        'task': 'apps.outvier.tasks.send_weekly_digest',
        'schedule': 60.0 * 60 * 24 * 7,  # Run weekly
    },
    'send-goal-reminders': {
        'task': 'apps.outvier.tasks.send_goal_reminders',
        'schedule': 60.0 * 60 * 24,  # Run daily
    },
    'send-event-reminders': {
        'task': 'apps.outvier.tasks.send_event_reminders',
        'schedule': 60.0 * 60,  # Run hourly
    },
}

app.conf.timezone = 'UTC'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


