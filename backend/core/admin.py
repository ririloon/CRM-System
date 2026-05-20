from django.contrib import admin
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

admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(Appointment)
admin.site.register(DoctorSchedule)
admin.site.register(VisitRecord)
admin.site.register(Prescription)
admin.site.register(MedicalDocument)
admin.site.register(NotificationLog)