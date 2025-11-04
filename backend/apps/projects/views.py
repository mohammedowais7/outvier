from rest_framework import viewsets, permissions
from apps.users.permissions import IsAuthenticatedOrReadOnly, IsMentorOrAdmin, IsMemberOrAbove
from .models import Project, ProjectCategory, ProjectMember, ProjectMilestone, ProjectUpdate, ProjectApplication


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectCategory.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    # Only mentors/moderators/admin can create/update; everyone can read
    permission_classes = [IsMentorOrAdmin]


class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    queryset = ProjectMilestone.objects.all()
    permission_classes = [IsMentorOrAdmin]


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    queryset = ProjectUpdate.objects.all()
    permission_classes = [IsMemberOrAbove]


class ProjectApplicationViewSet(viewsets.ModelViewSet):
    queryset = ProjectApplication.objects.all()
    permission_classes = [IsMemberOrAbove]
