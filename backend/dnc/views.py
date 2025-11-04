from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from django.urls import reverse_lazy
from django.db.models import Q, Count
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.db import IntegrityError

# Import models from your apps
from apps.users.models import User, Skill, Certification, UserSkill
from apps.projects.models import Project, ProjectApplication, ProjectCategory
from apps.events.models import Event, EventRegistration
from apps.forum.models import ForumCategory as Category, ForumTopic as Topic, ForumPost as Post
from apps.community.models import ActivityFeed
from apps.analytics.models import UserActivity

def home(request):
    """Home page with overview and statistics"""
    context = {
        'total_users': User.objects.count(),
        'total_projects': Project.objects.filter(status='active').count(),
        'total_events': Event.objects.filter(start_date__gte=timezone.now()).count(),
        'recent_projects': Project.objects.filter(status='active').order_by('-created_at')[:6],
        'upcoming_events': Event.objects.filter(start_date__gte=timezone.now()).order_by('start_date')[:4],
        'latest_topics': Topic.objects.all().order_by('-created_at')[:5],
    }
    return render(request, 'index.html', context)


def login_view(request):
    """Handle user login with username/email and password."""
    if request.method == 'POST':
        user_input = request.POST.get('username') or request.POST.get('email')
        password = request.POST.get('password')
        next_url = request.POST.get('next') or request.GET.get('next') or reverse_lazy('dashboard')
        User = get_user_model()

        # Try username first, then try as email
        user = authenticate(request, username=user_input, password=password)
        if user is None:
            try:
                user_obj = User.objects.get(email__iexact=user_input)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is not None and user.is_active:
            login(request, user)
            return redirect(next_url)

        messages.error(request, 'Invalid credentials. Please try again.')
        return render(request, 'auth/login.html', {'next': next_url}, status=401)
    # GET
    return render(request, 'auth/login.html', {'next': request.GET.get('next')})
def register_view(request):
    """Website registration view (GET renders form, POST creates user)."""
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        # Basic validation
        errors = {}
        if not username:
            errors['username'] = 'Username is required.'
        if not email:
            errors['email'] = 'Email is required.'
        if not password1 or not password2:
            errors['password'] = 'Both password fields are required.'
        if password1 != password2:
            errors['password_mismatch'] = 'Passwords do not match.'

        User = get_user_model()
        if not errors and User.objects.filter(username__iexact=username).exists():
            errors['username_exists'] = 'A user with that username already exists.'
        if not errors and User.objects.filter(email__iexact=email).exists():
            errors['email_exists'] = 'A user with that email already exists.'

        if errors:
            for _, msg in errors.items():
                messages.error(request, msg)
            return render(request, 'auth/register.html', status=400)

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1,
                first_name=first_name,
                last_name=last_name,
            )
        except IntegrityError:
            messages.error(request, 'Unable to create user. Please try a different username/email.')
            return render(request, 'auth/register.html', status=400)

        login(request, user)
        return redirect('dashboard')

    # GET
    return render(request, 'auth/register.html')



@login_required
def logout_view(request):
    """Log out current user and redirect to home."""
    logout(request)
    messages.success(request, 'You have been logged out.')
    return redirect('home')

@login_required
def dashboard(request):
    """User dashboard with personalized content"""
    user = request.user
    
    # Get user's projects
    user_projects = Project.objects.filter(
        Q(created_by=user) | Q(members__user=user)
    ).distinct().order_by('-created_at')[:5]
    
    # Get user's event registrations
    user_events = EventRegistration.objects.filter(
        user=user
    ).select_related('event').order_by('-registered_at')[:5]
    
    # Get user's recent activities
    recent_activities = UserActivity.objects.filter(
        user=user
    ).order_by('-created_at')[:10]
    
    # Get recommendations
    recommended_projects = Project.objects.filter(
        status='active'
    ).exclude(
        Q(created_by=user) | Q(members__user=user)
    ).distinct()[:3]
    
    context = {
        'user_projects': user_projects,
        'user_events': user_events,
        'recent_activities': recent_activities,
        'recommended_projects': recommended_projects,
        'total_projects': user_projects.count(),
        'total_events': user_events.count(),
    }
    return render(request, 'users/dashboard.html', context)

