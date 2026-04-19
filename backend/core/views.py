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



from .models import Patient, Doctor, Appointment
from .serializers import (
    PatientSerializer,
    DoctorSerializer,
    AppointmentSerializer,
)

from .serializers import PatientDetailSerializer

class PatientViewSet(ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if not hasattr(user, "userprofile"):
            return qs.none()

        role = user.userprofile.role

        if role == "admin":
            return qs.order_by("id")

        # patient пока видит всех пациентов (потом можно сузить)
        if role == "patient":
            return qs.order_by("id")

        return qs.none()
    
    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        patient = self.get_object()
        serializer = PatientDetailSerializer(patient)
        return Response(serializer.data)


class DoctorViewSet(ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if not hasattr(user, "userprofile"):
            return qs.none()

        role = user.userprofile.role

        if role == "admin":
            return qs.order_by("id")

        if role == "patient":
            # пациентам можно показывать всех врачей
            return qs.order_by("id")

        return qs.none()


class AppointmentViewSet(ModelViewSet):
    queryset = Appointment.objects.all().select_related("patient", "doctor")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if not hasattr(user, "userprofile"):
            return qs.none()

        role = user.userprofile.role

        if role == "admin":
            return qs.order_by("date")

        if role == "patient":
            # позже можно будет сузить до своих приёмов
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