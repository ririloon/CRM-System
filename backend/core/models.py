from django.db import models


class Patient(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("no_show", "No Show"),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    complaint = models.TextField(blank=True, null=True)
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.patient} - {self.doctor} - {self.date}"