"""
Email templates for Outvier notifications
"""
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class EmailTemplates:
    """Email template manager for Outvier notifications"""
    
    @staticmethod
    def goal_created_email(goal, user):
        """Email template for goal creation notification"""
        context = {
            'user': user,
            'goal': goal,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        }
        
        subject = f"🎯 Goal Created: {goal.title}"
        
        html_content = render_to_string('emails/goal_created.html', context)
        text_content = render_to_string('emails/goal_created.txt', context)
        
        return {
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content
        }
    
    @staticmethod
    def goal_completed_email(goal, user):
        """Email template for goal completion notification"""
        context = {
            'user': user,
            'goal': goal,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        }
        
        subject = f"🎉 Congratulations! Goal Completed: {goal.title}"
        
        html_content = render_to_string('emails/goal_completed.html', context)
        text_content = render_to_string('emails/goal_completed.txt', context)
        
        return {
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content
        }
    
    @staticmethod
    def goal_reminder_email(goal, user, reminder_type='deadline'):
        """Email template for goal reminder notifications"""
        context = {
            'user': user,
            'goal': goal,
            'reminder_type': reminder_type,
            'days_remaining': goal.days_remaining,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        }
        
        if reminder_type == 'deadline':
            subject = f"⏰ Goal Deadline Approaching: {goal.title}"
        elif reminder_type == 'milestone':
            subject = f"📋 Goal Milestone Reminder: {goal.title}"
        else:
            subject = f"🔔 Goal Reminder: {goal.title}"
        
        html_content = render_to_string('emails/goal_reminder.html', context)
        text_content = render_to_string('emails/goal_reminder.txt', context)
        
        return {
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content
        }
    
    @staticmethod
    def event_created_email(event, user):
        """Email template for event creation notification"""
        context = {
            'user': user,
            'event': event,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        }
        
        subject = f"📅 New Event: {event.title}"
        
        html_content = render_to_string('emails/event_created.html', context)
        text_content = render_to_string('emails/event_created.txt', context)
        
        return {
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content
        }
    
    @staticmethod
    def event_reminder_email(event, user, hours_before=24):
        """Email template for event reminder notifications"""
        context = {
            'user': user,
            'event': event,
            'hours_before': hours_before,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        }
        
        subject = f"⏰ Event Reminder: {event.title} starts in {hours_before} hours"
        
        html_content = render_to_string('emails/event_reminder.html', context)
        text_content = render_to_string('emails/event_reminder.txt', context)
        
        return {
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content
        }
    
    @staticmethod
    def match_found_email(match, user):
        """Email template for match found notification"""
        context = {
            'user': user,
            'match': match,
            'matched_users': match.matched_users.all(),
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        }
        
        subject = f"🤝 New Match Found: {match.get_match_type_display()}"
        
        html_content = render_to_string('emails/match_found.html', context)
        text_content = render_to_string('emails/match_found.txt', context)
        
        return {
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content
        }


class EmailService:
    """Email service for sending notifications"""
    
    @staticmethod
    def send_email(to_email, subject, html_content, text_content, from_email=None):
        """Send email with both HTML and text content using Gmail SMTP"""
        if from_email is None:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 
                getattr(settings, 'EMAIL_HOST_USER', 'noreply@outvier.com'))
        
        print(f"📧 Sending email to {to_email} from {from_email}")
        print(f"📧 Subject: {subject}")
        
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[to_email]
            )
            msg.attach_alternative(html_content, "text/html")
            result = msg.send()
            print(f"✅ Email sent successfully! Result: {result}")
            return True
        except Exception as e:
            print(f"❌ Email sending failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    @staticmethod
    def send_goal_created_notification(goal):
        """Send goal creation notification"""
        if not goal.user.email:
            return False
        
        email_data = EmailTemplates.goal_created_email(goal, goal.user)
        return EmailService.send_email(
            to_email=goal.user.email,
            subject=email_data['subject'],
            html_content=email_data['html_content'],
            text_content=email_data['text_content']
        )
    
    @staticmethod
    def send_goal_completed_notification(goal):
        """Send goal completion notification"""
        if not goal.user.email:
            return False
        
        email_data = EmailTemplates.goal_completed_email(goal, goal.user)
        return EmailService.send_email(
            to_email=goal.user.email,
            subject=email_data['subject'],
            html_content=email_data['html_content'],
            text_content=email_data['text_content']
        )
    
    @staticmethod
    def send_goal_reminder_notification(goal, reminder_type='deadline'):
        """Send goal reminder notification"""
        if not goal.user.email:
            return False
        
        email_data = EmailTemplates.goal_reminder_email(goal, goal.user, reminder_type)
        return EmailService.send_email(
            to_email=goal.user.email,
            subject=email_data['subject'],
            html_content=email_data['html_content'],
            text_content=email_data['text_content']
        )
    
    @staticmethod
    def send_event_created_notification(event, users):
        """Send event creation notification to multiple users"""
        email_data = EmailTemplates.event_created_email(event, None)
        results = []
        
        for user in users:
            if user.email:
                context = {
                    'user': user,
                    'event': event,
                    'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
                }
                
                # Render templates with user-specific context
                from django.template import Context, Template
                html_template = Template(email_data['html_content'])
                text_template = Template(email_data['text_content'])
                
                html_content = html_template.render(Context(context))
                text_content = text_template.render(Context(context))
                
                result = EmailService.send_email(
                    to_email=user.email,
                    subject=email_data['subject'],
                    html_content=html_content,
                    text_content=text_content
                )
                results.append(result)
        
        return results
    
    @staticmethod
    def send_event_reminder_notification(event, users, hours_before=24):
        """Send event reminder notification to multiple users"""
        results = []
        
        for user in users:
            if user.email:
                email_data = EmailTemplates.event_reminder_email(event, user, hours_before)
                result = EmailService.send_email(
                    to_email=user.email,
                    subject=email_data['subject'],
                    html_content=email_data['html_content'],
                    text_content=email_data['text_content']
                )
                results.append(result)
        
        return results
    
    @staticmethod
    def send_match_found_notification(match):
        """Send match found notification"""
        if not match.user.email:
            return False
        
        email_data = EmailTemplates.match_found_email(match, match.user)
        return EmailService.send_email(
            to_email=match.user.email,
            subject=email_data['subject'],
            html_content=email_data['html_content'],
            text_content=email_data['text_content']
        )
