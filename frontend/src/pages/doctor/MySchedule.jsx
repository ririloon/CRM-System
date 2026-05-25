import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import api from "../../services/api";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toMinutes(t) {
  if (!t) return 0;
  const [h, m] = String(t).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function formatTime(v) {
  if (!v) return "—";
  return String(v).slice(0, 5);
}

function formatApptTime(v) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(v));
}

function formatDate(v) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(new Date(v));
}

function getStatusMeta(s) {
  const map = {
    scheduled: { label: "Scheduled", bg: "#dbeafe", color: "#1d4ed8" },
    confirmed: { label: "Confirmed", bg: "#dcfce7", color: "#166534" },
    completed: { label: "Completed", bg: "#ede9fe", color: "#5b21b6" },
    cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c" },
    no_show: { label: "No show", bg: "#fef3c7", color: "#92400e" },
  };
  return map[s] || { label: s || "Unknown", bg: "#e2e8f0", color: "#475569" };
}

// JS getDay: 0=Sun,1=Mon...6=Sat → normalize to 0=Mon..6=Sun
function jsWeekdayToIndex(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function MySchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0 = weekly grid, 1 = list

  // Set default tab to today's weekday
  useEffect(() => {
    const todayIdx = jsWeekdayToIndex(new Date().getDay());
    setActiveTab(todayIdx);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [meRes, schedulesRes, appointmentsRes] = await Promise.all([
          api.get("auth/me/"),
          api.get("doctor-schedules/"),
          api.get("appointments/my/"),
        ]);
        const me = meRes.data || {};
        setDoctorName(me.full_name || me.username || "Doctor");
        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group appointments by weekday index (0=Mon)
  const appointmentsByDay = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      if (!a.date) return;
      const idx = jsWeekdayToIndex(new Date(a.date).getDay());
      if (!map[idx]) map[idx] = [];
      map[idx].push(a);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(a.date) - new Date(b.date)));
    return map;
  }, [appointments]);

  // Group schedules by weekday index
  const schedulesByDay = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      const day = Number(s.day_of_week);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time)));
    return map;
  }, [schedules]);

  const today = new Date();
  const todayIdx = jsWeekdayToIndex(today.getDay());

  // Build data per day
  const days = useMemo(() => {
    return DAY_NAMES.map((name, idx) => {
      const daySchedules = schedulesByDay[idx] || [];
      const dayAppts = appointmentsByDay[idx] || [];
      const windows = daySchedules.map((w) => {
        const wStart = toMinutes(w.start_time);
        const wEnd = toMinutes(w.end_time);
        const booked = dayAppts.filter((a) => {
          const t = new Date(a.date).getHours() * 60 + new Date(a.date).getMinutes();
          return t >= wStart && t < wEnd;
        });
        return { ...w, booked };
      });
      return { idx, name, short: DAY_SHORT[idx], windows, appts: dayAppts, isToday: idx === todayIdx };
    });
  }, [schedulesByDay, appointmentsByDay, todayIdx]);

  const totalAppointments = appointments.length;
  const totalScheduledDays = schedules.length;
  const activeDay = days[activeTab];

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

        {/* HEADER */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            color: "#fff",
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg, #1d4ed8 0%, #0f172a 55%, #0f766e 100%)",
            boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
          }}
        >
          <Box sx={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
          <Box sx={{ position: "absolute", right: 80, bottom: -60, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <Box>
              <Typography sx={{ opacity: 0.72, fontSize: 12.5, mb: 0.8, textTransform: "uppercase", letterSpacing: 0.8 }}>Doctor planner</Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, mb: 0.8, lineHeight: 1.2 }}>Weekly Schedule</Typography>
              <Typography sx={{ opacity: 0.88, fontSize: 14, fontWeight: 600 }}>{doctorName}</Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{totalAppointments}</Typography>
                <Typography sx={{ opacity: 0.75, fontSize: 12 }}>Total booked</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{totalScheduledDays}</Typography>
                <Typography sx={{ opacity: 0.75, fontSize: 12 }}>Schedule slots</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* DAY TABS */}
        <Paper sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.05)", overflow: "hidden" }}>
          <Box sx={{ borderBottom: "1px solid #e2e8f0", px: 1 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 52,
                "& .MuiTab-root": { minHeight: 52, textTransform: "none", fontWeight: 700, fontSize: 13.5, minWidth: 90 },
                "& .Mui-selected": { color: "#0f766e !important" },
                "& .MuiTabs-indicator": { bgcolor: "#0f766e", height: 3, borderRadius: 999 },
              }}
            >
              {days.map((day) => (
                <Tab
                  key={day.idx}
                  label={
                    <Stack alignItems="center" spacing={0.2}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "inherit" }}>{day.short}</Typography>
                      {day.appts.length > 0 && (
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: day.isToday ? "#0f766e" : "#2563eb" }} />
                      )}
                    </Stack>
                  }
                  sx={{
                    position: "relative",
                    ...(day.isToday && {
                      "&::after": {
                        content: '"TODAY"',
                        position: "absolute",
                        top: 4,
                        right: 4,
                        fontSize: 8,
                        fontWeight: 800,
                        color: "#0f766e",
                        letterSpacing: 0.5,
                      },
                    }),
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* DAY CONTENT */}
          <Box sx={{ p: 2.5 }}>
            {activeDay && (
              <Stack spacing={2}>
                {/* Day header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 3,
                        bgcolor: activeDay.isToday ? "#0f766e" : "#1d4ed8",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <CalendarTodayRoundedIcon sx={{ fontSize: 20, color: "#fff" }} />
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 20 }}>
                          {activeDay.name}
                        </Typography>
                        {activeDay.isToday && (
                          <Chip label="Today" size="small" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: 11 }} />
                        )}
                      </Stack>
                      <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                        {activeDay.windows.length} time window{activeDay.windows.length !== 1 ? "s" : ""} · {activeDay.appts.length} appointment{activeDay.appts.length !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                {activeDay.windows.length === 0 ? (
                  /* No schedule configured */
                  <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <EventBusyRoundedIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
                    <Typography sx={{ color: "#94a3b8", fontWeight: 700, fontSize: 15 }}>No schedule configured</Typography>
                    <Typography sx={{ color: "#cbd5e1", fontSize: 13 }}>Add a schedule entry for this day</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {activeDay.windows.map((window) => (
                      <Paper
                        key={window.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 3.5,
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        {/* Window header */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            px: 2.2,
                            py: 1.5,
                            bgcolor: window.is_active ? "#f0fdf4" : "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <AccessTimeRoundedIcon sx={{ fontSize: 18, color: window.is_active ? "#0f766e" : "#94a3b8" }} />
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>
                                {formatTime(window.start_time)} – {formatTime(window.end_time)}
                              </Typography>
                              <Typography sx={{ color: "#64748b", fontSize: 12.5 }}>
                                {window.slot_duration} min slots
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={`${window.booked.length} booked`}
                              sx={{
                                fontWeight: 700,
                                bgcolor: window.booked.length > 0 ? "#dcfce7" : "#f1f5f9",
                                color: window.booked.length > 0 ? "#166534" : "#475569",
                                fontSize: 12,
                              }}
                            />
                            <Chip
                              size="small"
                              icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important" }} />}
                              label={window.is_active ? "Active" : "Inactive"}
                              sx={{
                                fontWeight: 700,
                                bgcolor: window.is_active ? "#dbeafe" : "#f1f5f9",
                                color: window.is_active ? "#1d4ed8" : "#94a3b8",
                                fontSize: 12,
                              }}
                            />
                          </Stack>
                        </Stack>

                        {/* Appointments inside window */}
                        <Box sx={{ p: 1.8 }}>
                          {window.booked.length === 0 ? (
                            <Box sx={{ py: 2.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
                              <Typography sx={{ color: "#94a3b8", fontSize: 13.5, fontWeight: 600 }}>No appointments in this slot</Typography>
                              <Typography sx={{ color: "#cbd5e1", fontSize: 12.5 }}>Free slots available for booking</Typography>
                            </Box>
                          ) : (
                            <Stack divider={<Divider flexItem sx={{ borderColor: "#f1f5f9" }} />}>
                              {window.booked.map((appt) => {
                                const status = getStatusMeta(appt.status);
                                return (
                                  <Stack
                                    key={appt.id}
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={1.2}
                                    sx={{ py: 1.4 }}
                                  >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                      <Avatar sx={{ width: 36, height: 36, bgcolor: "#dbeafe", color: "#1d4ed8" }}>
                                        <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                      </Avatar>
                                      <Box>
                                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                                          {appt.patient_name || `Patient #${appt.patient}`}
                                        </Typography>
                                        {appt.complaint && (
                                          <Typography sx={{ color: "#64748b", fontSize: 12.5, mt: 0.2 }}>
                                            {appt.complaint}
                                          </Typography>
                                        )}
                                        <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>
                                          {formatDate(appt.date)}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, px: 1.2, py: 0.4 }}>
                                        <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "#64748b" }} />
                                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                                          {formatApptTime(appt.date)}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        size="small"
                                        label={status.label}
                                        sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, borderRadius: 999, fontSize: 11.5 }}
                                      />
                                    </Stack>
                                  </Stack>
                                );
                              })}
                            </Stack>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* ALL UPCOMING APPOINTMENTS LIST */}
        {appointments.filter(a => new Date(a.date) >= new Date()).length > 0 && (
          <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.05)" }}>
            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 17, mb: 0.4 }}>All upcoming appointments</Typography>
            <Typography sx={{ color: "#64748b", fontSize: 13.5, mb: 2 }}>Sorted by date across all days</Typography>
            <Stack divider={<Divider flexItem sx={{ borderColor: "#f1f5f9" }} />}>
              {appointments
                .filter(a => new Date(a.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 20)
                .map((appt) => {
                  const status = getStatusMeta(appt.status);
                  return (
                    <Stack key={appt.id} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "#f1f5f9", color: "#475569" }}>
                          <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                            {appt.patient_name || `Patient #${appt.patient}`}
                          </Typography>
                          <Typography sx={{ color: "#64748b", fontSize: 12.5 }}>
                            {appt.complaint || "—"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Typography sx={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>
                          {new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(appt.date))}
                        </Typography>
                        <Chip size="small" label={status.label} sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, borderRadius: 999, fontSize: 11.5 }} />
                      </Stack>
                    </Stack>
                  );
              })}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}

export default MySchedule;
