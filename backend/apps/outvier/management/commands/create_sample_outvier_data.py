from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.outvier.models import (
    PersonalProfile, Goal, GoalMilestone, TeamMatch, 
    GrowthPathway, ProgressInsight
)
from apps.users.models import Skill
from apps.projects.models import Project, ProjectCategory
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for Outvier mobile app testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=5,
            help='Number of users to create sample data for'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        
        # Get or create sample users
        users = []
        for i in range(num_users):
            user, created = User.objects.get_or_create(
                email=f'outvier_user_{i+1}@example.com',
                defaults={
                    'first_name': f'Outvier',
                    'last_name': f'User{i+1}',
                    'role': random.choice(['member', 'mentor', 'mentee']),
                    'is_active': True
                }
            )
            users.append(user)
            if created:
                self.stdout.write(f'Created user: {user.email}')

        # Create personal profiles
        for user in users:
            profile, created = PersonalProfile.objects.get_or_create(
                user=user,
                defaults={
                    'personality_type': random.choice(['Analytical', 'Creative', 'Practical', 'Social']),
                    'communication_style': random.choice(['Direct', 'Diplomatic', 'Enthusiastic', 'Reserved']),
                    'work_preference': random.choice(['Remote', 'Hybrid', 'Office', 'Flexible']),
                    'strengths': ['Problem Solving', 'Communication', 'Leadership'],
                    'weaknesses': ['Time Management', 'Public Speaking'],
                    'opportunities': ['AI/ML Projects', 'Mentoring', 'Leadership Roles'],
                    'growth_areas': ['Technical Skills', 'Project Management'],
                    'leadership_score': random.randint(3, 10),
                    'technical_score': random.randint(3, 10),
                    'creativity_score': random.randint(3, 10),
                    'collaboration_score': random.randint(3, 10),
                    'is_complete': True
                }
            )
            if created:
                self.stdout.write(f'Created profile for: {user.email}')

        # Create sample goals
        goal_templates = [
            {
                'title': 'Learn React Native Development',
                'description': 'Master React Native to build mobile applications',
                'goal_type': 'skill',
                'priority': 'high'
            },
            {
                'title': 'Complete AI/ML Certification',
                'description': 'Get certified in machine learning and artificial intelligence',
                'goal_type': 'professional',
                'priority': 'medium'
            },
            {
                'title': 'Build a Mobile App',
                'description': 'Create and publish a mobile application',
                'goal_type': 'project',
                'priority': 'high'
            },
            {
                'title': 'Network with 50 DNC Members',
                'description': 'Connect and build relationships with other DNC members',
                'goal_type': 'network',
                'priority': 'medium'
            }
        ]

        for user in users:
            for template in random.sample(goal_templates, random.randint(1, 3)):
                goal, created = Goal.objects.get_or_create(
                    user=user,
                    title=template['title'],
                    defaults={
                        'description': template['description'],
                        'goal_type': template['goal_type'],
                        'priority': template['priority'],
                        'start_date': date.today() - timedelta(days=random.randint(1, 30)),
                        'target_date': date.today() + timedelta(days=random.randint(30, 180)),
                        'progress_percentage': random.randint(0, 100),
                        'is_completed': random.choice([True, False])
                    }
                )
                if created:
                    # Create milestones for the goal
                    milestone_titles = [
                        'Research and Planning',
                        'Initial Implementation',
                        'Testing and Refinement',
                        'Final Review and Launch'
                    ]
                    for i, milestone_title in enumerate(milestone_titles):
                        GoalMilestone.objects.create(
                            goal=goal,
                            title=milestone_title,
                            description=f'Complete {milestone_title.lower()} phase',
                            target_date=goal.target_date - timedelta(days=(len(milestone_titles)-i-1)*15),
                            is_completed=random.choice([True, False])
                        )

        # Create team matches
        for user in users:
            other_users = [u for u in users if u != user]
            if other_users:
                match_user = random.choice(other_users)
                match, created = TeamMatch.objects.get_or_create(
                    user=user,
                    match_type=random.choice(['project', 'mentorship', 'peer_learning', 'skill_exchange']),
                    defaults={
                        'compatibility_score': random.randint(6, 10),
                        'match_reason': f'Complementary skills and shared interests in {random.choice(["AI", "Mobile Development", "DevOps", "Digital Marketing"])}',
                        'suggested_roles': [random.choice(['Developer', 'Designer', 'Project Manager', 'Mentor'])],
                        'is_active': True,
                        'is_accepted': random.choice([True, False])
                    }
                )
                if created:
                    match.matched_users.add(match_user)

        # Create growth pathways
        pathway_templates = [
            {
                'title': 'AI & Machine Learning Specialist',
                'description': 'Master AI/ML technologies and become a specialist in the field',
                'pathway_type': 'AI',
                'difficulty_level': 'intermediate',
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
                'learning_resources': [
                    'Google Analytics certification',
                    'Social media marketing course',
                    'Create marketing campaigns'
                ]
            }
        ]

        for user in users:
            for template in random.sample(pathway_templates, random.randint(1, 2)):
                pathway, created = GrowthPathway.objects.get_or_create(
                    user=user,
                    title=template['title'],
                    defaults={
                        'description': template['description'],
                        'pathway_type': template['pathway_type'],
                        'difficulty_level': template['difficulty_level'],
                        'learning_resources': template['learning_resources'],
                        'current_step': random.randint(0, len(template['learning_resources'])),
                        'total_steps': len(template['learning_resources']),
                        'is_completed': random.choice([True, False])
                    }
                )

        # Create progress insights
        insight_templates = [
            {
                'insight_type': 'progress',
                'title': 'Great Progress!',
                'message': 'You\'re making excellent progress on your goals. Keep up the momentum!',
                'is_positive': True,
                'confidence_score': 0.9
            },
            {
                'insight_type': 'recommendation',
                'title': 'New Opportunity',
                'message': 'Based on your skills, we recommend exploring AI/ML projects in the DNC community.',
                'is_positive': True,
                'confidence_score': 0.8
            },
            {
                'insight_type': 'achievement',
                'title': 'Goal Completed!',
                'message': 'Congratulations on completing your goal! You\'re one step closer to your objectives.',
                'is_positive': True,
                'confidence_score': 1.0
            }
        ]

        for user in users:
            for template in random.sample(insight_templates, random.randint(1, 3)):
                ProgressInsight.objects.get_or_create(
                    user=user,
                    title=template['title'],
                    defaults={
                        'insight_type': template['insight_type'],
                        'message': template['message'],
                        'is_positive': template['is_positive'],
                        'confidence_score': template['confidence_score'],
                        'is_read': random.choice([True, False])
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created sample Outvier data for {num_users} users!'
            )
        )
