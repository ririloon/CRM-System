import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import Grid from "@mui/material/Grid";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const panelSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const subtleCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

function PatientDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("patients/"),
      api.get("appointments/"),
      api.get("medical-documents/"),
    ]).then((results) => {
      const patientRes = results[0];
      const appointmentsRes = results[1];
      const documentsRes = results[2];

      if (patientRes.status === "fulfilled") {
        const payload = Array.isArray(patientRes.value.data)
          ? patientRes.value.data[0]
          : patientRes.value.data;
        setPatient(payload || null);
      }

      if (appointmentsRes.status === "fulfilled") {
        setAppointments(Array.isArray(appointmentsRes.value.data) ? appointmentsRes.value.data : []);
      }

      if (documentsRes.status === "fulfilled") {
        setDocuments(Array.isArray(documentsRes.value.data) ? documentsRes.value.data : []);
      }

      setLoading(false);
    });
  }, []);

  const now = new Date();

  const computed = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
    const upcoming = sorted.filter((item) => new Date(item.date) >= now);
    const past = sorted.filter((item) => new Date(item.date) < now);

    return {
      totalAppointments: appointments.length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
      nextAppointment: upcoming[0] || null,
      documentsCount: documents.length,
    };
  }, [appointments, documents, now]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString(
        i18n.language === "ky" ? "ky-KG" : i18n.language === "en" ? "en-US" : "ru-RU",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return value;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "confirmed":
        return "primary";
      case "cancelled":
        return "error";
      case "no_show":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    return t(`dashboard.status.${status}`, status || "Unknown");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    {
      title: t("patientDashboard.cards.upcoming", "Upcoming appointments"),
      value: computed.upcomingCount,
      icon: <EventAvailableOutlinedIcon fontSize="small" />,
    },
    {
      title: t("patientDashboard.cards.total", "Total appointments"),
      value: computed.totalAppointments,
      icon: <CalendarMonthOutlinedIcon fontSize="small" />,
    },
    {
      title: t("patientDashboard.cards.documents", "My documents"),
      value: computed.documentsCount,
      icon: <DescriptionOutlinedIcon fontSize="small" />,
    },
    {
      title: t("patientDashboard.cards.profile", "Profile completeness"),
      value: patient?.name && patient?.phone ? "Good" : "Basic",
      icon: <PersonOutlineOutlinedIcon fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f8fafc",
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Paper sx={{ ...panelSx, p: { xs: 2, md: 3 }, mb: 2.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Typography
              sx={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#64748b",
                fontWeight: 700,
                mb: 1,
              }}
            >
              {t("patientDashboard.eyebrow", "Patient portal")}
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 28, md: 34 },
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#0f172a",
                mb: 1,
              }}
            >
              {t("patientDashboard.title", "Welcome to your care dashboard")}
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                maxWidth: 760,
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              {t(
                "patientDashboard.subtitle",
                "Review your upcoming appointments, documents, and profile information in one place."
              )}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1.25}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={() => navigate("/patient/book")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  boxShadow: "none",
                  py: 1.2,
                  justifyContent: "space-between",
                }}
              >
                {t("patientDashboard.actions.book", "Book appointment")}
              </Button>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={() => navigate("/patient/appointments")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  borderColor: "#cbd5e1",
                  color: "#0f172a",
                  py: 1.2,
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                {t("patientDashboard.actions.viewAppointments", "View appointments")}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {cards.map((item) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.title}>
            <Paper sx={{ ...panelSx, p: 2.25, height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 30,
                      lineHeight: 1,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    minWidth: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                  }}
                >
                  {item.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a", mb: 1 }}>
              {t("patientDashboard.nextVisit.title", "Next appointment")}
            </Typography>

            <Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
              {t(
                "patientDashboard.nextVisit.subtitle",
                "Your nearest scheduled clinic visit appears here."
              )}
            </Typography>

            {computed.nextAppointment ? (
              <Box sx={{ ...subtleCardSx, p: 2.25 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a", mb: 0.75 }}>
                      {computed.nextAppointment.doctor_name ||
                        t("patientDashboard.fallbacks.doctor", "Assigned doctor")}
                    </Typography>

                    <Typography sx={{ color: "#475569", mb: 0.75 }}>
                      {formatDateTime(computed.nextAppointment.date)}
                    </Typography>

                    {computed.nextAppointment.reason && (
                      <Typography sx={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                        {computed.nextAppointment.reason}
                      </Typography>
                    )}
                  </Box>

                  <Chip
                    label={getStatusLabel(computed.nextAppointment.status)}
                    color={getStatusColor(computed.nextAppointment.status)}
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: "10px" }}
                  />
                </Stack>
              </Box>
            ) : (
              <Box sx={{ ...subtleCardSx, p: 2.5 }}>
                <Typography sx={{ color: "#64748b" }}>
                  {t(
                    "patientDashboard.nextVisit.empty",
                    "No upcoming appointment is scheduled yet."
                  )}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2.5}>
            <Paper sx={{ ...panelSx, p: 3 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a", mb: 1 }}>
                {t("patientDashboard.profileCard.title", "Profile overview")}
              </Typography>

              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
                {t(
                  "patientDashboard.profileCard.subtitle",
                  "Your patient profile information currently available in the system."
                )}
              </Typography>

              <Stack spacing={1.25}>
                <Box sx={{ ...subtleCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientDashboard.profileCard.name", "Full name")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {patient?.name || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...subtleCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientDashboard.profileCard.phone", "Phone")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {patient?.phone || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...subtleCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientDashboard.profileCard.email", "Email")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {patient?.email || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ ...panelSx, p: 3 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a", mb: 1 }}>
                {t("patientDashboard.quickActions.title", "Quick actions")}
              </Typography>

              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
                {t(
                  "patientDashboard.quickActions.subtitle",
                  "Use these shortcuts to navigate your main patient tasks."
                )}
              </Typography>

              <Stack spacing={1.25}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/patient/book")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    boxShadow: "none",
                    py: 1.2,
                    justifyContent: "space-between",
                  }}
                >
                  {t("patientDashboard.quickActions.book", "Create new appointment")}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/patient/appointments")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    py: 1.2,
                    justifyContent: "space-between",
                    backgroundColor: "#fff",
                  }}
                >
                  {t("patientDashboard.quickActions.appointments", "Open my appointments")}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/patient/profile")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    py: 1.2,
                    justifyContent: "space-between",
                    backgroundColor: "#fff",
                  }}
                >
                  {t("patientDashboard.quickActions.profile", "Open my profile")}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PatientDashboard;