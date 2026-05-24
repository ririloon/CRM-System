import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Grid from "@mui/material/Grid";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const panelSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const mutedCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

function BookAppointment() {
  const { t } = useTranslation();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    doctor: "",
    date: "",
    reason: "",
    status: "confirmed",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    api
      .get("doctors/")
      .then((res) => {
        setDoctors(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("load doctors error:", err);
        setServerError(
          t("patientBooking.errors.doctorsLoad", "Failed to load doctors list.")
        );
      })
      .finally(() => setLoadingDoctors(false));
  }, [t]);

  const doctorOptions = useMemo(() => {
    return doctors.map((doctor) => ({
      value: doctor.id,
      label: doctor.name || `Doctor #${doctor.id}`,
      specialty: doctor.specialty || doctor.specialization || "",
    }));
  }, [doctors]);

  const selectedDoctor = useMemo(() => {
    return doctorOptions.find((item) => String(item.value) === String(form.doctor));
  }, [doctorOptions, form.doctor]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.doctor) {
      nextErrors.doctor = t("patientBooking.validation.doctor", "Please select a doctor.");
    }

    if (!form.date) {
      nextErrors.date = t("patientBooking.validation.date", "Please choose appointment date and time.");
    } else if (new Date(form.date) <= new Date()) {
      nextErrors.date = t(
        "patientBooking.validation.futureDate",
        "Appointment time must be in the future."
      );
    }

    if (!form.reason.trim()) {
      nextErrors.reason = t("patientBooking.validation.reason", "Please enter the visit reason.");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      doctor: "",
      date: "",
      reason: "",
      status: "confirmed",
    });
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setServerError("");
    setSuccessMessage("");

    try {
      await api.post("appointments/", {
        doctor: form.doctor,
        date: form.date,
        reason: form.reason,
        status: form.status,
      });

      setSuccessMessage(
        t("patientBooking.success", "Your appointment has been created successfully.")
      );
      resetForm();
    } catch (err) {
      console.error("book appointment error:", err);

      if (err?.response?.data && typeof err.response.data === "object") {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      } else {
        setServerError(
          t("patientBooking.errors.submit", "Failed to create appointment.")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctors) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f8fafc",
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Paper sx={{ ...panelSx, p: { xs: 2, md: 3 }, mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#64748b",
            fontWeight: 700,
            mb: 1,
          }}
        >
          {t("patientBooking.eyebrow", "Patient booking")}
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
          {t("patientBooking.title", "Book appointment")}
        </Typography>

        <Typography
          sx={{
            color: "#475569",
            maxWidth: 760,
            lineHeight: 1.7,
            fontSize: 15,
          }}
        >
          {t(
            "patientBooking.subtitle",
            "Choose a doctor, select the preferred date and time, and describe the reason for your visit."
          )}
        </Typography>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper component="form" onSubmit={handleSubmit} sx={{ ...panelSx, p: 3 }}>
            <Stack spacing={2.5}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              {successMessage && <Alert severity="success">{successMessage}</Alert>}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label={t("patientBooking.fields.doctor", "Doctor")}
                    value={form.doctor}
                    onChange={handleChange("doctor")}
                    error={Boolean(errors.doctor)}
                    helperText={errors.doctor || " "}
                  >
                    {doctorOptions.map((doctor) => (
                      <MenuItem key={doctor.value} value={doctor.value}>
                        {doctor.label}
                        {doctor.specialty ? ` — ${doctor.specialty}` : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label={t("patientBooking.fields.date", "Date and time")}
                    value={form.date}
                    onChange={handleChange("date")}
                    error={Boolean(errors.date)}
                    helperText={errors.date || " "}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label={t("patientBooking.fields.reason", "Reason for visit")}
                    value={form.reason}
                    onChange={handleChange("reason")}
                    error={Boolean(errors.reason)}
                    helperText={errors.reason || " "}
                    placeholder={t(
                      "patientBooking.fields.reasonPlaceholder",
                      "Describe symptoms, concern, or purpose of the visit."
                    )}
                  />
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                justifyContent="flex-end"
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={resetForm}
                  disabled={submitting}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    py: 1.2,
                    px: 2.5,
                  }}
                >
                  {t("patientBooking.actions.reset", "Reset")}
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    boxShadow: "none",
                    py: 1.2,
                    px: 2.5,
                  }}
                >
                  {submitting
                    ? t("patientBooking.actions.submitting", "Submitting...")
                    : t("patientBooking.actions.submit", "Create appointment")}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Paper sx={{ ...panelSx, p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
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
                  }}
                >
                  <LocalHospitalOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    {t("patientBooking.summary.title", "Booking summary")}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t(
                      "patientBooking.summary.subtitle",
                      "Review the current selection before submitting."
                    )}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                <Box sx={{ ...mutedCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.doctor", "Selected doctor")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedDoctor?.label || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.specialty", "Specialty")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedDoctor?.specialty || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.date", "Date and time")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {form.date || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ ...panelSx, p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
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
                  }}
                >
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    {t("patientBooking.tips.title", "Before you book")}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t(
                      "patientBooking.tips.subtitle",
                      "Useful reminders for accurate appointment creation."
                    )}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                <Box sx={{ ...mutedCardSx, p: 1.75, display: "flex", gap: 1.25 }}>
                  <CheckCircleOutlineOutlinedIcon sx={{ color: "#16a34a", mt: 0.2 }} />
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t(
                      "patientBooking.tips.future",
                      "Choose a future date and time that matches your availability."
                    )}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75, display: "flex", gap: 1.25 }}>
                  <NotesOutlinedIcon sx={{ color: "#2563eb", mt: 0.2 }} />
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t(
                      "patientBooking.tips.reason",
                      "Add a short reason for the visit so the clinic can prepare properly."
                    )}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75, display: "flex", gap: 1.25 }}>
                  <LocalHospitalOutlinedIcon sx={{ color: "#7c3aed", mt: 0.2 }} />
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t(
                      "patientBooking.tips.doctor",
                      "Select the doctor carefully before sending your request."
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BookAppointment;