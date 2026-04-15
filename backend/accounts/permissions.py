from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated
            and hasattr(user, "userprofile")
            and user.userprofile.role == "admin"
        )