# Project Views
class ProjectListView(ListView):
    model = Project
    template_name = 'projects/listing.html'
    context_object_name = 'projects'
    paginate_by = 12
    
    def get_queryset(self):
        queryset = Project.objects.filter(status='active').select_related('created_by', 'category')
        
        # Search functionality
        search_query = self.request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(required_skills__name__icontains=search_query)
            ).distinct()
        
        # Filter by category
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by skills
        skills = self.request.GET.getlist('skills')
        if skills:
            queryset = queryset.filter(required_skills__name__in=skills).distinct()
        
        return queryset.order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = list(ProjectCategory.objects.filter(is_active=True).values_list('id', 'name'))
        context['skills'] = Skill.objects.values_list('name', flat=True).distinct()
        return context

class ProjectDetailView(DetailView):
    model = Project
    template_name = 'projects/detail.html'
    context_object_name = 'project'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project = self.get_object()
        
        # Check if user has already applied
        if self.request.user.is_authenticated:
            context['has_applied'] = ProjectApplication.objects.filter(
                project=project,
                applicant=self.request.user
            ).exists()
        
        # Get project applications
        context['applications'] = ProjectApplication.objects.filter(
            project=project
        ).select_related('applicant').order_by('-applied_at')
        
        # Get similar projects
        context['similar_projects'] = Project.objects.filter(
            category=project.category,
            status='active'
        ).exclude(id=project.id)[:4]
        
        return context

@login_required
def project_create(request):
    """Create new project"""
    if request.method == 'POST':
        # Handle project creation logic
        title = request.POST.get('title')
        description = request.POST.get('description')
        category = request.POST.get('category')
        required_skills = request.POST.getlist('required_skills')
        
        project = Project.objects.create(
            created_by=request.user,
            title=title,
            description=description,
            category=ProjectCategory.objects.filter(id=category).first() if category else None,
        )
        
        # Add required skills
        for skill_name in required_skills:
            skill, _ = Skill.objects.get_or_create(name=skill_name, defaults={"category": "General"})
            project.required_skills.add(skill)
        
        messages.success(request, 'Project created successfully!')
        return redirect('project_detail', pk=project.pk)
    
    context = {
        'categories': ProjectCategory.objects.filter(is_active=True),
        'skills': Skill.objects.all(),
    }
    return render(request, 'projects/create.html', context)

@login_required
def project_apply(request, project_id):
    """Apply to a project"""
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'POST':
        # Check if already applied
        if ProjectApplication.objects.filter(project=project, applicant=request.user).exists():
            messages.warning(request, 'You have already applied to this project.')
            return redirect('project_detail', pk=project.pk)
        
        # Validate required fields
        message = request.POST.get('message', '').strip()
        relevant_experience = request.POST.get('relevant_experience', '').strip()
        time_commitment = request.POST.get('time_commitment')
        weekly_hours = request.POST.get('weekly_hours')
        
        if not message:
            messages.error(request, 'Please provide a message/cover letter.')
            return render(request, 'projects/apply.html', {'project': project})
        
        if not relevant_experience:
            messages.error(request, 'Please describe your relevant experience.')
            return render(request, 'projects/apply.html', {'project': project})
        
        if not time_commitment:
            messages.error(request, 'Please select a time commitment.')
            return render(request, 'projects/apply.html', {'project': project})
        
        if not weekly_hours or not weekly_hours.isdigit():
            messages.error(request, 'Please provide a valid number of weekly hours.')
            return render(request, 'projects/apply.html', {'project': project})
        
        try:
            weekly_hours_int = int(weekly_hours)
            if weekly_hours_int < 1 or weekly_hours_int > 80:
                messages.error(request, 'Weekly hours must be between 1 and 80.')
                return render(request, 'projects/apply.html', {'project': project})
        except ValueError:
            messages.error(request, 'Please provide a valid number of weekly hours.')
            return render(request, 'projects/apply.html', {'project': project})
        
        # Create application
        ProjectApplication.objects.create(
            project=project,
            applicant=request.user,
            message=message,
            relevant_experience=relevant_experience,
            time_commitment=time_commitment,
            weekly_hours=weekly_hours_int,
            start_date=request.POST.get('start_date') or None,
        )
        
        messages.success(request, 'Application submitted successfully!')
        return redirect('project_detail', pk=project.pk)
    
    return render(request, 'projects/apply.html', {'project': project})

