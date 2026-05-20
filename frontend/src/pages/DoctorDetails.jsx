import {
  Alert,
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
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
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
  background: "rgba(255, 255, 255, 0.82)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.68)",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  borderRadius: 4,
};

const infoCardSx = {
  ...softPanelSx,
  p: 2.5,
  height: "100%",
};

function InfoItem({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.4,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(248, 250, 252, 0.95)",
          color: "#2563eb",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            mb: 0.35,
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            color: "#0f172a",
            fontWeight: 600,
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    //setLoading(true);
    //setErrorText("");

    api
      .get(`doctors/${id}/`)
      .then((res) => {
        setDoctor(res.data);
      })
      .catch((err) => {
        console.error(err);
        setErrorText("Failed to load doctor profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorText || !doctor) {
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
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {errorText || "Doctor profile not found."}
        </Alert>
      </Box>
    );
  }

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
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/doctors")}
          sx={{
            borderRadius: 3,
            color: "#334155",
          }}
        >
          Back to doctors
        </Button>
      </Stack>

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
            background:
              "radial-gradient(circle, rgba(37,99,235,0.15), transparent 65%)",
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
            background:
              "radial-gradient(circle, rgba(15,118,110,0.16), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(15,118,110,0.16), rgba(37,99,235,0.16))",
                  color: "#0f766e",
                  fontWeight: 800,
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {doctor.name?.charAt(0)?.toUpperCase() || "D"}
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#0f766e",
                    letterSpacing: 1.2,
                    fontWeight: 700,
                  }}
                >
                  Provider Profile
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.2,
                  }}
                >
                  {doctor.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 1.2 }}
                >
                  <Chip
                    label={doctor.specialization || "General"}
                    sx={{
                      backgroundColor: "rgba(37, 99, 235, 0.08)",
                      color: "#1d4ed8",
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={
                      doctor.is_available_online
                        ? "Online consultations available"
                        : "Offline consultations only"
                    }
                    color={doctor.is_available_online ? "success" : "default"}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Typography
              sx={{
                mt: 2.2,
                color: "#475569",
                maxWidth: 760,
                lineHeight: 1.75,
              }}
            >
              {doctor.bio ||
                "This doctor profile does not yet include a detailed biography."}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                ...softPanelSx,
                p: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontWeight: 600,
                    mb: 0.8,
                  }}
                >
                  Quick summary
                </Typography>

                <Typography
                  sx={{
                    fontSize: 30,
                    lineHeight: 1,
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.03em",
                    mb: 0.8,
                  }}
                >
                  {doctor.experience_years || 0} yrs
                </Typography>

                <Typography sx={{ color: "#64748b", lineHeight: 1.6 }}>
                  Clinical experience in {doctor.specialization || "general practice"}.
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2.5,
                  borderRadius: 3,
                  boxShadow: "none",
                  py: 1.2,
                }}
                onClick={() => navigate("/appointments")}
              >
                Book Appointment
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={infoCardSx}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}
            >
              Professional details
            </Typography>

            <Stack spacing={2.2}>
              <InfoItem
                icon={<LocalHospitalOutlinedIcon fontSize="small" />}
                label="Specialization"
                value={doctor.specialization}
              />
              <InfoItem
                icon={<SchoolOutlinedIcon fontSize="small" />}
                label="Experience"
                value={
                  doctor.experience_years || doctor.experience_years === 0
                    ? `${doctor.experience_years} years`
                    : "Not specified"
                }
              />
              <InfoItem
                icon={<BadgeOutlinedIcon fontSize="small" />}
                label="License number"
                value={doctor.license_number}
              />
              <InfoItem
                icon={<PublicOutlinedIcon fontSize="small" />}
                label="Online consultations"
                value={
                  doctor.is_available_online ? "Available" : "Not available"
                }
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={infoCardSx}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}
            >
              Contact information
            </Typography>

            <Stack spacing={2.2}>
              <InfoItem
                icon={<PhoneOutlinedIcon fontSize="small" />}
                label="Phone"
                value={doctor.phone}
              />
              <InfoItem
                icon={<EmailOutlinedIcon fontSize="small" />}
                label="Email"
                value={doctor.email}
              />
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontWeight: 600,
                mb: 1,
              }}
            >
              Profile note
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                lineHeight: 1.75,
              }}
            >
              This profile is intended to help clinic staff and patients review
              core provider information before scheduling or consultation.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DoctorDetails;