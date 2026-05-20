from django.contrib.auth.models import User
from rest_framework import serializers

from core.models import Patient
from accounts.models import UserProfile


class PatientRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    name = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({
                "username": "Username already exists."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            first_name=validated_data["name"],
        )

        UserProfile.objects.create(user=user, role="patient")

        patient = Patient.objects.create(
            user=user,
            name=validated_data["name"],
            phone=validated_data["phone"],
            email=validated_data.get("email", ""),
        )

        return patient


class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True, allow_null=True)
    patient_id = serializers.IntegerField(read_only=True, allow_null=True)