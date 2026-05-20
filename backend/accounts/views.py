from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MeSerializer, PatientRegisterSerializer


class PatientRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PatientRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()

        return Response(
            {
                "message": "Patient registered successfully",
                "patient_id": patient.id,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        patient = getattr(user, "patient_account", None)

        data = {
            "id": user.id,
            "username": user.username,
            "full_name": patient.name if patient else (user.first_name or user.username),
            "role": role,
            "patient_id": patient.id if patient else None,
        }

        serializer = MeSerializer(data)
        return Response(serializer.data)