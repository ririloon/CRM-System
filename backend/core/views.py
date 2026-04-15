from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Patient, Doctor, Appointment
from .serializers import (
    PatientSerializer,
    DoctorSerializer,
    AppointmentSerializer,
    PatientDetailSerializer,
)

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import AppointmentSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().annotate(
        appointments_count=Count("appointments")
    ).order_by("-id")
    serializer_class = PatientSerializer

    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        patient = self.get_object()
        serializer = PatientDetailSerializer(patient)
        return Response(serializer.data)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("name")
    serializer_class = DoctorSerializer


class AppointmentViewSet(ModelViewSet):
    queryset = Appointment.objects.all().select_related("patient", "doctor")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # Если нет профиля — ничего не отдаём
        if not hasattr(user, "userprofile"):
            return qs.none()

        role = user.userprofile.role

        # Admin видит всё
        if role == "admin":
            return qs.order_by("date")

        # Patient — пока видит все записи (мы позже можем сузить)
        if role == "patient":
            return qs.order_by("date")

        return qs.none()


@api_view(["GET"])
def dashboard_stats(request):
    today = timezone.localdate()

    total_patients = Patient.objects.count()
    total_doctors = Doctor.objects.count()
    total_appointments = Appointment.objects.count()
    today_appointments = Appointment.objects.filter(date__date=today).count()
    completed_appointments = Appointment.objects.filter(status="completed").count()
    cancelled_appointments = Appointment.objects.filter(status="cancelled").count()

    recent_appointments = Appointment.objects.select_related("patient", "doctor").order_by("-date")[:5]

    recent_data = [
        {
            "id": item.id,
            "patient_name": item.patient.name,
            "doctor_name": item.doctor.name,
            "date": item.date,
            "status": item.status,
        }
        for item in recent_appointments
    ]

    return Response({
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "recent_appointments": recent_data,
    })