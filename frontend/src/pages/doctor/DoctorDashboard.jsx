import {
  Alert,
  Avatar,
  Box,
  Button,
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
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import Grid from "@mui/material/Grid";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useNavigate } from "react-router-dom";
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

function formatTimeOnly(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusMeta(status) {
  const map = {
    scheduled: { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled" },
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
        boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
        height: "100%",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 8px 32px rgba(15,23,42,0.10)" },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ color: "#64748b", fontSize: 13, mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: 12.5, mt: 0.8 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            display: "grid",
            placeItems: "center",
            borderRadius: 3,
            bgcolor: `${color}16`,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function DoctorDashboard() {
  const navigate = useNavigate();
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

        // FIX: appointments/my/ already filters by current doctor on backend
        // No need to manually match doctor — backend get_queryset() handles it
        const [meRes, appointmentsRes, schedulesRes] = await Promise.all([
          api.get("auth/me/"),
          api.get("appointments/my/"),
          api.get("doctor-schedules/"),
        ]);

        const me = meRes.data || {};
        setDoctor({ name: me.full_name || me.username || "Doctor" });
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = useMemo(() => new Date(), []);

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const d = new Date(a.date);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments, now]);

  const upcomingAppointments = useMemo(() => {
    return [...appointments]
      .filter((a) => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);
  }, [appointments, now]);

  const uniquePatientsCount = useMemo(() => {
    const ids = new Set(
      appointments.map((a) => a.patient?.id ?? a.patient).filter(Boolean)
    );
    return ids.size;
  }, [appointments]);

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const completionRate = appointments.length
    ? Math.round((completedCount / appointments.length) * 100)
    : 0;

  // Weekly trend: appointments per day for next 7 days
  const weeklyTrend = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const count = appointments.filter((a) => {
        const ad = new Date(a.date);
        return (
          ad.getFullYear() === d.getFullYear() &&
          ad.getMonth() === d.getMonth() &&
          ad.getDate() === d.getDate()
        );
      }).length;
      days.push({
        label: i === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(d),
        count,
        date: d,
      });
    }
    return days;
  }, [appointments, now]);

  const maxWeeklyCount = Math.max(...weeklyTrend.map((d) => d.count), 1);

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

        {/* HERO */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            color: "#fff",
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg, #0f766e 0%, #0f172a 58%, #1d4ed8 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Box sx={{ position: "absolute", right: -50, top: -50, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
          <Box sx={{ position: "absolute", right: 60, bottom: -70, width: 180, height: 180, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: 13, mb: 0.8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Doctor workspace
              </Typography>
              <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
                {doctor?.name ? `Welcome, ${doctor.name}` : "Welcome, Doctor"}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ opacity: 0.9 }}>
                <Typography sx={{ fontSize: 14 }}>📅 {todayAppointments.length} today</Typography>
                <Typography sx={{ fontSize: 14 }}>👥 {uniquePatientsCount} patients</Typography>
                <Typography sx={{ fontSize: 14 }}>✅ {completionRate}% completion</Typography>
              </Stack>
            </Box>
            <Stack direction={{ xs: "row", md: "column" }} spacing={1}>
              <Button
                onClick={() => navigate("/doctor/schedule")}
                variant="contained"
                startIcon={<CalendarMonthRoundedIcon />}
                sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700, borderRadius: 3, boxShadow: "none", border: "1px solid rgba(255,255,255,0.25)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)", boxShadow: "none" }, whiteSpace: "nowrap" }}
              >
                My Schedule
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* KPI CARDS */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Appointments today" value={todayAppointments.length} subtitle="Scheduled for today" color="#2563eb" icon={<EventAvailableRoundedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Active patients" value={uniquePatientsCount} subtitle="Unique patients total" color="#0f766e" icon={<Groups2RoundedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Pending" value={scheduledCount + confirmedCount} subtitle={`${scheduledCount} scheduled · ${confirmedCount} confirmed`} color="#d97706" icon={<PendingActionsRoundedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Completion rate" value={`${completionRate}%`} subtitle={`${completedCount} completed`} color="#16a34a" icon={<TrendingUpRoundedIcon />} />
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          {/* TODAY'S APPOINTMENTS */}
          <Grid size={{ xs: 12, xl: 8 }}>
            <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.05)", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 17 }}>Today's appointments</Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 13.5, mt: 0.3 }}>
                    {todayAppointments.length === 0 ? "No appointments today" : `${todayAppointments.length} appointment${todayAppointments.length > 1 ? "s" : ""} scheduled`}
                  </Typography>
                </Box>
                <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/doctor/schedule")} sx={{ textTransform: "none", fontWeight: 700, color: "#0f766e", fontSize: 13.5 }}>
                  Full schedule
                </Button>
              </Stack>

              {todayAppointments.length === 0 ? (
                <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                  <AssignmentTurnedInRoundedIcon sx={{ fontSize: 44, color: "#cbd5e1" }} />
                  <Typography sx={{ color: "#94a3b8", fontWeight: 600 }}>No appointments today</Typography>
                  <Typography sx={{ color: "#cbd5e1", fontSize: 13 }}>Check your upcoming schedule below</Typography>
                </Box>
              ) : (
                <Stack divider={<Divider flexItem sx={{ borderColor: "#f1f5f9" }} />}>
                  {todayAppointments.map((item, idx) => {
                    const status = getStatusMeta(item.status);
                    return (
                      <Stack key={item.id} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ py: 1.6 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "#0f766e15", display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#0f766e" }}>#{idx + 1}</Typography>
                          </Box>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: "#dbeafe", color: "#1d4ed8" }}>
                            <PersonOutlineRoundedIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14.5 }}>
                              {item.patient_name || `Patient #${item.patient}`}
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                              {item.complaint || "No complaint specified"}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexShrink: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, px: 1.2, py: 0.5 }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} />
                            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 13.5 }}>
                              {formatTimeOnly(item.date)}
                            </Typography>
                          </Box>
                          <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, borderRadius: 999, fontSize: 12 }} />
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              )}

              {/* UPCOMING (if no today OR as extra section) */}
              {upcomingAppointments.filter(a => {
                const d = new Date(a.date);
                return !(
                  d.getFullYear() === now.getFullYear() &&
                  d.getMonth() === now.getMonth() &&
                  d.getDate() === now.getDate()
                );
              }).length > 0 && (
                <>
                  <Divider sx={{ my: 2, borderColor: "#e2e8f0" }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 15, mb: 1.5 }}>Upcoming</Typography>
                  <Stack divider={<Divider flexItem sx={{ borderColor: "#f1f5f9" }} />}>
                    {upcomingAppointments
                      .filter(a => {
                        const d = new Date(a.date);
                        return !(
                          d.getFullYear() === now.getFullYear() &&
                          d.getMonth() === now.getMonth() &&
                          d.getDate() === now.getDate()
                        );
                      })
                      .slice(0, 5)
                      .map((item) => {
                        const status = getStatusMeta(item.status);
                        return (
                          <Stack key={item.id} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ py: 1.4 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 36, height: 36, bgcolor: "#f1f5f9", color: "#475569" }}>
                                <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                                  {item.patient_name || `Patient #${item.patient}`}
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                                  {item.complaint || "—"}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexShrink: 0 }}>
                              <Typography sx={{ fontWeight: 600, color: "#475569", fontSize: 13 }}>
                                {formatDateTime(item.date)}
                              </Typography>
                              <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, borderRadius: 999, fontSize: 12 }} />
                            </Stack>
                          </Stack>
                        );
                    })}
                  </Stack>
                </>
              )}
            </Paper>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={2.5}>
              {/* STATUS BREAKDOWN */}
              <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.05)" }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ color: "#0f766e", fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>Status breakdown</Typography>
                </Stack>
                <Stack spacing={1.6}>
                  {[
                    { label: "Scheduled", value: scheduledCount, color: "#2563eb", bg: "#dbeafe" },
                    { label: "Confirmed", value: confirmedCount, color: "#16a34a", bg: "#dcfce7" },
                    { label: "Completed", value: completedCount, color: "#7c3aed", bg: "#ede9fe" },
                    { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length, color: "#b91c1c", bg: "#fee2e2" },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                          <Typography sx={{ fontSize: 13.5, color: "#334155", fontWeight: 600 }}>{item.label}</Typography>
                        </Stack>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{item.value}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={appointments.length ? (item.value / appointments.length) * 100 : 0}
                        sx={{ height: 7, borderRadius: 999, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: item.color } }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* WEEKLY TREND */}
              <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.05)" }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <TrendingUpRoundedIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>7-day forecast</Typography>
                </Stack>
                <Stack spacing={1.2}>
                  {weeklyTrend.map((day, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Typography sx={{ width: 42, color: i === 0 ? "#0f766e" : "#64748b", fontWeight: i === 0 ? 800 : 600, fontSize: 13 }}>
                        {day.label}
                      </Typography>
                      <Box sx={{ flex: 1, height: 8, borderRadius: 999, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                        <Box sx={{ width: `${(day.count / maxWeeklyCount) * 100}%`, height: "100%", borderRadius: 999, bgcolor: i === 0 ? "#0f766e" : "#2563eb", transition: "width 0.4s" }} />
                      </Box>
                      <Typography sx={{ minWidth: 18, fontWeight: 800, color: "#0f172a", fontSize: 13, textAlign: "right" }}>
                        {day.count}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* SCHEDULE SUMMARY */}
              {schedules.length > 0 && (
                <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.05)" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <CalendarMonthRoundedIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>Work schedule</Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {schedules
                      .filter(s => s.is_active)
                      .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
                      .slice(0, 5)
                      .map((s) => {
                        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                        return (
                          <Stack key={s.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.6, borderBottom: "1px solid #f1f5f9" }}>
                            <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: 13.5 }}>
                              {dayNames[s.day_of_week] || `Day ${s.day_of_week}`}
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                              {String(s.start_time).slice(0, 5)} – {String(s.end_time).slice(0, 5)}
                            </Typography>
                          </Stack>
                        );
                    })}
                  </Stack>
                  <Button fullWidth onClick={() => navigate("/doctor/schedule")} endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1.5, textTransform: "none", fontWeight: 700, color: "#7c3aed", fontSize: 13 }}>
                    View full schedule
                  </Button>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

export default DoctorDashboard;
