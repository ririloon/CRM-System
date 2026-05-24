import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import Grid from "@mui/material/Grid";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const panelSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const itemCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

function MyAppointments() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("appointments/")
      .then((res) => {
        const payload = Array.isArray(res.data) ? res.data : [];
        setAppointments(payload);
        setError("");
      })
      .catch((err) => {
        console.error("my appointments error:", err);
        setError(t("patientAppointments.errors.load", "Failed to load appointments."));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const now = new Date();

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return sortedAppointments.filter((item) => new Date(item.date) >= now);
  }, [sortedAppointments, now]);

  const pastAppointments = useMemo(() => {
    return sortedAppointments.filter((item) => new Date(item.date) < now).reverse();
  }, [sortedAppointments, now]);

  const metrics = useMemo(() => {
    const total = appointments.length;
    const upcoming = upcomingAppointments.length;
    const completed = appointments.filter((item) => item.status === "completed").length;
    const confirmed = appointments.filter((item) => item.status === "confirmed").length;

    return {
      total,
      upcoming,
      completed,
      confirmed,
    };
  }, [appointments, upcomingAppointments]);

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

  const renderAppointmentCard = (item) => (
    <Box key={item.id} sx={{ ...itemCardSx, p: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
            {item.doctor_name || t("patientAppointments.fallbacks.doctor", "Doctor not specified")}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: "#64748b" }} />
            <Typography sx={{ fontSize: 14, color: "#475569" }}>
              {formatDateTime(item.date)}
            </Typography>
          </Stack>

          {item.reason && (
            <Typography sx={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
              {item.reason}
            </Typography>
          )}
        </Stack>

        <Chip
          label={getStatusLabel(item.status)}
          color={getStatusColor(item.status)}
          size="small"
          sx={{
            fontWeight: 700,
            borderRadius: "10px",
          }}
        />
      </Stack>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
        <Paper sx={{ ...panelSx, p: 3 }}>
          <Typography sx={{ color: "#b91c1c", fontWeight: 600 }}>
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f8fafc",
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Paper sx={{ ...panelSx, p: { xs: 2, md: 3 }, mb: 2.5 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Box>
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
              {t("patientAppointments.eyebrow", "Patient appointments")}
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
              {t("patientAppointments.title", "My appointments")}
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
                "patientAppointments.subtitle",
                "Track your upcoming and previous clinic visits in one place."
              )}
            </Typography>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={() => navigate("/patient/book")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "12px",
              boxShadow: "none",
              py: 1.2,
              px: 2,
            }}
          >
            {t("patientAppointments.bookAction", "Book appointment")}
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ ...panelSx, p: 2.25, height: "100%" }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.total", "Total appointments")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ ...panelSx, p: 2.25, height: "100%" }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.upcoming", "Upcoming")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.upcoming}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ ...panelSx, p: 2.25, height: "100%" }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.confirmed", "Confirmed")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.confirmed}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ ...panelSx, p: 2.25, height: "100%" }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.completed", "Completed")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.completed}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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
                <EventNoteOutlinedIcon fontSize="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
                  {t("patientAppointments.upcomingTitle", "Upcoming appointments")}
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                  {t(
                    "patientAppointments.upcomingSubtitle",
                    "Your planned visits that are still ahead."
                  )}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.5}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(renderAppointmentCard)
              ) : (
                <Box sx={{ ...itemCardSx, p: 2.5 }}>
                  <Typography sx={{ color: "#64748b" }}>
                    {t("patientAppointments.emptyUpcoming", "No upcoming appointments found.")}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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
                <AccessTimeOutlinedIcon fontSize="small" />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
                  {t("patientAppointments.historyTitle", "Visit history")}
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                  {t(
                    "patientAppointments.historySubtitle",
                    "Previous appointments already completed or passed."
                  )}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.25}>
              {pastAppointments.length > 0 ? (
                pastAppointments.slice(0, 6).map(renderAppointmentCard)
              ) : (
                <Box sx={{ ...itemCardSx, p: 2.5 }}>
                  <Typography sx={{ color: "#64748b" }}>
                    {t("patientAppointments.emptyHistory", "No appointment history yet.")}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MyAppointments;