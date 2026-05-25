import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import Grid from "@mui/material/Grid";
import api from "../../services/api";

const DAY_NAMES = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

function toMinutes(timeString) {
  if (!timeString) return 0;
  const [h, m] = String(timeString).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function appointmentMinutes(dateValue) {
  const d = new Date(dateValue);
  return d.getHours() * 60 + d.getMinutes();
}

function formatTime(value) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

function formatAppointmentTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusMeta(status) {
  const map = {
    scheduled: { label: "Scheduled", bg: "#dbeafe", color: "#1d4ed8" },
    confirmed: { label: "Confirmed", bg: "#dcfce7", color: "#166534" },
    completed: { label: "Completed", bg: "#ede9fe", color: "#6d28d9" },
    cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c" },
    no_show: { label: "No show", bg: "#fef3c7", color: "#92400e" },
  };

  return map[status] || {
    label: status || "Unknown",
    bg: "#e2e8f0",
    color: "#475569",
  };
}

function MySchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);

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
        setDoctorName(me.username || me.full_name || "Doctor");

        setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor schedule");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const appointmentsByDay = useMemo(() => {
    const map = {};

    appointments.forEach((item) => {
      if (!item.date) return;
      const d = new Date(item.date);
      const jsDay = d.getDay();
      const normalizedDay = jsDay === 0 ? 6 : jsDay - 1;

      if (!map[normalizedDay]) map[normalizedDay] = [];
      map[normalizedDay].push(item);
    });

    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    return map;
  }, [appointments]);

  const schedulesByDay = useMemo(() => {
    const map = {};

    schedules.forEach((item) => {
      const day = Number(item.day_of_week);
      if (!map[day]) map[day] = [];
      map[day].push(item);
    });

    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
    });

    return map;
  }, [schedules]);

  const scheduleCards = useMemo(() => {
    return Object.entries(DAY_NAMES).map(([dayNumber, dayName]) => {
      const dayIndex = Number(dayNumber);
      const daySchedules = schedulesByDay[dayIndex] || [];
      const dayAppointments = appointmentsByDay[dayIndex] || [];

      const windows = daySchedules.map((window) => {
        const start = toMinutes(window.start_time);
        const end = toMinutes(window.end_time);

        const bookedInside = dayAppointments.filter((appt) => {
          const apptTime = appointmentMinutes(appt.date);
          return apptTime >= start && apptTime < end;
        });

        return {
          ...window,
          bookedInside,
        };
      });

      return {
        dayIndex,
        dayName,
        windows,
        totalAppointments: dayAppointments.length,
      };
    });
  }, [appointmentsByDay, schedulesByDay]);

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
              "linear-gradient(135deg, #0f766e 0%, #0f172a 58%, #2563eb 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.16)",
          }}
        >
          <Typography sx={{ opacity: 0.82, fontSize: 14, mb: 1 }}>
            Doctor planner
          </Typography>
          <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800, mb: 1 }}>
            Weekly Schedule
          </Typography>
          <Typography sx={{ opacity: 0.9, maxWidth: 780 }}>
            Structured weekly view of your configured availability and the patients
            already booked inside each time window.
          </Typography>
          <Typography sx={{ mt: 1.5, fontWeight: 700, opacity: 0.95 }}>
            {doctorName}
          </Typography>
        </Paper>

        <Grid container spacing={2.2}>
          {scheduleCards.map((day) => (
            <Grid key={day.dayIndex} size={{ xs: 12, md: 6, xl: 4 }}>
              <Paper
                sx={{
                  p: 2.3,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                  height: "100%",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {day.dayName}
                  </Typography>

                  <Chip
                    size="small"
                    label={`${day.totalAppointments} booked`}
                    sx={{
                      fontWeight: 700,
                      bgcolor: "#eff6ff",
                      color: "#1d4ed8",
                    }}
                  />
                </Stack>

                <Stack spacing={1.4}>
                  {day.windows.length === 0 ? (
                    <Box
                      sx={{
                        p: 1.6,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                        No schedule configured for this day
                      </Typography>
                    </Box>
                  ) : (
                    day.windows.map((window) => (
                      <Box
                        key={window.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: "#ffffff",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                              {formatTime(window.start_time)} – {formatTime(window.end_time)}
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                              Slot duration: {window.slot_duration} min
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            label={`${window.bookedInside.length} patients`}
                            sx={{
                              fontWeight: 700,
                              bgcolor:
                                window.bookedInside.length > 0 ? "#dcfce7" : "#f1f5f9",
                              color:
                                window.bookedInside.length > 0 ? "#166534" : "#475569",
                            }}
                          />
                        </Stack>

                        <Stack spacing={1}>
                          {window.bookedInside.length === 0 ? (
                            <Box
                              sx={{
                                p: 1.2,
                                borderRadius: 2.5,
                                bgcolor: "#f8fafc",
                                border: "1px dashed #cbd5e1",
                              }}
                            >
                              <Typography sx={{ color: "#94a3b8", fontSize: 13.5 }}>
                                Free slots available in this window
                              </Typography>
                            </Box>
                          ) : (
                            window.bookedInside.map((appt) => {
                              const status = getStatusMeta(appt.status);

                              return (
                                <Box
                                  key={appt.id}
                                  sx={{
                                    p: 1.2,
                                    borderRadius: 2.5,
                                    bgcolor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    spacing={1}
                                  >
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        sx={{
                                          fontWeight: 800,
                                          color: "#0f172a",
                                          fontSize: 14,
                                        }}
                                      >
                                        {formatAppointmentTime(appt.date)}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          color: "#334155",
                                          fontWeight: 700,
                                          mt: 0.35,
                                        }}
                                      >
                                        {appt.patient_name || `Patient #${appt.patient}`}
                                      </Typography>
                                      {appt.complaint && (
                                        <Typography
                                          sx={{
                                            color: "#64748b",
                                            fontSize: 12.8,
                                            mt: 0.45,
                                            lineHeight: 1.5,
                                          }}
                                        >
                                          {appt.complaint}
                                        </Typography>
                                      )}
                                    </Box>

                                    <Chip
                                      size="small"
                                      label={status.label}
                                      sx={{
                                        bgcolor: status.bg,
                                        color: status.color,
                                        fontWeight: 700,
                                        borderRadius: 999,
                                      }}
                                    />
                                  </Stack>
                                </Box>
                              );
                            })
                          )}
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}

export default MySchedule;