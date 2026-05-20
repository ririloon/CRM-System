from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

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
from .serializers import (
    PatientSerializer,
    DoctorSerializer,
    AppointmentListSerializer,
    AppointmentDetailSerializer,
    DoctorScheduleSerializer,
    VisitRecordSerializer,
    PrescriptionSerializer,
    MedicalDocumentSerializer,
    NotificationLogSerializer,
)
from accounts.models import UserProfile

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(
            request.user.is_authenticated and profile and profile.role == "admin"
        )


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(
            request.user.is_authenticated and profile and profile.role == "doctor"
        )


class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(
            request.user.is_authenticated and profile and profile.role == "patient"
        )
        
        
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("name")
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        # Пациент видит только себя
        if profile and profile.role == "patient":
            return Patient.objects.filter(user=user)

        # Врач/админ видят всех (пока так, потом можно ужесточить)
        return super().get_queryset()
    
    

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("name")
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        # Врач видит только себя
        if profile and profile.role == "doctor":
            return Doctor.objects.filter(user=user)

        return super().get_queryset()
    
    
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor").order_by("date")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["list"]:
            return AppointmentListSerializer
        return AppointmentDetailSerializer

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        qs = super().get_queryset()

        if not profile:
            return qs.none()

        if profile.role == "patient":
            # пациент видит только свои записи
            return qs.filter(patient__user=user)

        if profile.role == "doctor":
            # врач видит только свои записи
            return qs.filter(doctor__user=user)

        # админ — всё
        return qs

    def perform_create(self, serializer):
        # если пациент создаёт запись, автоматически привязываем его Patient
        user = self.request.user
        profile = getattr(user, "profile", None)

        if profile and profile.role == "patient":
            patient = getattr(user, "patient_account", None)
            serializer.save(patient=patient, booking_source="web")
        else:
            serializer.save()
            
            
    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = "confirmed"
        appointment.save()
        return Response({"status": "confirmed"})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = "cancelled"
        appointment.save()
        return Response({"status": "cancelled"})

    @action(detail=True, methods=["post"])
    def mark_no_show(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = "no_show"
        appointment.save()
        return Response({"status": "no_show"})
    
    
class DoctorScheduleViewSet(viewsets.ModelViewSet):
    queryset = DoctorSchedule.objects.select_related("doctor").all()
    serializer_class = DoctorScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        if profile and profile.role == "doctor":
            return self.queryset.filter(doctor__user=user)

        return self.queryset
    
    
class VisitRecordViewSet(viewsets.ModelViewSet):
    queryset = VisitRecord.objects.select_related(
        "appointment", "patient", "doctor"
    ).all()
    serializer_class = VisitRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)
        qs = super().get_queryset()

        if not profile:
            return qs.none()

        if profile.role == "patient":
            return qs.filter(patient__user=user)

        if profile.role == "doctor":
            return qs.filter(doctor__user=user)

        return qs
    
    
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related("visit_record").all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class MedicalDocumentViewSet(viewsets.ModelViewSet):
    queryset = MedicalDocument.objects.select_related("patient", "visit_record").all()
    serializer_class = MedicalDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)
        qs = super().get_queryset()

        if not profile:
            return qs.none()

        if profile.role == "patient":
            return qs.filter(patient__user=user)

        if profile.role == "doctor":
            return qs  # можно позже ограничить по пациентам врача

        return qs


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NotificationLog.objects.select_related("appointment").all()
    serializer_class = NotificationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
