from rest_framework import serializers
from .models import Patient, Doctor, Appointment


class PatientSerializer(serializers.ModelSerializer):
    appointments_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "birth_date",
            "notes",
            "appointments_count",
        ]


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id", "name", "specialization", "phone", "email"]


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    doctor_specialization = serializers.CharField(source="doctor.specialization", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "date",
            "status",
            "complaint",
            "comment",
            "patient_name",
            "doctor_name",
            "doctor_specialization",
        ]


class PatientDetailSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "birth_date",
            "notes",
            "appointments",
        ]