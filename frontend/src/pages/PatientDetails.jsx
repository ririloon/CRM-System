import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import api from "../services/api";
import { useParams } from "react-router-dom";

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

function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    api.get(`patients/${id}/details/`)
      .then((res) => setPatient(res.data))
      .catch((err) => console.error(err));
  }, [id]);

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

  const formatDate = (value) => {
    if (!value) return "Not specified";
    return new Date(value).toLocaleString();
  };

  if (!patient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const firstLetter = patient.name ? patient.name.charAt(0).toUpperCase() : "P";
  const appointmentsCount = patient.appointments?.length || 0;
  const completedCount =
    patient.appointments?.filter((item) => item.status === "completed").length || 0;
  const upcomingCount =
    patient.appointments?.filter(
      (item) =>
        item.status === "scheduled" || item.status === "confirmed"
    ).length || 0;

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
            top: -70,
            right: -50,
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
            bottom: -80,
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
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar
              sx={{
                width: 72,
                height: 72,
                fontSize: 28,
                fontWeight: 700,
                background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)",
                boxShadow: "0 8px 18px rgba(37, 99, 235, 0.18)",
              }}
            >
              {firstLetter}
            </Avatar>

            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "#0f766e",
                  letterSpacing: 1.2,
                  fontWeight: 700,
                }}
              >
                Patient Profile
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {patient.name}
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: "#475569",
                }}
              >
                Detailed patient information, visit history, and notes
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "row", sm: "row" }} spacing={1.5} flexWrap="wrap">
            <Chip
              label={`${appointmentsCount} visits`}
              sx={{
                backgroundColor: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.55)",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${completedCount} completed`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              ...softPanelSx,
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 2.5 }}
            >
              Patient Information
            </Typography>

            <Stack spacing={2.2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(15, 118, 110, 0.10)",
                    color: "#0f766e",
                  }}
                >
                  <PersonOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Full name
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{patient.name}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(37, 99, 235, 0.10)",
                    color: "#2563eb",
                  }}
                >
                  <PhoneOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {patient.phone || "Not specified"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(14, 165, 233, 0.10)",
                    color: "#0284c7",
                  }}
                >
                  <EmailOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {patient.email || "Not specified"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    color: "#d97706",
                  }}
                >
                  <CakeOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Birth date
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {patient.birth_date || "Not specified"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          <Paper
            sx={{
              ...softPanelSx,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}
            >
              Summary
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
                <Typography sx={{ color: "#64748b" }}>Total visits</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {appointmentsCount}
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
                <Typography sx={{ color: "#64748b" }}>Completed</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {completedCount}
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
                <Typography sx={{ color: "#64748b" }}>Upcoming</Typography>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {upcomingCount}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              ...softPanelSx,
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 3, pt: 2 }}>
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                  },
                }}
              >
                <Tab icon={<HistoryOutlinedIcon fontSize="small" />} iconPosition="start" label="Appointments" />
                <Tab icon={<NotesOutlinedIcon fontSize="small" />} iconPosition="start" label="Notes" />
              </Tabs>
            </Box>

            <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />

            {tab === 0 && (
              <Box sx={{ p: 0 }}>
                {patient.appointments.length === 0 ? (
                  <Box sx={{ px: 3, py: 4 }}>
                    <Typography color="text.secondary">
                      No appointments yet
                    </Typography>
                  </Box>
                ) : (
                  patient.appointments.map((appt, index) => (
                    <Box
                      key={appt.id}
                      sx={{
                        px: 3,
                        py: 2,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr auto" },
                        gap: 2,
                        alignItems: "center",
                        borderBottom:
                          index !== patient.appointments.length - 1
                            ? "1px solid rgba(148, 163, 184, 0.12)"
                            : "none",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                          {appt.doctor_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {appt.doctor_specialization || "Doctor"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ color: "#0f172a" }}>
                          {formatDate(appt.date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Appointment date
                        </Typography>
                      </Box>

                      <Chip
                        label={appt.status}
                        color={getStatusColor(appt.status)}
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
              </Box>
            )}

            {tab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Notes
                </Typography>
                <Typography sx={{ color: "#0f172a", lineHeight: 1.8 }}>
                  {patient.notes || "No notes added for this patient."}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PatientDetails;