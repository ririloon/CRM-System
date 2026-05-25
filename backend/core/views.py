from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from datetime import datetime
from django.utils.dateparse import parse_date
from django.shortcuts import get_object_or_404
from rest_framework import status

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
        

class PatientMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient = getattr(request.user, "patient_account", None)
        if not patient:
            return Response(
                {"detail": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def patch(self, request):
        patient = getattr(request.user, "patient_account", None)
        if not patient:
            return Response(
                {"detail": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
        
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
    
    @action(detail=True, methods=["get"], url_path="available-slots")
    def available_slots(self, request, pk=None):
        doctor = self.get_object()
        date_str = request.query_params.get("date")

        if not date_str:
            return Response(
                {"detail": "date query param is required. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_date = parse_date(date_str)
        if not target_date:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()
        now = timezone.localtime()

        if target_date < today:
            return Response(
                {
                    "doctor_id": doctor.id,
                    "date": target_date.isoformat(),
                    "slots": [],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        weekday = target_date.weekday()
        schedules = doctor.schedules.filter(
            day_of_week=weekday,
            is_active=True
        ).order_by("start_time")

        booked_datetimes = set(
            Appointment.objects.filter(
                doctor=doctor,
                date__date=target_date,
                status__in=["scheduled", "confirmed", "completed"],
            ).values_list("date", flat=True)
        )

        slots = []

        for schedule in schedules:
            current = datetime.combine(target_date, schedule.start_time)
            end_dt = datetime.combine(target_date, schedule.end_time)

            current = timezone.make_aware(
                current,
                timezone.get_current_timezone()
            )
            end_dt = timezone.make_aware(
                end_dt,
                timezone.get_current_timezone()
            )

            while current < end_dt:
                if current > now and current not in booked_datetimes:
                    slots.append(
                        {
                            "value": current.isoformat(),
                            "label": timezone.localtime(current).strftime("%H:%M"),
                        }
                    )

                current += timedelta(minutes=schedule.slot_duration)

        return Response(
            {
                "doctor_id": doctor.id,
                "date": target_date.isoformat(),
                "slots": slots,
            }
        )
    
    
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
        user = self.request.user
        profile = getattr(user, "profile", None)

        if profile and profile.role == "patient":
            patient = getattr(user, "patient_account", None)
            if not patient:
                raise permissions.PermissionDenied("Patient profile not found.")
            appointment = serializer.save(patient=patient, booking_source="web")
        else:
            appointment = serializer.save()

        NotificationLog.objects.create(
            appointment=appointment,
            channel="email",
            message_type="confirmation",
            status="pending",
        )
    
    @action(detail=False, methods=["get"], url_path="my")
    def my_appointments(self, request):
        queryset = self.get_queryset().order_by("date")
        serializer = AppointmentListSerializer(queryset, many=True)
        return Response(serializer.data)
            
            
    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = "confirmed"
        appointment.save()

        NotificationLog.objects.create(
            appointment=appointment,
            channel="email",
            message_type="confirmation",
            status="pending",
        )

        return Response({"status": "confirmed"})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = "cancelled"
        appointment.save()

        NotificationLog.objects.create(
            appointment=appointment,
            channel="email",
            message_type="cancellation",
            status="pending",
        )

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

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, "profile", None)
        appointment = serializer.validated_data["appointment"]

        if not profile or profile.role != "doctor":
            raise permissions.PermissionDenied("Only doctors can create visit records.")

        doctor = getattr(user, "doctor_account", None)
        if not doctor:
            raise permissions.PermissionDenied("Doctor profile not found.")

        if appointment.doctor_id != doctor.id:
            raise permissions.PermissionDenied("You can only create visit records for your own appointments.")

        if hasattr(appointment, "visit_record"):
            raise permissions.PermissionDenied("Visit record already exists for this appointment.")

        serializer.save(
            patient=appointment.patient,
            doctor=appointment.doctor,
        )

        appointment.status = "completed"
        appointment.save()
        
    @action(detail=False, methods=["get"], url_path="my")
    def my_records(self, request):
        queryset = self.get_queryset().order_by("-created_at")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related(
        "visit_record",
        "visit_record__patient",
        "visit_record__doctor",
    ).all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)
        qs = super().get_queryset()

        if not profile:
            return qs.none()

        if profile.role == "patient":
            return qs.filter(visit_record__patient__user=user)

        if profile.role == "doctor":
            return qs.filter(visit_record__doctor__user=user)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, "profile", None)

        if not profile or profile.role != "doctor":
            raise permissions.PermissionDenied("Only doctors can create prescriptions.")

        visit_record = serializer.validated_data.get("visit_record")
        if visit_record and visit_record.doctor.user_id != user.id:
            raise permissions.PermissionDenied("You can only create prescriptions for your own visit records.")

        serializer.save()


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
            return qs

        return qs
    
    @action(detail=False, methods=["get"], url_path="my")
    def my_documents(self, request):
        queryset = self.get_queryset().order_by("-uploaded_at")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NotificationLog.objects.select_related("appointment").all()
    serializer_class = NotificationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today_start + timedelta(days=1)
        week_end = today_start + timedelta(days=7)

        user = request.user
        profile = getattr(user, "profile", None)

        appointments = Appointment.objects.select_related("patient", "doctor").all()

        if profile and profile.role == "doctor":
            appointments = appointments.filter(doctor__user=user)
        elif profile and profile.role == "patient":
            appointments = appointments.filter(patient__user=user)

        patients_qs = Patient.objects.all()
        doctors_qs = Doctor.objects.all()

        if profile and profile.role == "patient":
            patients_count = 1
        else:
            patients_count = patients_qs.count()

        doctors_count = doctors_qs.count()

        future_appointments_count = appointments.filter(date__gte=now).count()
        today_appointments_count = appointments.filter(
            date__gte=today_start,
            date__lt=tomorrow
        ).count()
        week_appointments_count = appointments.filter(
            date__gte=today_start,
            date__lt=week_end
        ).count()
        completed_appointments_count = appointments.filter(status="completed").count()
        cancelled_appointments_count = appointments.filter(status="cancelled").count()
        no_show_appointments_count = appointments.filter(status="no_show").count()
        confirmed_appointments_count = appointments.filter(status="confirmed").count()
        total_appointments_count = appointments.count()

        recent_appointments_qs = appointments.order_by("-date")[:6]
        today_schedule_qs = appointments.filter(
            date__gte=today_start,
            date__lt=tomorrow
        ).order_by("date")[:6]

        recent_appointments = [
            {
                "id": item.id,
                "patient_name": item.patient.name if item.patient else "-",
                "doctor_name": item.doctor.name if item.doctor else "-",
                "date": item.date,
                "status": item.status,
            }
            for item in recent_appointments_qs
        ]

        today_schedule_preview = [
            {
                "id": item.id,
                "patient_name": item.patient.name if item.patient else "-",
                "doctor_name": item.doctor.name if item.doctor else "-",
                "date": item.date,
                "status": item.status,
            }
            for item in today_schedule_qs
        ]

        weekly_trend = []
        for i in range(7):
            day_start = today_start + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            daily_count = appointments.filter(date__gte=day_start, date__lt=day_end).count()

            weekly_trend.append({
                "date": day_start.date().isoformat(),
                "count": daily_count,
            })

        appointments_by_status = {
            "confirmed": confirmed_appointments_count,
            "completed": completed_appointments_count,
            "cancelled": cancelled_appointments_count,
            "no_show": no_show_appointments_count,
        }

        data = {
            "patients_count": patients_count,
            "doctors_count": doctors_count,
            "total_appointments_count": total_appointments_count,
            "future_appointments_count": future_appointments_count,
            "today_appointments_count": today_appointments_count,
            "week_appointments_count": week_appointments_count,
            "completed_appointments_count": completed_appointments_count,
            "cancelled_appointments_count": cancelled_appointments_count,
            "no_show_appointments_count": no_show_appointments_count,
            "confirmed_appointments_count": confirmed_appointments_count,
            "appointments_by_status": appointments_by_status,
            "weekly_trend": weekly_trend,
            "recent_appointments": recent_appointments,
            "today_schedule_preview": today_schedule_preview,
        }

        return Response(data)