# Event Views
class EventListView(ListView):
    model = Event
    template_name = 'events/listing.html'
    context_object_name = 'events'
    paginate_by = 12
    
    def get_queryset(self):
        queryset = Event.objects.all().select_related('created_by')
        
        # Filter by date
        date_filter = self.request.GET.get('date')
        if date_filter == 'upcoming':
            queryset = queryset.filter(start_date__gte=timezone.now())
        elif date_filter == 'past':
            queryset = queryset.filter(start_date__lt=timezone.now())
        
        # Search functionality
        search_query = self.request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        return queryset.order_by('start_date')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['upcoming_events'] = Event.objects.filter(
            start_date__gte=timezone.now()
        ).order_by('start_date')[:6]
        return context

class EventDetailView(DetailView):
    model = Event
    template_name = 'events/detail.html'
    context_object_name = 'event'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        event = self.get_object()
        
        # Check if user is registered
        if self.request.user.is_authenticated:
            context['is_registered'] = EventRegistration.objects.filter(
                event=event,
                user=self.request.user
            ).exists()
        
        # Get attendees
        context['attendees'] = EventRegistration.objects.filter(
            event=event
        ).select_related('user')[:10]
        
        return context

@login_required
def event_register(request, event_id):
    """Register for an event"""
    event = get_object_or_404(Event, id=event_id)
    
    if request.method == 'POST':
        # Check if already registered
        if EventRegistration.objects.filter(event=event, user=request.user).exists():
            messages.warning(request, 'You are already registered for this event.')
            return redirect('event_detail', pk=event.pk)
        
        # Create registration
        EventRegistration.objects.create(
            event=event,
            user=request.user,
        )
        
        messages.success(request, 'Successfully registered for the event!')
        return redirect('event_detail', pk=event.pk)
    
    return render(request, 'events/register.html', {'event': event})

# Forum Views
class CategoryListView(ListView):
    model = Category
    template_name = 'forum/categories.html'
    context_object_name = 'categories'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add topic count for each category
        for category in context['categories']:
            category.topic_count = Topic.objects.filter(category=category).count()
            category.post_count = Post.objects.filter(topic__category=category).count()
        return context

class TopicListView(ListView):
    model = Topic
    template_name = 'forum/topics.html'
    context_object_name = 'topics'
    paginate_by = 20
    
    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        if category_id:
            return Topic.objects.filter(category_id=category_id).select_related('author', 'category')
        return Topic.objects.all().select_related('author', 'category')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if 'category_id' in self.kwargs:
            context['category'] = get_object_or_404(Category, id=self.kwargs['category_id'])
        return context

class TopicDetailView(DetailView):
    model = Topic
    template_name = 'forum/topic_detail.html'
    context_object_name = 'topic'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        topic = self.get_object()
        
        # Get posts with pagination
        posts = Post.objects.filter(topic=topic).select_related('author').order_by('created_at')
        paginator = Paginator(posts, 10)
        page_number = self.request.GET.get('page')
        context['posts'] = paginator.get_page(page_number)
        
        return context

@login_required
def topic_create(request, category_id):
    """Create new topic"""
    category = get_object_or_404(Category, id=category_id)
    
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        
        topic = Topic.objects.create(
            title=title,
            content=content,
            author=request.user,
            category=category,
        )
        
        messages.success(request, 'Topic created successfully!')
        return redirect('topic_detail', pk=topic.pk)
    
    return render(request, 'forum/create_topic.html', {'category': category})

@login_required
def post_create(request, topic_id):
    """Create new post in topic"""
    topic = get_object_or_404(Topic, id=topic_id)
    
    if request.method == 'POST':
        content = request.POST.get('content')
        
        Post.objects.create(
            content=content,
            author=request.user,
            topic=topic,
        )
        
        messages.success(request, 'Post added successfully!')
        return redirect('topic_detail', pk=topic.pk)
    
    return render(request, 'forum/create_post.html', {'topic': topic})

