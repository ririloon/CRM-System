from rest_framework import serializers
from django.contrib.auth.models import User  # если не переопределяла User
from .models import UserProfile

class MeSerializer(serializers.ModelSerializer):
  role = serializers.CharField(source="userprofile.role", read_only=True)

  class Meta:
      model = User
      fields = ["id", "username", "first_name", "last_name", "email", "role"]