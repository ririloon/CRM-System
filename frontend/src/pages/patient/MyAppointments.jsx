import {
  Alert,
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
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import Grid from "@mui/material/Grid";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
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

const selectedCardSx = {
  backgroundColor: "#eff6ff",
  border: "1px solid #93c5fd",
  borderRadius: "14px",
  boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.12)",
};

const metricCardSx = {
  ...panelSx,
  p: 2.25,
  height: "100%",
};

function MyAppointments() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    setLoading(true);

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

  const nowTs = Date.now();

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return sortedAppointments.filter((item) => {
      const itemTs = new Date(item.date).getTime();
      return Number.isFinite(itemTs) && itemTs >= nowTs && item.status !== "cancelled";
    });
  }, [sortedAppointments, nowTs]);

  const pastAppointments = useMemo(() => {
    return sortedAppointments
      .filter((item) => {
        const itemTs = new Date(item.date).getTime();
        return Number.isFinite(itemTs) && itemTs < nowTs && item.status !== "cancelled";
      })
      .reverse();
  }, [sortedAppointments, nowTs]);

  const cancelledAppointments = useMemo(() => {
    return sortedAppointments
      .filter((item) => item.status === "cancelled")
      .reverse();
  }, [sortedAppointments]);

  const nextAppointment = useMemo(() => {
    return upcomingAppointments.length ? upcomingAppointments[0] : null;
  }, [upcomingAppointments]);

  const metrics = useMemo(() => {
    const total = appointments.length;
    const upcoming = upcomingAppointments.length;
    const completed = appointments.filter((item) => item.status === "completed").length;
    const confirmed = appointments.filter((item) => item.status === "confirmed").length;
    const cancelled = appointments.filter((item) => item.status === "cancelled").length;

    return {
      total,
      upcoming,
      completed,
      confirmed,
      cancelled,
    };
  }, [appointments, upcomingAppointments]);

  const activeList = useMemo(() => {
    switch (activeTab) {
      case "past":
        return pastAppointments;
      case "cancelled":
        return cancelledAppointments;
      case "upcoming":
      default:
        return upcomingAppointments;
    }
  }, [activeTab, upcomingAppointments, pastAppointments, cancelledAppointments]);

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

  const formatDateOnly = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString(
        i18n.language === "ky" ? "ky-KG" : i18n.language === "en" ? "en-US" : "ru-RU",
        {
          dateStyle: "medium",
        }
      );
    } catch {
      return value;
    }
  };

  const formatTimeOnly = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleTimeString(
        i18n.language === "ky" ? "ky-KG" : i18n.language === "en" ? "en-US" : "ru-RU",
        {
          hour: "2-digit",
          minute: "2-digit",
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
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    return t(`dashboard.status.${status}`, status || "Unknown");
  };

  const getDoctorName = (item) => {
    return (
      item.doctor_name ||
      item.doctor?.name ||
      item.doctor?.full_name ||
      t("patientAppointments.fallbacks.doctor", "Doctor not specified")
    );
  };

  const getSpecialty = (item) => {
    return (
      item.specialization ||
      item.doctor_specialization ||
      item.doctor?.specialization ||
      "—"
    );
  };

  const getReason = (item) => {
    return item.reason || item.complaint || item.comment || "";
  };

  const tabItems = [
    {
      key: "upcoming",
      label: t("patientAppointments.tabs.upcoming", "Upcoming"),
      count: upcomingAppointments.length,
    },
    {
      key: "past",
      label: t("patientAppointments.tabs.history", "History"),
      count: pastAppointments.length,
    },
    {
      key: "cancelled",
      label: t("patientAppointments.tabs.cancelled", "Cancelled"),
      count: cancelledAppointments.length,
    },
  ];

  const getEmptyText = () => {
    if (activeTab === "past") {
      return t("patientAppointments.emptyHistory", "No appointment history yet.");
    }
    if (activeTab === "cancelled") {
      return t("patientAppointments.emptyCancelled", "No cancelled appointments.");
    }
    return t("patientAppointments.emptyUpcoming", "No upcoming appointments found.");
  };

  const renderAppointmentCard = (item, variant = "default") => {
    const doctorName = getDoctorName(item);
    const specialty = getSpecialty(item);
    const reason = getReason(item);

    return (
      <Box
        key={item.id}
        sx={{
          ...(variant === "highlight" ? selectedCardSx : itemCardSx),
          p: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack spacing={0.6} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                {doctorName}
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  size="small"
                  icon={<LocalHospitalOutlinedIcon />}
                  label={specialty}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
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

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ ...itemCardSx, p: 1.5, backgroundColor: "#ffffff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                      {t("patientAppointments.fields.date", "Date")}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      {formatDateOnly(item.date)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ ...itemCardSx, p: 1.5, backgroundColor: "#ffffff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                      {t("patientAppointments.fields.time", "Time")}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      {formatTimeOnly(item.date)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {reason ? (
            <>
              <Divider />
              <Stack direction="row" spacing={1.1} alignItems="flex-start">
                <NotesOutlinedIcon sx={{ fontSize: 18, color: "#64748b", mt: 0.2 }} />
                <Box>
                  <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.35 }}>
                    {t("patientAppointments.fields.reason", "Reason / notes")}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
                    {reason}
                  </Typography>
                </Box>
              </Stack>
            </>
          ) : null}

          <Typography sx={{ fontSize: 13, color: "#64748b" }}>
            {t("patientAppointments.fields.fullDateTime", "Appointment time")}: {formatDateTime(item.date)}
          </Typography>
        </Stack>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
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
                "Track your upcoming visits, review previous appointments, and keep all booking information in one place."
              )}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={() => navigate("/patient/book")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "none",
              py: 0.9,
              px: 1.6,
              minWidth: "auto",
              alignSelf: { xs: "stretch", lg: "flex-start" },
            }}
          >
            {t("patientAppointments.bookAction", "Book appointment")}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={metricCardSx}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.total", "Total appointments")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={metricCardSx}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.upcoming", "Upcoming")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.upcoming}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={metricCardSx}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientAppointments.metrics.confirmed", "Confirmed")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.confirmed}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={metricCardSx}>
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
        <Grid size={{ xs: 12, xl: 5 }}>
          <Stack spacing={2.5}>
            <Paper sx={{ ...panelSx, p: 3 }}>
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
                    {t("patientAppointments.nextTitle", "Next appointment")}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t(
                      "patientAppointments.nextSubtitle",
                      "Your closest planned visit at a glance."
                    )}
                  </Typography>
                </Box>
              </Stack>

              {nextAppointment ? (
                renderAppointmentCard(nextAppointment, "highlight")
              ) : (
                <Box sx={{ ...itemCardSx, p: 2.5 }}>
                  <Stack direction="row" spacing={1.2} alignItems="flex-start">
                    <CheckCircleOutlineOutlinedIcon sx={{ color: "#94a3b8", mt: 0.15 }} />
                    <Box>
                      <Typography sx={{ color: "#0f172a", fontWeight: 700, mb: 0.5 }}>
                        {t("patientAppointments.noNextTitle", "No upcoming visit")}
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>
                        {t(
                          "patientAppointments.noNextSubtitle",
                          "You do not have any upcoming appointments at the moment."
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Paper>

            <Paper sx={{ ...panelSx, p: 3 }}>
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
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
                    {t("patientAppointments.overviewTitle", "Appointment overview")}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t(
                      "patientAppointments.overviewSubtitle",
                      "A quick summary of your booking activity."
                    )}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                <Box sx={{ ...itemCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientAppointments.overview.upcoming", "Upcoming visits")}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>
                    {metrics.upcoming}
                  </Typography>
                </Box>

                <Box sx={{ ...itemCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientAppointments.overview.cancelled", "Cancelled")}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>
                    {metrics.cancelled}
                  </Typography>
                </Box>

                <Box sx={{ ...itemCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientAppointments.overview.history", "History records")}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>
                    {pastAppointments.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 7 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
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
                  {activeTab === "upcoming" ? (
                    <EventNoteOutlinedIcon fontSize="small" />
                  ) : activeTab === "past" ? (
                    <HistoryOutlinedIcon fontSize="small" />
                  ) : (
                    <EventBusyOutlinedIcon fontSize="small" />
                  )}
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
                    {activeTab === "upcoming"
                      ? t("patientAppointments.upcomingTitle", "Upcoming appointments")
                      : activeTab === "past"
                      ? t("patientAppointments.historyTitle", "Visit history")
                      : t("patientAppointments.cancelledTitle", "Cancelled appointments")}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {activeTab === "upcoming"
                      ? t(
                          "patientAppointments.upcomingSubtitle",
                          "Your planned visits that are still ahead."
                        )
                      : activeTab === "past"
                      ? t(
                          "patientAppointments.historySubtitle",
                          "Previous appointments already completed or passed."
                        )
                      : t(
                          "patientAppointments.cancelledSubtitle",
                          "Appointments that were cancelled and are no longer active."
                        )}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {tabItems.map((tab) => (
                  <Chip
                    key={tab.key}
                    label={`${tab.label} (${tab.count})`}
                    clickable
                    onClick={() => setActiveTab(tab.key)}
                    color={activeTab === tab.key ? "primary" : "default"}
                    variant={activeTab === tab.key ? "filled" : "outlined"}
                    sx={{
                      borderRadius: "10px",
                      fontWeight: 700,
                      px: 0.5,
                      py: 2.35,
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            <Stack spacing={1.5}>
              {activeList.length > 0 ? (
                activeList.map((item) => renderAppointmentCard(item))
              ) : (
                <Box sx={{ ...itemCardSx, p: 2.5 }}>
                  <Typography sx={{ color: "#64748b", lineHeight: 1.7 }}>
                    {getEmptyText()}
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