# Community Views
def community_directory(request):
    """Community member directory"""
    members = User.objects.filter(is_active=True)
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        members = members.filter(
            Q(username__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(user_skills__skill__name__icontains=search_query)
        ).distinct()
    
    # Filter by skills
    skills = request.GET.getlist('skills')
    if skills:
        members = members.filter(user_skills__skill__name__in=skills).distinct()
    
    # Pagination
    paginator = Paginator(members, 20)
    page_number = request.GET.get('page')
    members = paginator.get_page(page_number)
    
    context = {
        'members': members,
        'skills': Skill.objects.all(),
    }
    return render(request, 'community/directory.html', context)

def member_profile(request, user_id):
    """View community member profile"""
    member = get_object_or_404(User, id=user_id)
    
    context = {
        'member': member,
        'projects': Project.objects.filter(
            Q(created_by=member) | Q(members__user=member)
        ).distinct()[:5],
        'events': EventRegistration.objects.filter(
            user=member
        ).select_related('event')[:5],
        'topics': Topic.objects.filter(author=member)[:5],
    }
    return render(request, 'community/member_profile.html', context)

@login_required
def connect_request(request, user_id):
    """Send connection request"""
    target_user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        # Create connection request logic
        messages.success(request, f'Connection request sent to {target_user.username}!')
        return redirect('member_profile', user_id=user_id)
    
    return render(request, 'community/connect.html', {'target_user': target_user})

# Analytics Views
@login_required
def analytics_dashboard(request):
    """Analytics dashboard for users"""
    user = request.user
    
    # User activity over time
    activities = UserActivity.objects.filter(user=user).order_by('created_at')
    
    # Project statistics
    project_stats = {
        'total_created': Project.objects.filter(created_by=user).count(),
        'total_participated': Project.objects.filter(members__user=user).count(),
        'total_applications': ProjectApplication.objects.filter(applicant=user).count(),
    }
    
    # Event statistics
    event_stats = {
        'total_registered': EventRegistration.objects.filter(user=user).count(),
        'upcoming_events': EventRegistration.objects.filter(
            user=user,
            event__start_date__gte=timezone.now()
        ).count(),
    }
    
    context = {
        'project_stats': project_stats,
        'event_stats': event_stats,
        'activities': activities[:20],
    }
    return render(request, 'analytics/dashboard.html', context)

# Admin Views
@login_required
def admin_dashboard(request):
    """Admin dashboard with system overview"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied. Admin privileges required.')
        return redirect('home')
    
    # System statistics
    context = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'total_projects': Project.objects.count(),
        'active_projects': Project.objects.filter(status='active').count(),
        'total_events': Event.objects.count(),
        'upcoming_events': Event.objects.filter(start_date__gte=timezone.now()).count(),
        'total_topics': Topic.objects.count(),
        'total_posts': Post.objects.count(),
    }
    
    return render(request, 'admin/dashboard.html', context)

@login_required
def admin_users(request):
    """Admin user management"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied. Admin privileges required.')
        return redirect('home')
    
    users = User.objects.all().order_by('-date_joined')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        users = users.filter(
            Q(username__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        )
    
    # Pagination
    paginator = Paginator(users, 25)
    page_number = request.GET.get('page')
    users = paginator.get_page(page_number)
    
    context = {'users': users}
    return render(request, 'admin/users.html', context)

@login_required
def admin_analytics(request):
    """Admin analytics overview"""
    if not request.user.is_staff:
        messages.error(request, 'Access denied. Admin privileges required.')
        return redirect('home')
    
    # System analytics
    context = {
        'user_growth': User.objects.extra(
            select={'month': "EXTRACT(month FROM date_joined)"}
        ).values('month').annotate(count=Count('id')).order_by('month'),
        
        'project_stats': Project.objects.values('status').annotate(
            count=Count('id')
        ),
        
        'event_stats': Event.objects.extra(
            select={'month': "EXTRACT(month FROM start_date)"}
        ).values('month').annotate(count=Count('id')).order_by('month'),
    }
    
    return render(request, 'admin/analytics.html', context)

# API Views for AJAX
def search_projects(request):
    """AJAX search for projects"""
    query = request.GET.get('q', '')
    if len(query) < 2:
        return JsonResponse({'results': []})
    
    projects = Project.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query)
    ).values('id', 'title', 'description')[:10]
    
    return JsonResponse({'results': list(projects)})

def search_users(request):
    """AJAX search for users"""
    query = request.GET.get('q', '')
    if len(query) < 2:
        return JsonResponse({'results': []})
    
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).values('id', 'username', 'first_name', 'last_name')[:10]
    
    return JsonResponse({'results': list(users)})
