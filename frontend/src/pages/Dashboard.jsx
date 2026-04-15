import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import api from "../services/api";

const glassCardSx = {
  background: "rgba(255, 255, 255, 0.62)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const softPanelSx = {
  background: "rgba(255, 255, 255, 0.78)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  borderRadius: 4,
};

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

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

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const kpiCards = [
    {
      title: "Total Patients",
      value: data.total_patients,
      icon: <PeopleAltOutlinedIcon fontSize="small" />,
      iconColor: "#0f766e",
      iconBg: "rgba(16, 185, 129, 0.14)",
    },
    {
      title: "Doctors",
      value: data.total_doctors,
      icon: <LocalHospitalOutlinedIcon fontSize="small" />,
      iconColor: "#2563eb",
      iconBg: "rgba(59, 130, 246, 0.14)",
    },
    {
      title: "Today Appointments",
      value: data.today_appointments,
      icon: <EventAvailableOutlinedIcon fontSize="small" />,
      iconColor: "#d97706",
      iconBg: "rgba(245, 158, 11, 0.14)",
    },
    {
      title: "Completed",
      value: data.completed_appointments,
      icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
      iconColor: "#16a34a",
      iconBg: "rgba(34, 197, 94, 0.14)",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        borderRadius: 5,
        background: `
          radial-gradient(circle at 0% 0%, rgba(15, 118, 110, 0.10), transparent 28%),
          radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.10), transparent 26%),
          radial-gradient(circle at 100% 100%, rgba(14, 165, 233, 0.08), transparent 24%),
          linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%)
        `,
        p: { xs: 1, md: 1.5 },
      }}
    >
      <Paper
        sx={{
          ...glassCardSx,
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -70,
            left: -30,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(15,118,110,0.16), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "#0f766e",
                letterSpacing: 1.2,
                fontWeight: 700,
              }}
            >
              Clinic Management
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
               Dashboard
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#475569",
                maxWidth: 620,
                lineHeight: 1.7,
              }}
            >
              Monitor appointments, patient flow, and clinic activity in one clean
              workspace designed for quick decisions and structured daily operations.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 3,
                boxShadow: "none",
                px: 2.2,
                py: 1.1,
              }}
            >
              New Appointment
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 2.2,
                py: 1.1,
                borderColor: "rgba(15, 23, 42, 0.10)",
                color: "#0f172a",
                backgroundColor: "rgba(255,255,255,0.35)",
              }}
            >
              View Reports
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                ...softPanelSx,
                p: 2.4,
                height: "100%",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", mb: 1 }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#0f172a" }}
                  >
                    {card.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: card.iconBg,
                    color: card.iconColor,
                    border: "1px solid rgba(255,255,255,0.45)",
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              ...softPanelSx,
              p: 3,
              mb: 3,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Today’s Overview
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Key operational indicators for the current day
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.46)",
                    border: "1px solid rgba(255,255,255,0.55)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    All appointments
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                    {data.total_appointments}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.46)",
                    border: "1px solid rgba(255,255,255,0.55)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Today appointments
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                    {data.today_appointments}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.46)",
                    border: "1px solid rgba(255,255,255,0.55)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                    {data.cancelled_appointments}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              ...softPanelSx,
              overflow: "hidden",
              p: 0,
            }}
          >
            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Recent Appointments
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Latest bookings and status updates
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />

            {data.recent_appointments.length === 0 ? (
              <Box sx={{ px: 3, py: 4 }}>
                <Typography color="text.secondary">
                  No appointments yet
                </Typography>
              </Box>
            ) : (
              data.recent_appointments.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    px: 3,
                    py: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr auto" },
                    gap: 2,
                    alignItems: "center",
                    borderBottom:
                      index !== data.recent_appointments.length - 1
                        ? "1px solid rgba(148, 163, 184, 0.12)"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {item.patient_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Patient
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: "#0f172a" }}>
                      {item.doctor_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Doctor
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: "#0f172a" }}>
                      {new Date(item.date).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Appointment time
                    </Typography>
                  </Box>

                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                    sx={{
                      textTransform: "capitalize",
                      width: "fit-content",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              ...softPanelSx,
              p: 3,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}>
              Quick Stats
            </Typography>

            <Stack spacing={1.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.44)",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                <Typography sx={{ color: "#64748b" }}>Completed</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {data.completed_appointments}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.44)",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                <Typography sx={{ color: "#64748b" }}>Cancelled</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {data.cancelled_appointments}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.44)",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                <Typography sx={{ color: "#64748b" }}>Doctors</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {data.total_doctors}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.44)",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                <Typography sx={{ color: "#64748b" }}>Patients</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {data.total_patients}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            sx={{
              ...softPanelSx,
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}>
              Quick Actions
            </Typography>

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  boxShadow: "none",
                }}
              >
                Add Patient
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  borderColor: "rgba(15, 23, 42, 0.10)",
                  color: "#0f172a",
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
              >
                Add Doctor
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  borderColor: "rgba(15, 23, 42, 0.10)",
                  color: "#0f172a",
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
              >
                Create Appointment
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;