from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    DoctorViewSet,
    AppointmentViewSet,
    dashboard_stats,
)

router = DefaultRouter()
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("dashboard/", dashboard_stats, name="dashboard-stats"),
    path("", include(router.urls)),
]