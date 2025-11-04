from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import Skill, UserPreference

User = get_user_model()


class Command(BaseCommand):
    help = 'Create initial data for the DNC platform'

    def handle(self, *args, **options):
        self.stdout.write('Creating initial data...')
        
        # Create skills
        skills_data = [
            # AI & Machine Learning
            {'name': 'Python', 'category': 'Programming'},
            {'name': 'Machine Learning', 'category': 'AI/ML'},
            {'name': 'Deep Learning', 'category': 'AI/ML'},
            {'name': 'Natural Language Processing', 'category': 'AI/ML'},
            {'name': 'Computer Vision', 'category': 'AI/ML'},
            {'name': 'TensorFlow', 'category': 'AI/ML'},
            {'name': 'PyTorch', 'category': 'AI/ML'},
            {'name': 'Scikit-learn', 'category': 'AI/ML'},
            
            # Data Science
            {'name': 'Data Analysis', 'category': 'Data Science'},
            {'name': 'Statistics', 'category': 'Data Science'},
            {'name': 'SQL', 'category': 'Data Science'},
            {'name': 'Pandas', 'category': 'Data Science'},
            {'name': 'NumPy', 'category': 'Data Science'},
            {'name': 'Matplotlib', 'category': 'Data Science'},
            {'name': 'Seaborn', 'category': 'Data Science'},
            {'name': 'Jupyter Notebooks', 'category': 'Data Science'},
            
            # DevOps
            {'name': 'Docker', 'category': 'DevOps'},
            {'name': 'Kubernetes', 'category': 'DevOps'},
            {'name': 'AWS', 'category': 'DevOps'},
            {'name': 'Azure', 'category': 'DevOps'},
            {'name': 'Google Cloud', 'category': 'DevOps'},
            {'name': 'CI/CD', 'category': 'DevOps'},
            {'name': 'Jenkins', 'category': 'DevOps'},
            {'name': 'Git', 'category': 'DevOps'},
            
            # Digital Marketing
            {'name': 'SEO', 'category': 'Digital Marketing'},
            {'name': 'SEM', 'category': 'Digital Marketing'},
            {'name': 'Social Media Marketing', 'category': 'Digital Marketing'},
            {'name': 'Content Marketing', 'category': 'Digital Marketing'},
            {'name': 'Email Marketing', 'category': 'Digital Marketing'},
            {'name': 'Google Analytics', 'category': 'Digital Marketing'},
            {'name': 'Facebook Ads', 'category': 'Digital Marketing'},
            {'name': 'Google Ads', 'category': 'Digital Marketing'},
            
            # Web Development
            {'name': 'JavaScript', 'category': 'Programming'},
            {'name': 'React', 'category': 'Web Development'},
            {'name': 'Vue.js', 'category': 'Web Development'},
            {'name': 'Node.js', 'category': 'Web Development'},
            {'name': 'Django', 'category': 'Web Development'},
            {'name': 'Flask', 'category': 'Web Development'},
            {'name': 'HTML/CSS', 'category': 'Web Development'},
            {'name': 'Bootstrap', 'category': 'Web Development'},
        ]
        
        for skill_data in skills_data:
            skill, created = Skill.objects.get_or_create(
                name=skill_data['name'],
                defaults={'category': skill_data['category']}
            )
            if created:
                self.stdout.write(f'Created skill: {skill.name}')
        
        # Create a superuser if none exists
        if not User.objects.filter(is_superuser=True).exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@dnc.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='admin',
                status='active'
            )
            self.stdout.write('Created admin user: admin/admin123')
        
        # Create a sample mentor user
        if not User.objects.filter(username='mentor1').exists():
            mentor = User.objects.create_user(
                username='mentor1',
                email='mentor@dnc.com',
                password='mentor123',
                first_name='John',
                last_name='Mentor',
                role='mentor',
                status='active',
                bio='Experienced AI/ML engineer with 10+ years in the field',
                company='Tech Corp',
                job_title='Senior AI Engineer',
                years_experience=10
            )
            self.stdout.write('Created mentor user: mentor1/mentor123')
        
        # Create a sample mentee user
        if not User.objects.filter(username='mentee1').exists():
            mentee = User.objects.create_user(
                username='mentee1',
                email='mentee@dnc.com',
                password='mentee123',
                first_name='Jane',
                last_name='Mentee',
                role='mentee',
                status='active',
                bio='Aspiring data scientist looking to break into AI/ML',
                company='Startup Inc',
                job_title='Junior Developer',
                years_experience=2
            )
            self.stdout.write('Created mentee user: mentee1/mentee123')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created initial data!')
        )
