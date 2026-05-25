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

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Grid from "@mui/material/Grid";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import api from "../../services/api";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function toMinutes(t) {
  if (!t) return 0;
  const [h, m] = String(t).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function apptMinutes(dateVal) {
  const d = new Date(dateVal);
  return d.getHours() * 60 + d.getMinutes();
}

function fmt(t) {
  return t ? String(t).slice(0, 5) : "—";
}

function fmtDateTime(v) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "short",
  }).format(new Date(v));
}

function StatusChip({ status }) {
  const map = {
    scheduled: { label: "Scheduled", bg: "#dbeafe", color: "#1d4ed8" },
    confirmed: { label: "Confirmed", bg: "#dcfce7", color: "#166534" },
    completed: { label: "Completed", bg: "#ede9fe", color: "#6d28d9" },
    cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c" },
    no_show:   { label: "No show",   bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status] || { label: status || "Unknown", bg: "#e2e8f0", color: "#475569" };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, borderRadius: 999 }}
    />
  );
}

export default function MySchedule() {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [schedules, setSchedules]   = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeDay, setActiveDay]   = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [meRes, schedRes, apptRes] = await Promise.all([
        api.get("auth/me/"),
        api.get("doctor-schedules/"),
        api.get("appointments/my/"),
      ]);
      setDoctorName(meRes.data?.full_name || meRes.data?.username || "Doctor");
      setSchedules(Array.isArray(schedRes.data) ? schedRes.data : []);
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
    } catch {
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Set today as default active tab
  useEffect(() => {
    if (!loading && activeDay === null) {
      const jsDay = new Date().getDay();
      const today = jsDay === 0 ? 6 : jsDay - 1;
      setActiveDay(today);
    }
  }, [loading, activeDay]);

  const apptByDay = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      if (!a.date) return;
      const jsDay = new Date(a.date).getDay();
      const day   = jsDay === 0 ? 6 : jsDay - 1;
      if (!map[day]) map[day] = [];
      map[day].push(a);
    });
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    return map;
  }, [appointments]);

  const schedByDay = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      const day = Number(s.day_of_week);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
    });
    return map;
  }, [schedules]);

  const dayCards = useMemo(() => {
    return DAY_NAMES.map((name, idx) => {
      const wins     = schedByDay[idx] || [];
      const dayAppts = apptByDay[idx]  || [];
      const windows  = wins.map((win) => {
        const start = toMinutes(win.start_time);
        const end   = toMinutes(win.end_time);
        const inside = dayAppts.filter((a) => {
          const t = apptMinutes(a.date);
          return t >= start && t < end;
        });
        return { ...win, inside };
      });
      return { idx, name, windows, dayAppts };
    });
  }, [schedByDay, apptByDay]);

  const todayIdx = (() => {
    const j = new Date().getDay();
    return j === 0 ? 6 : j - 1;
  })();

  const activeDayData = dayCards[activeDay ?? todayIdx];

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#0f766e" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f8fafc", minHeight: "100vh" }}>
      <Stack spacing={3}>
        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={load} startIcon={<RefreshRoundedIcon />}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* ── Header ── */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 5,
            border: "1px solid #e2e8f0",
            background: "linear-gradient(180deg, #fff 0%, #f8fafc 100%)",
            boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "grid",
                  placeItems: "center",
                  color: "#0f766e",
                }}
              >
                <CalendarMonthRoundedIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>Doctor planner</Typography>
                <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: "#0f172a" }}>
                  Weekly Schedule
                </Typography>
                <Typography sx={{ color: "#475569", fontSize: 14 }}>{doctorName}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: "#ecfdf5", border: "1px solid #bbf7d0" }}>
                <Typography sx={{ fontWeight: 800, color: "#0f766e", fontSize: 20 }}>
                  {appointments.length}
                </Typography>
                <Typography sx={{ color: "#16a34a", fontSize: 12 }}>total booked</Typography>
              </Box>
              <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: "#f0f9ff", border: "1px solid #bae6fd" }}>
                <Typography sx={{ fontWeight: 800, color: "#0369a1", fontSize: 20 }}>
                  {dayCards.filter((d) => d.windows.length > 0).length}
                </Typography>
                <Typography sx={{ color: "#0284c7", fontSize: 12 }}>active days</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* ── Day tabs ── */}
        <Paper
          sx={{
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              borderBottom: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              px: 1,
              gap: 0.5,
              py: 1,
              "&::-webkit-scrollbar": { height: 4 },
            }}
          >
            {dayCards.map((day) => {
              const isActive  = day.idx === (activeDay ?? todayIdx);
              const isToday   = day.idx === todayIdx;
              return (
                <Button
                  key={day.idx}
                  onClick={() => setActiveDay(day.idx)}
                  sx={{
                    flexShrink: 0,
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    textTransform: "none",
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#fff" : "#475569",
                    bgcolor: isActive ? "#0f766e" : "transparent",
                    minWidth: 90,
                    "&:hover": {
                      bgcolor: isActive ? "#0f766e" : "#e2e8f0",
                    },
                  }}
                >
                  <Stack alignItems="center" spacing={0.3}>
                    <Typography sx={{ fontSize: 13, fontWeight: "inherit", color: "inherit" }}>
                      {day.name.slice(0, 3)}
                    </Typography>
                    {isToday && (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          bgcolor: isActive ? "#fff" : "#0f766e",
                        }}
                      />
                    )}
                    {day.dayAppts.length > 0 && (
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "inherit", opacity: 0.8 }}>
                        {day.dayAppts.length} pts
                      </Typography>
                    )}
                  </Stack>
                </Button>
              );
            })}
          </Box>

          {/* Active day content */}
          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>
                    {activeDayData?.name}
                  </Typography>
                  {activeDayData?.idx === todayIdx && (
                    <Chip
                      label="TODAY"
                      size="small"
                      sx={{
                        bgcolor: "#0f766e",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 11,
                        borderRadius: 999,
                        height: 22,
                      }}
                    />
                  )}
                </Stack>
                <Typography sx={{ color: "#64748b", fontSize: 13.5, mt: 0.3 }}>
                  {activeDayData?.windows.length > 0
                    ? `${activeDayData.windows.length} schedule window${activeDayData.windows.length > 1 ? "s" : ""} · ${activeDayData.dayAppts.length} patient${activeDayData.dayAppts.length !== 1 ? "s" : ""} booked`
                    : "No schedule configured for this day"}
                </Typography>
              </Box>
              <Chip
                label={`${activeDayData?.dayAppts.length || 0} booked`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: activeDayData?.dayAppts.length > 0 ? "#ecfdf5" : "#f1f5f9",
                  color:   activeDayData?.dayAppts.length > 0 ? "#166534" : "#64748b",
                  borderRadius: 999,
                }}
              />
            </Stack>

            {activeDayData?.windows.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 3,
                }}
              >
                <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
                  No schedule windows configured for this day
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {activeDayData.windows.map((win) => (
                  <Box
                    key={win.id}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                    }}
                  >
                    {/* Window header */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                      sx={{
                        px: 2.5,
                        py: 1.8,
                        bgcolor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>
                          {fmt(win.start_time)} — {fmt(win.end_time)}
                        </Typography>
                        {win.slot_duration && (
                          <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                            Slot duration: {win.slot_duration} min
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={win.is_active !== false ? "Active" : "Inactive"}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 999,
                            bgcolor: win.is_active !== false ? "#dcfce7" : "#fee2e2",
                            color:   win.is_active !== false ? "#166534" : "#b91c1c",
                          }}
                        />
                        <Chip
                          size="small"
                          label={`${win.inside.length} patients`}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 999,
                            bgcolor: win.inside.length > 0 ? "#eff6ff" : "#f1f5f9",
                            color:   win.inside.length > 0 ? "#1d4ed8" : "#64748b",
                          }}
                        />
                      </Stack>
                    </Stack>

                    {/* Patients inside window */}
                    <Box sx={{ p: 2 }}>
                      {win.inside.length === 0 ? (
                        <Box
                          sx={{
                            py: 2.5,
                            textAlign: "center",
                            border: "1px dashed #e2e8f0",
                            borderRadius: 3,
                          }}
                        >
                          <Typography sx={{ color: "#94a3b8", fontSize: 13.5 }}>
                            No patients booked in this window
                          </Typography>
                        </Box>
                      ) : (
                        <Stack divider={<Divider flexItem />}>
                          {win.inside.map((appt) => (
                            <Stack
                              key={appt.id}
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              spacing={1.5}
                              sx={{ py: 1.6 }}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                                  {appt.patient_name || `Patient #${appt.patient}`}
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: 13.5 }}>
                                  {fmtDateTime(appt.date)}
                                </Typography>
                                {appt.booking_source && (
                                  <Typography sx={{ color: "#94a3b8", fontSize: 12.5 }}>
                                    Booked via: {appt.booking_source}
                                  </Typography>
                                )}
                              </Box>
                              <StatusChip status={appt.status} />
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* ── All upcoming ── */}
        {appointments.filter((a) => new Date(a.date) >= new Date()).length > 0 && (
          <Paper
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                All upcoming appointments
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 13.5 }}>
                Sorted by date, all future records
              </Typography>
            </Box>

            <Grid container>
              {appointments
                .filter((a) => new Date(a.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((appt, idx, arr) => (
                  <Grid key={appt.id} size={{ xs: 12, md: 6 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 2.5,
                        py: 1.8,
                        borderBottom:
                          idx < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                        borderRight: { md: idx % 2 === 0 ? "1px solid #f1f5f9" : "none" },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {appt.patient_name || `Patient #${appt.patient}`}
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: 13.5 }}>
                          {fmtDateTime(appt.date)}
                        </Typography>
                      </Box>
                      <StatusChip status={appt.status} />
                    </Stack>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}