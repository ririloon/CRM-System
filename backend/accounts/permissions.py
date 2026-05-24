from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        profile = getattr(user, "profile", None)
        return bool(
            user.is_authenticated
            and profile
            and profile.role == "admin"
        )