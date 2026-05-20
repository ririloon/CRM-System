from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PatientViewSet,
    DoctorViewSet,
    AppointmentViewSet,
    DoctorScheduleViewSet,
    VisitRecordViewSet,
    PrescriptionViewSet,
    MedicalDocumentViewSet,
    NotificationLogViewSet,
)

router = DefaultRouter()
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"appointments", AppointmentViewSet, basename="appointment")
router.register(r"doctor-schedules", DoctorScheduleViewSet, basename="doctor-schedule")
router.register(r"visit-records", VisitRecordViewSet, basename="visit-record")
router.register(r"prescriptions", PrescriptionViewSet, basename="prescription")
router.register(r"documents", MedicalDocumentViewSet, basename="medical-document")
router.register(r"notifications", NotificationLogViewSet, basename="notification-log")

urlpatterns = [
    path("", include(router.urls)),
]