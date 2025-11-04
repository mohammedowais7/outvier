from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticatedOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class IsMemberOrAbove(BasePermission):
    allowed_roles = {"member", "mentor", "mentee", "moderator", "admin"}

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) in self.allowed_roles)


class IsMentorOrAdmin(BasePermission):
    allowed_roles = {"mentor", "moderator", "admin"}

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) in self.allowed_roles)

