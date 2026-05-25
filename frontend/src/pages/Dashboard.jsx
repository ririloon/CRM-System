import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import Grid from "@mui/material/Grid";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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

const kpiIconWrap = {
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
};

const chartColors = {
  confirmed: "#2563eb",
  completed: "#16a34a",
  cancelled: "#dc2626",
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("dashboard/")
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch((err) => {
        console.error("dashboard error:", err);
        if (err?.response?.status === 401) {
          setError("You are not authorized to view the dashboard.");
        } else {
          setError("Failed to load dashboard data.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;

    const patients = Number(data.patients_count || 0);
    const doctors = Number(data.doctors_count || 0);
    const totalAppointments = Number(data.total_appointments_count || 0);
    const future = Number(data.future_appointments_count || 0);
    const today = Number(data.today_appointments_count || 0);
    const week = Number(data.week_appointments_count || 0);
    const completed = Number(data.completed_appointments_count || 0);
    const cancelled = Number(data.cancelled_appointments_count || 0);
    const noShow = Number(data.no_show_appointments_count || 0);
    const confirmed = Number(data.confirmed_appointments_count || 0);

    const completionRate = totalAppointments
      ? Math.round((completed / totalAppointments) * 100)
      : 0;

    const cancellationRate = totalAppointments
      ? Math.round((cancelled / totalAppointments) * 100)
      : 0;

    const noShowRate = totalAppointments
      ? Math.round((noShow / totalAppointments) * 100)
      : 0;

    const avgWeekLoadPerDoctor =
      doctors > 0 ? (week / doctors).toFixed(1) : "0.0";
    const patientDoctorRatio =
      doctors > 0 ? (patients / doctors).toFixed(1) : "0.0";
    const todayShareOfWeek = week > 0 ? Math.round((today / week) * 100) : 0;

    return {
      patients,
      doctors,
      totalAppointments,
      future,
      today,
      week,
      completed,
      cancelled,
      noShow,
      confirmed,
      completionRate,
      cancellationRate,
      noShowRate,
      avgWeekLoadPerDoctor,
      patientDoctorRatio,
      todayShareOfWeek,
    };
  }, [data]);

  const weeklyTrendData = useMemo(() => {
    const raw = data?.weekly_trend || [];
    return raw.map((item) => {
      const date = new Date(item.date);
      return {
        date: item.date,
        count: item.count,
        label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      };
    });
  }, [data]);

  const appointmentsByStatusData = useMemo(() => {
    const statusMap = data?.appointments_by_status || {};
    return [
      {
        name: "Confirmed",
        key: "confirmed",
        value: Number(statusMap.confirmed || 0),
        color: chartColors.confirmed,
      },
      {
        name: "Completed",
        key: "completed",
        value: Number(statusMap.completed || 0),
        color: chartColors.completed,
      },
      {
        name: "Cancelled",
        key: "cancelled",
        value: Number(statusMap.cancelled || 0),
        color: chartColors.cancelled,
      },
    ];
  }, [data]);

  const recentAppointments = data?.recent_appointments || [];
  const todaySchedule = data?.today_schedule_preview || [];

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
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
    switch (status) {
      case "completed":
        return "Completed";
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "no_show":
        return "No show";
      case "scheduled":
        return "Scheduled";
      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: { xs: 1.5, md: 3 }, py: 3 }}>
        <Paper sx={{ ...panelSx, p: 3 }}>
          <Typography sx={{ color: "#b91c1c", fontWeight: 600 }}>
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!data || !metrics) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const kpis = [
    {
      key: "patients",
      title: "Patients",
      value: metrics.patients,
      icon: <PeopleAltOutlinedIcon fontSize="small" />,
    },
    {
      key: "doctors",
      title: "Doctors",
      value: metrics.doctors,
      icon: <LocalHospitalOutlinedIcon fontSize="small" />,
    },
    {
      key: "future",
      title: "Future appointments",
      value: metrics.future,
      icon: <CalendarMonthOutlinedIcon fontSize="small" />,
    },
    {
      key: "today",
      title: "Today appointments",
      value: metrics.today,
      icon: <EventAvailableOutlinedIcon fontSize="small" />,
    },
  ];

  const insightCards = [
    {
      title: "Completion rate",
      value: `${metrics.completionRate}%`,
      note: "Share of appointments successfully completed.",
    },
    {
      title: "Cancellation rate",
      value: `${metrics.cancellationRate}%`,
      note: "Percentage of appointments cancelled by users or staff.",
    },
    {
      title: "No-show rate",
      value: `${metrics.noShowRate}%`,
      note: "Appointments where the patient did not attend.",
    },
    {
      title: "Weekly load per doctor",
      value: metrics.avgWeekLoadPerDoctor,
      note: "Average number of weekly appointments assigned to each doctor.",
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
                letterSpacing: 1.1,
                color: "#64748b",
                fontWeight: 700,
                mb: 1,
              }}
            >
              Admin overview
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
              Healthcare Dashboard
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                maxWidth: 760,
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              Monitor patients, doctors, appointments, operational workload, and
              scheduling trends from one administrative dashboard.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack
              direction={{ xs: "column", sm: "row", lg: "column" }}
              spacing={1.25}
              sx={{ width: "100%" }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/appointments")}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  boxShadow: "none",
                  py: 1.2,
                  px: 1.75,
                  minHeight: 46,
                }}
              >
                New appointment
              </Button>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={() => navigate("/patients")}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  borderColor: "#cbd5e1",
                  color: "#0f172a",
                  py: 1.2,
                  px: 1.75,
                  minHeight: 46,
                  backgroundColor: "#fff",
                }}
              >
                Open patients
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {kpis.map((item) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.key}>
            <Paper sx={{ ...panelSx, p: 2.25, height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 32,
                      lineHeight: 1,
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>

                <Box sx={kpiIconWrap}>{item.icon}</Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
                >
                  Weekly appointment trend
                </Typography>
                <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: 14 }}>
                  Appointment volume over the last 7 days.
                </Typography>
              </Box>

              <Box sx={kpiIconWrap}>
                <TimelineOutlinedIcon fontSize="small" />
              </Box>
            </Stack>

            <Box sx={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData}>
                  <defs>
                    <linearGradient
                      id="weeklyAreaFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.22}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#weeklyAreaFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
                >
                  Appointment status
                </Typography>
                <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: 14 }}>
                  Distribution by current appointment state.
                </Typography>
              </Box>

              <Box sx={kpiIconWrap}>
                <PieChartOutlineOutlinedIcon fontSize="small" />
              </Box>
            </Stack>

            <Box sx={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentsByStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {appointmentsByStatusData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Stack spacing={1.1} sx={{ mt: 1.5 }}>
              {appointmentsByStatusData.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 2,
                    px: 1.25,
                    py: 1,
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "999px",
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "#475569",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      minWidth: 24,
                      textAlign: "right",
                      fontWeight: 800,
                      color: "#0f172a",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ ...panelSx, p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
              >
                Operational insights
              </Typography>
              <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: 14 }}>
                Key ratios and performance indicators for the current period.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {insightCards.map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.title}>
                  <Box sx={{ ...subtleCardSx, p: 2.1, height: "100%" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 28,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: "#0f172a",
                        mb: 1,
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}
                    >
                      {item.note}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...panelSx, p: 3, height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
              >
                Capacity snapshot
              </Typography>
              <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: 14 }}>
                Quick view of workload balance across the clinic.
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              <Box sx={{ ...subtleCardSx, p: 2 }}>
                <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                  Patient-to-doctor ratio
                </Typography>
                <Typography
                  sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}
                >
                  {metrics.patientDoctorRatio}
                </Typography>
              </Box>

              <Box sx={{ ...subtleCardSx, p: 2 }}>
                <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                  Average weekly load
                </Typography>
                <Typography
                  sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}
                >
                  {metrics.avgWeekLoadPerDoctor}
                </Typography>
              </Box>

              <Box sx={{ ...subtleCardSx, p: 2 }}>
                <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                  Today share of weekly volume
                </Typography>
                <Typography
                  sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}
                >
                  {metrics.todayShareOfWeek}%
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ ...panelSx, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography
                sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
              >
                Recent appointments
              </Typography>
              <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: 14 }}>
                Latest appointment activity across the system.
              </Typography>
            </Box>

            <Divider />

            {recentAppointments.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography sx={{ color: "#64748b" }}>
                  No recent appointments available.
                </Typography>
              </Box>
            ) : (
              recentAppointments.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    px: 3,
                    py: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1.2fr 1fr 1fr auto",
                    },
                    gap: 2,
                    alignItems: "center",
                    borderBottom:
                      index !== recentAppointments.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {item.patient_name}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                      Patient
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: "#0f172a" }}>
                      {item.doctor_name}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                      Doctor
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: "#0f172a" }}>
                      {formatDateTime(item.date)}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                      Date & time
                    </Typography>
                  </Box>

                  <Chip
                    label={getStatusLabel(item.status)}
                    color={getStatusColor(item.status)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      borderRadius: "10px",
                      width: "fit-content",
                      justifySelf: { xs: "start", md: "end" },
                    }}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2.5}>
            <Paper sx={{ ...panelSx, p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}
                  >
                    Today schedule
                  </Typography>
                  <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: 14 }}>
                    Preview of appointments planned for today.
                  </Typography>
                </Box>

                <Box sx={kpiIconWrap}>
                  <TodayOutlinedIcon fontSize="small" />
                </Box>
              </Stack>

              {todaySchedule.length === 0 ? (
                <Typography sx={{ color: "#64748b" }}>
                  No appointments scheduled for today.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {todaySchedule.map((item) => (
                    <Box key={item.id} sx={{ ...subtleCardSx, p: 1.75 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box>
                          <Typography
                            sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
                          >
                            {item.patient_name}
                          </Typography>
                          <Typography
                            sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}
                          >
                            {item.doctor_name}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                            {formatDateTime(item.date)}
                          </Typography>
                        </Box>

                        <Chip
                          label={getStatusLabel(item.status)}
                          color={getStatusColor(item.status)}
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: "10px" }}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            <Paper sx={{ ...panelSx, p: 3 }}>
              <Typography
                sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a", mb: 2 }}
              >
                Quick actions
              </Typography>

              <Stack spacing={1.25}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/appointments")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    boxShadow: "none",
                    py: 1.2,
                    justifyContent: "space-between",
                  }}
                >
                  Create appointment
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/patients")}
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
                  Open patients
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/doctors")}
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
                  Open doctors
                </Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography
                sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}
              >
                Use this dashboard to monitor clinic activity, track appointment
                flow, and quickly navigate to operational sections.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
