from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet  # добавь сюда свои PatientViewSet, DoctorViewSet

router = DefaultRouter()
router.register(r"appointments", AppointmentViewSet, basename="appointment")
# router.register(r"patients", PatientViewSet)
# router.register(r"doctors", DoctorViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

#urlpatterns = [
#    path("", include(router.urls)),
#    path("dashboard/", dashboard_stats, name="dashboard-stats"),
#]
###