from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppointmentViewSet,
    DashboardSummaryView,
    DoctorScheduleViewSet,
    DoctorViewSet,
    MedicalDocumentViewSet,
    NotificationLogViewSet,
    PatientViewSet,
    PrescriptionViewSet,
    VisitRecordViewSet,
)

app_name = "core"

router = DefaultRouter()
router.register(r"patients", PatientViewSet, basename="patients")
router.register(r"doctors", DoctorViewSet, basename="doctors")
router.register(r"appointments", AppointmentViewSet, basename="appointments")
router.register(r"doctor-schedules", DoctorScheduleViewSet, basename="doctor-schedules")
router.register(r"visit-records", VisitRecordViewSet, basename="visit-records")
router.register(r"prescriptions", PrescriptionViewSet, basename="prescriptions")
router.register(r"documents", MedicalDocumentViewSet, basename="documents")
router.register(r"notifications", NotificationLogViewSet, basename="notifications")

urlpatterns = [
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("", include(router.urls)),
]