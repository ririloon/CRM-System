import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
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

const selectedCardSx = {
  backgroundColor: "#eff6ff",
  border: "1px solid #93c5fd",
  borderRadius: "14px",
  boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.12)",
};

function BookAppointment() {
  const { t } = useTranslation();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const [form, setForm] = useState({
    doctor_id: "",
    date_only: "",
    slot_value: "",
    complaint: "",
    comment: "",
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

  const specialties = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization || "")
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty) return doctors;
    return doctors.filter(
      (doctor) => (doctor.specialization || "") === selectedSpecialty
    );
  }, [doctors, selectedSpecialty]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((doctor) => String(doctor.id) === String(form.doctor_id));
  }, [doctors, form.doctor_id]);

  const selectedSlot = useMemo(() => {
    return availableSlots.find(
      (slot) =>
        String(
          typeof slot === "string" ? slot : slot.value || slot.time || slot.slot || ""
        ) === String(form.slot_value)
    );
  }, [availableSlots, form.slot_value]);

  const formattedSelectedDateTime = useMemo(() => {
    if (!form.slot_value) return "";

    const parsed = new Date(form.slot_value);
    if (Number.isNaN(parsed.getTime())) return form.slot_value;

    return parsed.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [form.slot_value]);

  useEffect(() => {
    if (!form.doctor_id || !form.date_only) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setServerError("");
    setErrors((prev) => ({ ...prev, slot_value: "" }));

    api
      .get(`doctors/${form.doctor_id}/available-slots/`, {
        params: { date: form.date_only },
      })
      .then((res) => {
        let slots = [];

        if (Array.isArray(res.data)) {
          slots = res.data;
        } else if (Array.isArray(res.data?.slots)) {
          slots = res.data.slots;
        }

        setAvailableSlots(slots);
      })
      .catch((err) => {
        console.error("load available slots error:", err);
        setAvailableSlots([]);
        setServerError(
          t(
            "patientBooking.errors.slotsLoad",
            "Failed to load available time slots."
          )
        );
      })
      .finally(() => setLoadingSlots(false));
  }, [form.doctor_id, form.date_only, t]);

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setConfirmedAppointment(null);
    setForm((prev) => ({
      ...prev,
      doctor_id: "",
      date_only: "",
      slot_value: "",
    }));
    setAvailableSlots([]);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
  };

  const clearSpecialtyFilter = () => {
    setSelectedSpecialty("");
    setConfirmedAppointment(null);
    setForm((prev) => ({
      ...prev,
      doctor_id: "",
      date_only: "",
      slot_value: "",
    }));
    setAvailableSlots([]);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
  };

  const handleDoctorSelect = (doctorId) => {
    setConfirmedAppointment(null);
    setForm((prev) => ({
      ...prev,
      doctor_id: doctorId,
      slot_value: "",
    }));
    setAvailableSlots([]);
    setErrors((prev) => ({
      ...prev,
      doctor_id: "",
      slot_value: "",
    }));
    setServerError("");
    setSuccessMessage("");
  };

  const handleDateChange = (event) => {
    const value = event.target.value;

    setConfirmedAppointment(null);
    setForm((prev) => ({
      ...prev,
      date_only: value,
      slot_value: "",
    }));

    setAvailableSlots([]);
    setErrors((prev) => ({
      ...prev,
      date_only: "",
      slot_value: "",
    }));
    setServerError("");
    setSuccessMessage("");
  };

  const handleSlotSelect = (slotValue) => {
    setConfirmedAppointment(null);
    setForm((prev) => ({
      ...prev,
      slot_value: slotValue,
    }));

    setErrors((prev) => ({
      ...prev,
      slot_value: "",
    }));
    setServerError("");
    setSuccessMessage("");
  };

  const handleChange = (field) => (event) => {
    setConfirmedAppointment(null);
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

    if (!selectedSpecialty) {
      nextErrors.specialty = t(
        "patientBooking.validation.specialty",
        "Please select a specialty."
      );
    }

    if (!form.doctor_id) {
      nextErrors.doctor_id = t(
        "patientBooking.validation.doctor",
        "Please select a doctor."
      );
    }

    if (!form.date_only) {
      nextErrors.date_only = t(
        "patientBooking.validation.date",
        "Please choose a date."
      );
    }

    if (!form.slot_value) {
      nextErrors.slot_value = t(
        "patientBooking.validation.slot",
        "Please choose an available time slot."
      );
    }

    if (!form.complaint.trim()) {
      nextErrors.complaint = t(
        "patientBooking.validation.complaint",
        "Please enter the reason for your visit."
      );
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setSelectedSpecialty("");
    setAvailableSlots([]);
    setForm({
      doctor_id: "",
      date_only: "",
      slot_value: "",
      complaint: "",
      comment: "",
    });
    setErrors({});
    setServerError("");
  };

  const handleBookAnother = () => {
    setConfirmedAppointment(null);
    setSuccessMessage("");
    resetForm();
  };

  const todayString = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const payload = {
        doctor_id: form.doctor_id,
        date: form.slot_value,
        complaint: form.complaint,
        comment: form.comment,
      };

      const response = await api.post("appointments/", payload);

      const confirmationData = {
        appointmentId: response?.data?.id || null,
        doctorName: selectedDoctor?.name || "—",
        specialty: selectedDoctor?.specialization || selectedSpecialty || "—",
        dateTime: formattedSelectedDateTime || form.slot_value,
        complaint: form.complaint,
        comment: form.comment,
        raw: response?.data || null,
      };

      setConfirmedAppointment(confirmationData);
      setSuccessMessage(
        t(
          "patientBooking.success",
          "Your appointment has been booked successfully."
        )
      );

      setSelectedSpecialty("");
      setAvailableSlots([]);
      setForm({
        doctor_id: "",
        date_only: "",
        slot_value: "",
        complaint: "",
        comment: "",
      });
      setErrors({});
      setServerError("");
    } catch (err) {
      console.error("book appointment error:", err);
      console.error("book appointment error response:", err?.response?.data);

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
            "Select a specialty, choose a doctor, pick a date, and book one of the available time slots."
          )}
        </Typography>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{ ...panelSx, p: 3, overflow: "hidden" }}
          >
            <Stack spacing={3}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              {successMessage && <Alert severity="success">{successMessage}</Alert>}

              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 1.5,
                  }}
                >
                  {t("patientBooking.sections.specialty", "1. Choose specialty")}
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {specialties.map((specialty) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      clickable
                      onClick={() => handleSpecialtySelect(specialty)}
                      color={selectedSpecialty === specialty ? "primary" : "default"}
                      variant={selectedSpecialty === specialty ? "filled" : "outlined"}
                      sx={{
                        borderRadius: "10px",
                        fontWeight: 600,
                        px: 0.5,
                        py: 2.4,
                        maxWidth: "100%",
                      }}
                    />
                  ))}

                  {selectedSpecialty && (
                    <Chip
                      label={t("patientBooking.actions.clearFilter", "Clear")}
                      clickable
                      onClick={clearSpecialtyFilter}
                      variant="outlined"
                      sx={{
                        borderRadius: "10px",
                        fontWeight: 600,
                        px: 0.5,
                        py: 2.4,
                        maxWidth: "100%",
                      }}
                    />
                  )}
                </Stack>

                {errors.specialty && (
                  <Typography sx={{ color: "#d32f2f", fontSize: 13, mt: 1 }}>
                    {errors.specialty}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 1.5,
                  }}
                >
                  {t("patientBooking.sections.doctor", "2. Choose doctor")}
                </Typography>

                {!selectedSpecialty ? (
                  <Box sx={{ ...mutedCardSx, p: 2 }}>
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                      {t(
                        "patientBooking.chooseSpecialtyFirst",
                        "Select a specialty first to see matching doctors."
                      )}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {filteredDoctors.map((doctor) => {
                      const isSelected = String(form.doctor_id) === String(doctor.id);

                      return (
                        <Grid key={doctor.id} size={{ xs: 12, md: 6 }}>
                          <Box
                            onClick={() => handleDoctorSelect(doctor.id)}
                            sx={{
                              ...(isSelected ? selectedCardSx : mutedCardSx),
                              p: 2,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              minWidth: 0,
                              overflow: "hidden",
                            }}
                          >
                            <Stack spacing={1.25}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={1}
                                sx={{ minWidth: 0 }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: 17,
                                      fontWeight: 800,
                                      color: "#0f172a",
                                    }}
                                  >
                                    {doctor.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#475569",
                                      fontSize: 14,
                                      mt: 0.3,
                                    }}
                                  >
                                    {doctor.specialization || "—"}
                                  </Typography>
                                </Box>

                                {isSelected ? (
                                  <Chip
                                    label={t("patientBooking.selected", "Selected")}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 700 }}
                                  />
                                ) : null}
                              </Stack>

                              <Typography
                                sx={{
                                  color: "#64748b",
                                  fontSize: 13,
                                  lineHeight: 1.6,
                                }}
                              >
                                {doctor.bio ||
                                  t(
                                    "patientBooking.doctorFallbackBio",
                                    "Doctor profile is available for appointment booking."
                                  )}
                              </Typography>

                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {!!doctor.experience_years && (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`${doctor.experience_years} ${t(
                                      "patientBooking.yearsExperience",
                                      "years exp."
                                    )}`}
                                  />
                                )}
                                {doctor.is_available_online ? (
                                  <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label={t("patientBooking.onlineAvailable", "Online available")}
                                  />
                                ) : null}
                              </Stack>
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {selectedSpecialty && !filteredDoctors.length && (
                  <Typography sx={{ color: "#64748b", fontSize: 14, mt: 1.5 }}>
                    {t(
                      "patientBooking.noDoctors",
                      "No doctors found for the selected specialty."
                    )}
                  </Typography>
                )}

                {errors.doctor_id && (
                  <Typography sx={{ color: "#d32f2f", fontSize: 13, mt: 1 }}>
                    {errors.doctor_id}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 1.5,
                  }}
                >
                  {t("patientBooking.sections.date", "3. Choose date")}
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      value={form.date_only}
                      onChange={handleDateChange}
                      error={Boolean(errors.date_only)}
                      helperText={
                        errors.date_only ||
                        t(
                          "patientBooking.fields.dateHelp",
                          "Only future dates can be selected."
                        )
                      }
                      inputProps={{ min: todayString }}
                      disabled={!form.doctor_id}
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor: "#fff",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {!form.doctor_id && (
                  <Typography sx={{ color: "#64748b", fontSize: 13, mt: 1 }}>
                    {t(
                      "patientBooking.pickDoctorFirst",
                      "Choose a doctor first to view available dates and times."
                    )}
                  </Typography>
                )}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 1.5,
                  }}
                >
                  {t("patientBooking.sections.slot", "4. Choose time slot")}
                </Typography>

                {!form.doctor_id || !form.date_only ? (
                  <Box sx={{ ...mutedCardSx, p: 2 }}>
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                      {t(
                        "patientBooking.slotHint",
                        "Select a doctor and date to see real available slots."
                      )}
                    </Typography>
                  </Box>
                ) : loadingSlots ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={22} />
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                      {t("patientBooking.loadingSlots", "Loading available slots...")}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: "100%",
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{
                          width: "100%",
                          minWidth: 0,
                          alignItems: "flex-start",
                        }}
                      >
                        {availableSlots.map((slot, index) => {
                          const slotValue =
                            typeof slot === "string"
                              ? slot
                              : slot.value || slot.time || slot.slot || "";

                          const slotLabel =
                            typeof slot === "string"
                              ? (() => {
                                  const parsed = new Date(slot);
                                  return Number.isNaN(parsed.getTime())
                                    ? slot
                                    : parsed.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      });
                                })()
                              : slot.label ||
                                slot.time ||
                                slot.value ||
                                slot.slot ||
                                `Slot ${index + 1}`;

                          if (!slotValue) return null;

                          return (
                            <Chip
                              key={slotValue}
                              label={slotLabel}
                              clickable
                              onClick={() => handleSlotSelect(slotValue)}
                              color={form.slot_value === slotValue ? "primary" : "default"}
                              variant={form.slot_value === slotValue ? "filled" : "outlined"}
                              sx={{
                                borderRadius: "10px",
                                fontWeight: 700,
                                px: 0.5,
                                py: 2.4,
                                maxWidth: "100%",
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>

                    {!availableSlots.length && (
                      <Box sx={{ ...mutedCardSx, p: 2, mt: 1.25 }}>
                        <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                          {t(
                            "patientBooking.noSlots",
                            "No available slots for the selected doctor and date."
                          )}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}

                {errors.slot_value && (
                  <Typography sx={{ color: "#d32f2f", fontSize: 13, mt: 1 }}>
                    {errors.slot_value}
                  </Typography>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label={t("patientBooking.fields.complaint", "Reason for visit")}
                    value={form.complaint}
                    onChange={handleChange("complaint")}
                    error={Boolean(errors.complaint)}
                    helperText={errors.complaint || " "}
                    placeholder={t(
                      "patientBooking.fields.complaintPlaceholder",
                      "Describe symptoms, concern, or purpose of the visit."
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t("patientBooking.fields.comment", "Additional comment")}
                    value={form.comment}
                    onChange={handleChange("comment")}
                    error={Boolean(errors.comment)}
                    helperText={errors.comment || " "}
                    placeholder={t(
                      "patientBooking.fields.commentPlaceholder",
                      "Optional details for the clinic or doctor."
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
                  onClick={() => {
                    setConfirmedAppointment(null);
                    setSuccessMessage("");
                    resetForm();
                  }}
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
                    : t("patientBooking.actions.submit", "Book appointment")}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            {confirmedAppointment && (
              <Paper
                sx={{
                  ...panelSx,
                  p: 3,
                  border: "1px solid #bbf7d0",
                  backgroundColor: "#f0fdf4",
                }}
              >
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
                      backgroundColor: "#dcfce7",
                      border: "1px solid #86efac",
                      color: "#15803d",
                    }}
                  >
                    <CheckCircleOutlineOutlinedIcon fontSize="small" />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#166534" }}>
                      {t("patientBooking.confirmation.title", "Appointment confirmed")}
                    </Typography>
                    <Typography sx={{ color: "#166534", fontSize: 14 }}>
                      {t(
                        "patientBooking.confirmation.subtitle",
                        "Your booking was saved successfully."
                      )}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1.25}>
                  {confirmedAppointment.appointmentId && (
                    <Box sx={{ ...mutedCardSx, p: 1.75, backgroundColor: "#ffffff" }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                        {t("patientBooking.confirmation.id", "Appointment ID")}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        #{confirmedAppointment.appointmentId}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ ...mutedCardSx, p: 1.75, backgroundColor: "#ffffff" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                      {t("patientBooking.summary.doctor", "Selected doctor")}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {confirmedAppointment.doctorName}
                    </Typography>
                    <Typography sx={{ color: "#475569", fontSize: 13, mt: 0.4 }}>
                      {confirmedAppointment.specialty}
                    </Typography>
                  </Box>

                  <Box sx={{ ...mutedCardSx, p: 1.75, backgroundColor: "#ffffff" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                      {t("patientBooking.summary.date", "Date and time")}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {confirmedAppointment.dateTime}
                    </Typography>
                  </Box>

                  <Box sx={{ ...mutedCardSx, p: 1.75, backgroundColor: "#ffffff" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                      {t("patientBooking.summary.reason", "Reason for visit")}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {confirmedAppointment.complaint || "—"}
                    </Typography>
                  </Box>

                  {confirmedAppointment.comment?.trim() && (
                    <Box sx={{ ...mutedCardSx, p: 1.75, backgroundColor: "#ffffff" }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                        {t("patientBooking.fields.comment", "Additional comment")}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {confirmedAppointment.comment}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleBookAnother}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "12px",
                      boxShadow: "none",
                      mt: 1,
                    }}
                  >
                    {t("patientBooking.actions.bookAnother", "Book another appointment")}
                  </Button>
                </Stack>
              </Paper>
            )}

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
                      "Review the selected appointment before booking."
                    )}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                <Box sx={{ ...mutedCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.specialty", "Specialty")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedSpecialty || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...(selectedDoctor ? selectedCardSx : mutedCardSx), p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.doctor", "Selected doctor")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedDoctor?.name || "—"}
                  </Typography>
                  <Typography sx={{ color: "#475569", fontSize: 13, mt: 0.4 }}>
                    {selectedDoctor?.specialization || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...(selectedSlot ? selectedCardSx : mutedCardSx), p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.date", "Date and time")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {formattedSelectedDateTime || "—"}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.5 }}>
                    {t("patientBooking.summary.reason", "Reason for visit")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {form.complaint?.trim() || "—"}
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
                      "Helpful reminders for a smooth booking experience."
                    )}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                <Box sx={{ ...mutedCardSx, p: 1.75, display: "flex", gap: 1.25 }}>
                  <CheckCircleOutlineOutlinedIcon sx={{ color: "#16a34a", mt: 0.2 }} />
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t(
                      "patientBooking.tips.specialty",
                      "Choose the correct specialty first to narrow down the doctor list."
                    )}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75, display: "flex", gap: 1.25 }}>
                  <PersonOutlineOutlinedIcon sx={{ color: "#2563eb", mt: 0.2 }} />
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t(
                      "patientBooking.tips.slot",
                      "Pick one of the available slots shown for the selected doctor and date."
                    )}
                  </Typography>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 1.75, display: "flex", gap: 1.25 }}>
                  <NotesOutlinedIcon sx={{ color: "#7c3aed", mt: 0.2 }} />
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t(
                      "patientBooking.tips.reason",
                      "Add a short complaint so the clinic can prepare for your visit."
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