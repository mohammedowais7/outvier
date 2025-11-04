from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.outvier.models import GrowthPathway, PathwayStep
from apps.users.models import Skill

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with pathway steps data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating pathway steps data...')

        # Get or create a test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            self.stdout.write(f'Created test user: {user.username}')
        else:
            self.stdout.write(f'Using existing user: {user.username}')

        # Get or create skills
        js_skill, _ = Skill.objects.get_or_create(name='JavaScript')
        react_skill, _ = Skill.objects.get_or_create(name='React')
        mobile_skill, _ = Skill.objects.get_or_create(name='Mobile Development')

        # Get or create a pathway
        pathway, created = GrowthPathway.objects.get_or_create(
            user=user,
            title='Complete React Native Development',
            defaults={
                'description': 'Master React Native development from basics to advanced concepts. Build real-world mobile applications and learn industry best practices.',
                'pathway_type': 'mobile_dev',
                'difficulty_level': 'intermediate',
                'status': 'in_progress',
                'current_step': 0,
                'total_steps': 8,
                'is_completed': False,
                'estimated_duration': 14,
                'is_public': True,
                'allow_collaboration': True,
                'total_time_spent': 0,
                'completion_rate': 0.0,
                'preferred_learning_style': 'kinesthetic'
            }
        )
        if created:
            pathway.required_skills.add(js_skill, react_skill, mobile_skill)
            self.stdout.write(f'Created pathway: {pathway.title}')
        else:
            self.stdout.write(f'Using existing pathway: {pathway.title}')

        # Create pathway steps
        steps_data = [
            {
                'step_number': 1,
                'title': 'Introduction to React Native',
                'description': 'Learn the fundamentals of React Native development, including components, props, and state management. This step covers the basics you need to start building mobile apps.',
                'step_type': 'video',
                'content_url': 'https://example.com/react-native-intro',
                'estimated_duration': 45,
                'has_quiz': True,
                'passing_score': 70,
            },
            {
                'step_number': 2,
                'title': 'Setting Up Development Environment',
                'description': 'Configure your development environment with React Native CLI, Android Studio, and Xcode. Learn about debugging tools and best practices.',
                'step_type': 'tutorial',
                'content_url': 'https://example.com/setup-environment',
                'estimated_duration': 60,
                'has_quiz': False,
                'passing_score': 70,  # Default value even if no quiz
            },
            {
                'step_number': 3,
                'title': 'Building Your First App',
                'description': 'Create a simple todo app to practice React Native concepts. Learn about navigation, styling, and user interactions.',
                'step_type': 'project',
                'content_url': 'https://example.com/first-app',
                'estimated_duration': 90,
                'has_quiz': True,
                'passing_score': 80,
            },
            {
                'step_number': 4,
                'title': 'State Management with Redux',
                'description': 'Learn how to manage complex application state using Redux. Understand actions, reducers, and the Redux store.',
                'step_type': 'video',
                'content_url': 'https://example.com/redux-tutorial',
                'estimated_duration': 75,
                'has_quiz': True,
                'passing_score': 75,
            },
            {
                'step_number': 5,
                'title': 'API Integration and Data Fetching',
                'description': 'Learn how to fetch data from APIs, handle loading states, and implement error handling in React Native apps.',
                'step_type': 'tutorial',
                'content_url': 'https://example.com/api-integration',
                'estimated_duration': 50,
                'has_quiz': False,
                'passing_score': 70,  # Default value even if no quiz
            },
            {
                'step_number': 6,
                'title': 'Testing and Debugging',
                'description': 'Master testing strategies for React Native apps. Learn about unit tests, integration tests, and debugging techniques.',
                'step_type': 'video',
                'content_url': 'https://example.com/testing-debugging',
                'estimated_duration': 65,
                'has_quiz': True,
                'passing_score': 70,
            },
            {
                'step_number': 7,
                'title': 'Performance Optimization',
                'description': 'Learn techniques to optimize React Native app performance, including image optimization, lazy loading, and memory management.',
                'step_type': 'tutorial',
                'content_url': 'https://example.com/performance',
                'estimated_duration': 55,
                'has_quiz': True,
                'passing_score': 75,
            },
            {
                'step_number': 8,
                'title': 'Publishing Your App',
                'description': 'Learn how to build and publish your React Native app to the App Store and Google Play Store. Understand the submission process and requirements.',
                'step_type': 'project',
                'content_url': 'https://example.com/publishing',
                'estimated_duration': 80,
                'has_quiz': False,
                'passing_score': 70,  # Default value even if no quiz
            }
        ]

        # Clear existing steps for this pathway
        PathwayStep.objects.filter(pathway=pathway).delete()
        self.stdout.write('Cleared existing pathway steps')

        # Create new steps
        created_steps = []
        for step_data in steps_data:
            step, created = PathwayStep.objects.get_or_create(
                pathway=pathway,
                step_number=step_data['step_number'],
                defaults={
                    'title': step_data['title'],
                    'description': step_data['description'],
                    'step_type': step_data['step_type'],
                    'content_url': step_data['content_url'],
                    'estimated_duration': step_data['estimated_duration'],
                    'has_quiz': step_data['has_quiz'],
                    'passing_score': step_data['passing_score'],
                    'is_completed': False,
                }
            )
            created_steps.append(step)
            if created:
                self.stdout.write(f'Created step {step.step_number}: {step.title}')

        # Set up prerequisites
        if len(created_steps) >= 2:
            # Step 2 requires step 1
            created_steps[1].prerequisites.add(created_steps[0])
            
        if len(created_steps) >= 3:
            # Step 3 requires steps 1 and 2
            created_steps[2].prerequisites.add(created_steps[0], created_steps[1])
            
        if len(created_steps) >= 4:
            # Step 4 requires step 3
            created_steps[3].prerequisites.add(created_steps[2])
            
        if len(created_steps) >= 5:
            # Step 5 requires step 4
            created_steps[4].prerequisites.add(created_steps[3])
            
        if len(created_steps) >= 6:
            # Step 6 requires step 5
            created_steps[5].prerequisites.add(created_steps[4])
            
        if len(created_steps) >= 7:
            # Step 7 requires step 6
            created_steps[6].prerequisites.add(created_steps[5])
            
        if len(created_steps) >= 8:
            # Step 8 requires step 7
            created_steps[7].prerequisites.add(created_steps[6])

        # Update pathway total steps
        pathway.total_steps = len(created_steps)
        pathway.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_steps)} pathway steps for pathway: {pathway.title}'
            )
        )
        self.stdout.write(f'Pathway ID: {pathway.id}')
        self.stdout.write(f'User ID: {user.id}')
