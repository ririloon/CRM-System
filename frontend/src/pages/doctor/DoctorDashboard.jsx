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
import { useEffect, useState } from "react";

import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import Grid from "@mui/material/Grid";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import api from "../../services/api";

function StatusChip({ status }) {
  const map = {
    scheduled:  { label: "Scheduled",  bg: "#dbeafe", color: "#1d4ed8" },
    confirmed:  { label: "Confirmed",  bg: "#dcfce7", color: "#166534" },
    completed:  { label: "Completed",  bg: "#ede9fe", color: "#6d28d9" },
    cancelled:  { label: "Cancelled",  bg: "#fee2e2", color: "#b91c1c" },
    no_show:    { label: "No show",    bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status] || { label: status || "—", bg: "#e2e8f0", color: "#475569" };
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, borderRadius: 999 }}
    />
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3,
            bgcolor: `${color}18`,
            color,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>{label}</Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
            {value ?? "—"}
          </Typography>
          {sub && (
            <Typography sx={{ fontSize: 13, color: "#94a3b8", mt: 0.5 }}>{sub}</Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [data, setData]       = useState(null);
  const [doctorName, setDoctorName] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [meRes, dashRes] = await Promise.all([
        api.get("auth/me/"),
        api.get("dashboard/"),
      ]);
      setDoctorName(meRes.data?.full_name || meRes.data?.username || "Doctor");
      setData(dashRes.data);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#0f766e" }} />
      </Box>
    );
  }

  const today      = data?.today_schedule_preview  || [];
  const recent     = data?.recent_appointments     || [];
  const trend      = data?.weekly_trend            || [];
  const byStatus   = data?.appointments_by_status  || {};

  const statusColors = {
    confirmed: "#0f766e",
    completed: "#6d28d9",
    cancelled: "#dc2626",
    no_show:   "#d97706",
  };

  const totalByStatus = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
  const trendMax = Math.max(...trend.map((t) => t.count), 1);

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

        {/* ── Hero ── */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #0f766e 0%, #0f172a 60%, #1e40af 100%)",
            color: "#fff",
            boxShadow: "0 16px 48px rgba(15,23,42,0.18)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {[
            { size: 220, right: -50, top: -50, opacity: 0.08 },
            { size: 160, right: 100, bottom: -60, opacity: 0.06 },
          ].map((c, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: c.size,
                height: c.size,
                borderRadius: "50%",
                background: "rgba(255,255,255,1)",
                opacity: c.opacity,
                right: c.right,
                top: c.top,
                bottom: c.bottom,
              }}
            />
          ))}

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: 13, mb: 0.8 }}>
                Doctor workspace
              </Typography>
              <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 800 }}>
                Welcome back, Dr. {doctorName}
              </Typography>
              <Typography sx={{ opacity: 0.82, mt: 0.8, maxWidth: 560 }}>
                Your daily clinical overview — appointments, patients, tasks and analytics.
              </Typography>
            </Box>
            <Stack direction={{ xs: "row", md: "row" }} spacing={1.2}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#fff",
                  color: "#0f172a",
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#e2e8f0", boxShadow: "none" },
                }}
              >
                Open schedule
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.35)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 3,
                  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                Patient records
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* ── KPI cards ── */}
        <Grid container spacing={2.2}>
          {[
            {
              icon: <CalendarTodayRoundedIcon />,
              label: "Today's appointments",
              value: data?.today_appointments_count,
              sub: "scheduled for today",
              color: "#2563eb",
            },
            {
              icon: <EventAvailableRoundedIcon />,
              label: "This week",
              value: data?.week_appointments_count,
              sub: "next 7 days",
              color: "#0f766e",
            },
            {
              icon: <CheckCircleOutlineRoundedIcon />,
              label: "Completed",
              value: data?.completed_appointments_count,
              sub: "all time",
              color: "#7c3aed",
            },
            {
              icon: <Groups2RoundedIcon />,
              label: "Total appointments",
              value: data?.total_appointments_count,
              sub: "in the system",
              color: "#ea580c",
            },
          ].map((k) => (
            <Grid key={k.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <KpiCard {...k} />
            </Grid>
          ))}
        </Grid>

        {/* ── Today schedule + Alerts ── */}
        <Grid container spacing={2.2}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
                height: "100%",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 17 }}>
                    Today's appointments
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 13.5, mt: 0.3 }}>
                    {today.length
                      ? `${today.length} consultations scheduled`
                      : "No appointments today"}
                  </Typography>
                </Box>
                <Chip
                  label={`${today.length} total`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: "#eff6ff", color: "#1d4ed8", borderRadius: 999 }}
                />
              </Stack>

              {today.length === 0 ? (
                <Box
                  sx={{
                    py: 5,
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 3,
                  }}
                >
                  <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
                    No appointments scheduled for today
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {today.map((item, idx) => (
                    <Stack
                      key={item.id}
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1.5}
                      sx={{ py: 1.8 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: 14,
                            fontWeight: 800,
                          }}
                        >
                          {idx + 1}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {item.patient_name || `Patient #${item.patient}`}
                          </Typography>
                          <Typography sx={{ color: "#64748b", fontSize: 13.5 }}>
                            {new Intl.DateTimeFormat("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                            }).format(new Date(item.date))}
                          </Typography>
                        </Box>
                      </Stack>
                      <StatusChip status={item.status} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={2.2} sx={{ height: "100%" }}>
              {/* Daily progress */}
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <TrendingUpRoundedIcon sx={{ color: "#0f766e" }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Completion rate
                  </Typography>
                </Stack>
                {(() => {
                  const total     = data?.total_appointments_count || 0;
                  const completed = data?.completed_appointments_count || 0;
                  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <>
                      <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
                        {pct}%
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: 13.5, mb: 1.5 }}>
                        {completed} of {total} appointments completed
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            bgcolor: "#0f766e",
                          },
                        }}
                      />
                    </>
                  );
                })()}
              </Paper>

              {/* Alerts */}
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: "1px solid #fef3c7",
                  bgcolor: "#fffbeb",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.04)",
                  flex: 1,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <WarningAmberRoundedIcon sx={{ color: "#d97706" }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Attention required
                  </Typography>
                </Stack>
                <Stack spacing={1.2}>
                  {[
                    {
                      text: `${data?.cancelled_appointments_count ?? 0} cancelled appointments`,
                      color: "#dc2626",
                      bg: "#fee2e2",
                    },
                    {
                      text: `${data?.no_show_appointments_count ?? 0} no-show patients`,
                      color: "#d97706",
                      bg: "#fef3c7",
                    },
                    {
                      text: `${data?.future_appointments_count ?? 0} upcoming appointments`,
                      color: "#2563eb",
                      bg: "#dbeafe",
                    },
                  ].map((a) => (
                    <Box
                      key={a.text}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 2.5,
                        bgcolor: a.bg,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: a.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                        {a.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* ── Analytics row ── */}
        <Grid container spacing={2.2}>
          {/* Status breakdown */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                Appointments by status
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 13.5, mb: 2.5 }}>
                All-time breakdown
              </Typography>
              <Stack spacing={1.8}>
                {Object.entries(byStatus).map(([key, val]) => {
                  const color = statusColors[key] || "#64748b";
                  const pct   = Math.round((val / totalByStatus) * 100);
                  const labels = {
                    confirmed: "Confirmed",
                    completed: "Completed",
                    cancelled: "Cancelled",
                    no_show:   "No show",
                  };
                  return (
                    <Box key={key}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.6 }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>
                            {labels[key] || key}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
                            {val}
                          </Typography>
                          <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>
                            {pct}%
                          </Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: color },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* 7-day trend */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                7-day forecast
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 13.5, mb: 2.5 }}>
                Appointment load by day
              </Typography>
              <Stack spacing={1.4}>
                {trend.map((item) => {
                  const pct = Math.round((item.count / trendMax) * 100);
                  const d   = new Date(item.date);
                  const dayLabel = d.toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  });
                  return (
                    <Stack key={item.date} direction="row" spacing={1.5} alignItems="center">
                      <Typography
                        sx={{ minWidth: 80, color: "#64748b", fontSize: 13, fontWeight: 600 }}
                      >
                        {dayLabel}
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "#e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, #0f766e, #2563eb)",
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{ minWidth: 20, fontWeight: 800, color: "#0f172a", fontSize: 14 }}
                      >
                        {item.count}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* Recent appointments */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                Recent appointments
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 13.5, mb: 2 }}>
                Last 6 records
              </Typography>
              <Stack spacing={1.2}>
                {recent.length === 0 ? (
                  <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>No records yet</Typography>
                ) : (
                  recent.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1.3,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: 13.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.patient_name || `Patient #${item.patient}`}
                        </Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12.5 }}>
                          {new Intl.DateTimeFormat("ru-RU", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(item.date))}
                        </Typography>
                      </Box>
                      <StatusChip status={item.status} />
                    </Stack>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}