from rest_framework import serializers
from .models import (
    Patient,
    Doctor,
    Appointment,
    DoctorSchedule,
    VisitRecord,
    Prescription,
    MedicalDocument,
    NotificationLog,
)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "birth_date",
            "gender",
            "address",
            "emergency_contact_name",
            "emergency_contact_phone",
            "allergies",
            "chronic_conditions",
            "notes",
        ]


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            "id",
            "name",
            "specialization",
            "phone",
            "email",
            "license_number",
            "experience_years",
            "bio",
            "is_available_online",
        ]


class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor = serializers.StringRelatedField()

    class Meta:
        model = DoctorSchedule
        fields = [
            "id",
            "doctor",
            "day_of_week",
            "start_time",
            "end_time",
            "slot_duration",
            "is_active",
        ]


class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "date",
            "status",
            "booking_source",
        ]


class AppointmentDetailSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        source="patient",
        write_only=True,
        required=False,
    )
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source="doctor",
        write_only=True,
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_id",
            "doctor",
            "doctor_id",
            "date",
            "status",
            "complaint",
            "comment",
            "booking_source",
            "confirmation_sent",
            "reminder_sent",
            "created_at",
        ]
        read_only_fields = [
            "status",
            "booking_source",
            "confirmation_sent",
            "reminder_sent",
            "created_at",
        ]

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = [
            "id",
            "medication_name",
            "dosage",
            "frequency",
            "duration",
            "instructions",
        ]


class VisitRecordSerializer(serializers.ModelSerializer):
    patient = serializers.StringRelatedField(read_only=True)
    doctor = serializers.StringRelatedField(read_only=True)
    appointment_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(),
        source="appointment",
        write_only=True,
    )
    prescriptions = PrescriptionSerializer(many=True, read_only=True)

    class Meta:
        model = VisitRecord
        fields = [
            "id",
            "appointment",
            "appointment_id",
            "patient",
            "doctor",
            "diagnosis",
            "treatment_plan",
            "doctor_notes",
            "follow_up_date",
            "created_at",
            "prescriptions",
        ]
        read_only_fields = ["appointment", "patient", "doctor", "created_at"]


class MedicalDocumentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.name", read_only=True)

    class Meta:
        model = MedicalDocument
        fields = [
            "id",
            "patient",
            "patient_name",
            "visit_record",
            "title",
            "document_type",
            "file",
            "uploaded_at",
        ]


class NotificationLogSerializer(serializers.ModelSerializer):
    appointment_info = serializers.CharField(
        source="appointment.__str__",
        read_only=True,
    )

    class Meta:
        model = NotificationLog
        fields = [
            "id",
            "appointment",
            "appointment_info",
            "channel",
            "message_type",
            "status",
            "sent_at",
        ]