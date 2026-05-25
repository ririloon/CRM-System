import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import Grid from "@mui/material/Grid";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import api from "../../services/api";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";
  if (value.length >= 5) return value.slice(0, 5);
  return value;
}

function getStatusColor(status) {
  const map = {
    scheduled: { bg: "#e0f2fe", color: "#075985", label: "Scheduled" },
    confirmed: { bg: "#dcfce7", color: "#166534", label: "Confirmed" },
    completed: { bg: "#ede9fe", color: "#5b21b6", label: "Completed" },
    cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
    no_show: { bg: "#fef3c7", color: "#92400e", label: "No show" },
  };
  return map[status] || { bg: "#e2e8f0", color: "#334155", label: status || "Unknown" };
}

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ color: "#64748b", fontSize: 13, mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
            {value}
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: 13, mt: 0.7 }}>
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            borderRadius: 3,
            bgcolor: `${color}16`,
            color,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const meRes = await api.get("auth/me/");
        const doctorsRes = await api.get("doctors/");
        const appointmentsRes = await api.get("appointments/");

        let schedulesRes = { data: [] };
        try {
          schedulesRes = await api.get("schedules/");
        } catch {
          try {
            schedulesRes = await api.get("doctor-schedules/");
          } catch {
            schedulesRes = { data: [] };
          }
        }

        const doctors = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
        const me = meRes.data || {};

        const currentDoctor =
          doctors.find((d) => d.user === me.id) ||
          doctors.find((d) => d.user?.id === me.id) ||
          doctors.find((d) => d.email && me.email && d.email === me.email) ||
          doctors.find((d) => d.name && me.username && d.name.includes(me.username)) ||
          null;

        setDoctor(currentDoctor);

        const allAppointments = Array.isArray(appointmentsRes.data)
          ? appointmentsRes.data
          : [];

        const doctorAppointments = currentDoctor
          ? allAppointments.filter((a) => {
              const doctorId = a.doctor?.id ?? a.doctor;
              return Number(doctorId) === Number(currentDoctor.id);
            })
          : [];

        const allSchedules = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
        const doctorSchedules = currentDoctor
          ? allSchedules.filter((s) => {
              const doctorId = s.doctor?.id ?? s.doctor;
              return Number(doctorId) === Number(currentDoctor.id);
            })
          : [];

        setAppointments(doctorAppointments);
        setSchedules(doctorSchedules);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const now = new Date();

  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = new Date(a.date);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return [...appointments]
      .filter((a) => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);
  }, [appointments]);

  const uniquePatientsCount = useMemo(() => {
    const ids = new Set(
      appointments.map((a) => a.patient?.id ?? a.patient).filter(Boolean),
    );
    return ids.size;
  }, [appointments]);

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;

  const completionRate = appointments.length
    ? Math.round((completedCount / appointments.length) * 100)
    : 0;

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f8fafc", minHeight: "100vh" }}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 5,
            color: "#fff",
            background:
              "linear-gradient(135deg, #0f766e 0%, #0f172a 60%, #2563eb 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Typography sx={{ opacity: 0.8, fontSize: 14, mb: 1 }}>
            Doctor workspace
          </Typography>
          <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800, mb: 1 }}>
            {doctor?.name ? `Welcome back, ${doctor.name}` : "Welcome back, Doctor"}
          </Typography>
          <Typography sx={{ opacity: 0.86, maxWidth: 820 }}>
            Track your upcoming appointments, active schedule, patient flow, and
            consultation performance in one place.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {doctor?.specialization && (
              <Chip
                label={doctor.specialization}
                sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 700 }}
              />
            )}
            <Chip
              label={`${schedules.length} active schedule entries`}
              sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 700 }}
            />
          </Stack>
        </Paper>

        <Grid container spacing={2.2}>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Appointments today"
              value={todayAppointments.length}
              subtitle="Today’s doctor workload"
              color="#2563eb"
              icon={<EventAvailableRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Active patients"
              value={uniquePatientsCount}
              subtitle="Unique patients in appointments"
              color="#0f766e"
              icon={<Groups2RoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Confirmed visits"
              value={confirmedCount}
              subtitle="Ready for consultation"
              color="#16a34a"
              icon={<TrendingUpRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Completion rate"
              value={`${completionRate}%`}
              subtitle="Completed vs total"
              color="#7c3aed"
              icon={<AccessTimeRoundedIcon />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.2}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 18, mb: 0.5 }}>
                Upcoming appointments
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
                Nearest visits from real appointment data
              </Typography>

              {upcomingAppointments.length === 0 ? (
                <Alert severity="info">No upcoming appointments found.</Alert>
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {upcomingAppointments.map((item) => {
                    const status = getStatusColor(item.status);
                    return (
                      <Stack
                        key={item.id}
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={1.5}
                        sx={{ py: 1.5 }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0369a1" }}>
                            <PersonOutlineRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                              {item.patient?.name || `Patient #${item.patient}`}
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                              {item.complaint || "No complaint specified"}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {formatDateTime(item.date)}
                          </Typography>
                          <Chip
                            label={status.label}
                            size="small"
                            sx={{
                              bgcolor: status.bg,
                              color: status.color,
                              fontWeight: 700,
                              borderRadius: 999,
                            }}
                          />
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 18, mb: 0.5 }}>
                Schedule overview
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
                Weekly availability from DoctorSchedule
              </Typography>

              {schedules.length === 0 ? (
                <Alert severity="info">No doctor schedule configured.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {schedules
                    .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
                    .map((item) => (
                      <Box key={item.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.7 }}
                        >
                          <Typography sx={{ fontWeight: 700, color: "#334155" }}>
                            {item.day_of_week_display || `Day ${item.day_of_week}`}
                          </Typography>
                          <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.is_active ? 100 : 0}
                          sx={{
                            height: 9,
                            borderRadius: 999,
                            bgcolor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              bgcolor: item.is_active ? "#0f766e" : "#94a3b8",
                            },
                          }}
                        />
                      </Box>
                    ))}
                </Stack>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack spacing={0.8}>
                <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                  Scheduled: <strong>{scheduledCount}</strong>
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                  Confirmed: <strong>{confirmedCount}</strong>
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                  Completed: <strong>{completedCount}</strong>
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

export default DoctorDashboard;