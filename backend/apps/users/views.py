from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Skill, UserSkill, Certification, UserPreference
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    SkillSerializer,
    UserSkillSerializer,
    CertificationSerializer,
    UserPreferenceSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role', 'status', 'location']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'company']
    ordering_fields = ['created_at', 'reputation_score', 'last_active']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Non-staff users can only see active users
            queryset = queryset.filter(status='active')
        return queryset
    
    @action(detail=False, methods=['get'])
    def mentors(self, request):
        """Get all mentors"""
        mentors = self.get_queryset().filter(role__in=['mentor', 'admin', 'moderator'])
        serializer = self.get_serializer(mentors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mentees(self, request):
        """Get all mentees"""
        mentees = self.get_queryset().filter(role__in=['mentee', 'member'])
        serializer = self.get_serializer(mentees, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def match(self, request, pk=None):
        """Find matching users based on skills and preferences"""
        user = self.get_object()
        # Implement matching logic here
        # This would involve finding users with complementary skills
        return Response({'message': 'Matching functionality to be implemented'})


class UserRegistrationView(APIView):
    """
    User registration endpoint
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens for immediate login
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Return format expected by mobile app
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'date_joined': user.date_joined.isoformat(),
                    'username': user.username,
                },
                'sessionid': str(access_token),
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(APIView):
    """
    Custom login endpoint that returns format expected by mobile app
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user and user.is_active:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Return format expected by mobile app
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'date_joined': user.date_joined.isoformat(),
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'username': user.username,
                },
                'sessionid': str(access_token),
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    """
    User profile management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """
    Password change endpoint
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(old_password):
                return Response(
                    {'error': 'Old password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                validate_password(new_password, user)
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password changed successfully'})
            except ValidationError as e:
                return Response(
                    {'error': e.messages},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    Returns the currently authenticated user's profile.
    Used by the frontend to verify session on app startup.
    GET /auth/me/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    """
    Logs out the current user.
    POST /auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    Sends a password reset email to the provided address.
    POST /auth/forgot-password/  — body: { "email": "..." }
    Always returns 200 to prevent email enumeration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"

            send_mail(
                subject='Password Reset Request',
                message=(
                    f"Hi {user.first_name or user.username},\n\n"
                    f"Click the link below to reset your password:\n{reset_url}\n\n"
                    f"If you didn't request this, please ignore this email."
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@outvier.com'),
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # Don't reveal whether the email exists

        return Response(
            {'message': 'If an account with that email exists, password reset instructions have been sent.'},
            status=status.HTTP_200_OK,
        )


class SkillViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing skills
    """
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['category', 'name']


class UserSkillViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user skills
    """
    queryset = UserSkill.objects.all()
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['proficiency_level', 'is_verified', 'skill__category']
    search_fields = ['skill__name', 'user__username']
    ordering_fields = ['created_at', 'proficiency_level']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserSkill.objects.all()
        return UserSkill.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CertificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing certifications
    """
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_verified', 'issuing_organization']
    search_fields = ['name', 'issuing_organization', 'credential_id']
    ordering_fields = ['issue_date', 'created_at']
    ordering = ['-issue_date']
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Certification.objects.all()
        return Certification.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user preferences
    """
    queryset = UserPreference.objects.all()
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserPreference.objects.all()
        return UserPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
