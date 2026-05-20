from django.urls import path

from .views import MeView, PatientRegisterView

urlpatterns = [
    path("auth/register/patient/", PatientRegisterView.as_view(), name="patient-register"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]