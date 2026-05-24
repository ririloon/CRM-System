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
import { useEffect, useMemo, useRef, useState } from "react";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Grid from "@mui/material/Grid";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import api from "../../services/api";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const panelSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const infoCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

const emptyForm = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  blood_group: "",
  allergies: "",
  chronic_conditions: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

function MyProfile() {
  const { t } = useTranslation(["patientProfile", "common"]);
  const location = useLocation();

  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const successTimeoutRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const mapPatientToForm = (patient) => ({
    full_name: patient.full_name || patient.name || "",
    date_of_birth: patient.birth_date || patient.date_of_birth || "",
    gender: patient.gender || "",
    phone: patient.phone || "",
    email: patient.email || "",
    address: patient.address || "",
    blood_group: patient.blood_group || "",
    allergies: patient.allergies || "",
    chronic_conditions: patient.chronic_conditions || "",
    emergency_contact_name: patient.emergency_contact_name || "",
    emergency_contact_phone: patient.emergency_contact_phone || "",
    notes: patient.notes || "",
  });

  useEffect(() => {
    api
      .get("patients/")
      .then((res) => {
        const patient = Array.isArray(res.data) ? res.data[0] : res.data;

        if (patient) {
          setProfileId(patient.id || null);
          setForm(mapPatientToForm(patient));

          const hasRequired =
            (patient.full_name || patient.name) &&
            patient.phone &&
            (patient.birth_date || patient.date_of_birth) &&
            patient.gender;

          const params = new URLSearchParams(location.search);
          const mode = params.get("mode");
          setIsEditing(mode === "setup" || !hasRequired);
        } else {
          setForm(emptyForm);
          setIsEditing(true);
        }
      })
      .catch((err) => {
        console.error("patient profile load error:", err);
        setError(
          t("errors.load", {
            ns: "patientProfile",
            defaultValue: "Failed to load patient profile.",
          })
        );
        setIsEditing(true);
      })
      .finally(() => setLoading(false));
  }, [location.search, t]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setError("");
    setSuccessMessage("");

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = t("validation.fullName", {
        ns: "patientProfile",
        defaultValue: "Enter full name.",
      });
    }
    if (!form.phone.trim()) {
      nextErrors.phone = t("validation.phone", {
        ns: "patientProfile",
        defaultValue: "Enter phone number.",
      });
    }
    if (!form.date_of_birth) {
      nextErrors.date_of_birth = t("validation.dateOfBirth", {
        ns: "patientProfile",
        defaultValue: "Select date of birth.",
      });
    }
    if (!form.gender) {
      nextErrors.gender = t("validation.gender", {
        ns: "patientProfile",
        defaultValue: "Select gender.",
      });
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const profileCompletion = useMemo(() => {
    const requiredFields = [
      form.full_name,
      form.phone,
      form.date_of_birth,
      form.gender,
      form.email,
      form.address,
    ];

    const filled = requiredFields.filter((value) =>
      String(value || "").trim()
    ).length;

    return Math.round((filled / requiredFields.length) * 100);
  }, [form]);

  const isProfileComplete =
    !!form.full_name?.trim() &&
    !!form.phone?.trim() &&
    !!form.date_of_birth &&
    !!form.gender;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: form.full_name,
        phone: form.phone,
        email: form.email,
        birth_date: form.date_of_birth,
        gender: form.gender,
        address: form.address,
        blood_group: form.blood_group,
        allergies: form.allergies,
        chronic_conditions: form.chronic_conditions,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        notes: form.notes,
      };

      if (profileId) {
        await api.patch(`patients/${profileId}/`, payload);
      } else {
        const res = await api.post("patients/", payload);
        setProfileId(res.data?.id || null);
      }

      setSuccessMessage(
        t("success.save", {
          ns: "patientProfile",
          defaultValue: "Profile information saved successfully.",
        })
      );

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage("");
      }, 3200);

      setIsEditing(false);
    } catch (err) {
      console.error("patient profile save error:", err);

      if (err?.response?.data && typeof err.response.data === "object") {
        const backendErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
      } else {
        setError(
          t("errors.save", {
            ns: "patientProfile",
            defaultValue: "Failed to save patient profile.",
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setFieldErrors({});

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    api
      .get("patients/")
      .then((res) => {
        const patient = Array.isArray(res.data) ? res.data[0] : res.data;

        if (patient) {
          setProfileId(patient.id || null);
          setForm(mapPatientToForm(patient));
        } else {
          setForm(emptyForm);
        }
      })
      .catch((err) => {
        console.error("patient profile reload error:", err);
        setError(
          t("errors.load", {
            ns: "patientProfile",
            defaultValue: "Failed to load patient profile.",
          })
        );
      })
      .finally(() => {
        setIsEditing(false);
        setLoading(false);
      });
  };

  const renderFieldValue = (value, placeholderKey) =>
    value?.trim()
      ? value
      : t(placeholderKey, {
          ns: "patientProfile",
          defaultValue: t("placeholders.notSpecified", {
            ns: "common",
            defaultValue: "Not specified",
          }),
        });

  if (loading) {
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box>
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
              {t("eyebrow", {
                ns: "patientProfile",
                defaultValue: "Patient profile",
              })}
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
              {t("title", {
                ns: "patientProfile",
                defaultValue: "My profile",
              })}
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                maxWidth: 760,
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              {t("subtitle", {
                ns: "patientProfile",
                defaultValue:
                  "Complete and update your personal and medical information for smoother clinic service.",
              })}
            </Typography>
          </Box>
        </Stack>

        {!isEditing && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                borderColor: "#cbd5e1",
                color: "#0f172a",
                backgroundColor: "#fff",
                px: 1.8,
                py: 0.9,
                minWidth: 0,
              }}
            >
              {t("actions.edit", {
                ns: "patientProfile",
                defaultValue: "Edit profile",
              })}
            </Button>
          </Box>
        )}
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {isEditing ? (
            <Paper component="form" onSubmit={handleSubmit} sx={{ ...panelSx, p: 3 }}>
              <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t("fields.fullName", {
                        ns: "patientProfile",
                        defaultValue: "Full name",
                      })}
                      value={form.full_name}
                      onChange={handleChange("full_name")}
                      error={Boolean(fieldErrors.full_name)}
                      helperText={fieldErrors.full_name || " "}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                      <Typography
                        sx={{
                          mb: 0.75,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        {t("fields.dateOfBirth", {
                          ns: "patientProfile",
                          defaultValue: "Date of birth",
                        })}
                      </Typography>

                      <TextField
                        fullWidth
                        type="date"
                        value={form.date_of_birth}
                        onChange={handleChange("date_of_birth")}
                        error={Boolean(fieldErrors.date_of_birth)}
                        helperText={fieldErrors.date_of_birth || " "}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label={t("fields.gender", {
                        ns: "patientProfile",
                        defaultValue: "Gender",
                      })}
                      value={form.gender}
                      onChange={handleChange("gender")}
                      error={Boolean(fieldErrors.gender)}
                      helperText={fieldErrors.gender || " "}
                    >
                      <MenuItem value="male">
                        {t("genderOptions.male", {
                          ns: "patientProfile",
                          defaultValue: "Male",
                        })}
                      </MenuItem>
                      <MenuItem value="female">
                        {t("genderOptions.female", {
                          ns: "patientProfile",
                          defaultValue: "Female",
                        })}
                      </MenuItem>
                      <MenuItem value="other">
                        {t("genderOptions.other", {
                          ns: "patientProfile",
                          defaultValue: "Other",
                        })}
                      </MenuItem>
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t("fields.phone", {
                        ns: "patientProfile",
                        defaultValue: "Phone",
                      })}
                      value={form.phone}
                      onChange={handleChange("phone")}
                      error={Boolean(fieldErrors.phone)}
                      helperText={fieldErrors.phone || " "}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t("fields.email", {
                        ns: "patientProfile",
                        defaultValue: "Email",
                      })}
                      value={form.email}
                      onChange={handleChange("email")}
                      error={Boolean(fieldErrors.email)}
                      helperText={fieldErrors.email || " "}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t("fields.bloodGroup", {
                        ns: "patientProfile",
                        defaultValue: "Blood group",
                      })}
                      value={form.blood_group}
                      onChange={handleChange("blood_group")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t("fields.address", {
                        ns: "patientProfile",
                        defaultValue: "Address",
                      })}
                      value={form.address}
                      onChange={handleChange("address")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label={t("fields.allergies", {
                        ns: "patientProfile",
                        defaultValue: "Allergies",
                      })}
                      value={form.allergies}
                      onChange={handleChange("allergies")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label={t("fields.chronicConditions", {
                        ns: "patientProfile",
                        defaultValue: "Chronic conditions",
                      })}
                      value={form.chronic_conditions}
                      onChange={handleChange("chronic_conditions")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t("fields.emergencyContactName", {
                        ns: "patientProfile",
                        defaultValue: "Emergency contact name",
                      })}
                      value={form.emergency_contact_name}
                      onChange={handleChange("emergency_contact_name")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t("fields.emergencyContactPhone", {
                        ns: "patientProfile",
                        defaultValue: "Emergency contact phone",
                      })}
                      value={form.emergency_contact_phone}
                      onChange={handleChange("emergency_contact_phone")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label={t("fields.notes", {
                        ns: "patientProfile",
                        defaultValue: "Additional notes",
                      })}
                      value={form.notes}
                      onChange={handleChange("notes")}
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
                    startIcon={<CloseOutlinedIcon />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "12px",
                      borderColor: "#cbd5e1",
                      color: "#0f172a",
                      backgroundColor: "#fff",
                      px: 2.5,
                      py: 1.1,
                    }}
                  >
                    {t("actions.cancel", {
                      ns: "patientProfile",
                      defaultValue: "Cancel",
                    })}
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    disabled={saving}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "12px",
                      boxShadow: "none",
                      py: 1.2,
                      px: 2.5,
                    }}
                  >
                    {saving
                      ? t("actions.saving", {
                          ns: "patientProfile",
                          defaultValue: "Saving...",
                        })
                      : t("actions.save", {
                          ns: "patientProfile",
                          defaultValue: "Save profile",
                        })}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Paper sx={{ ...panelSx, p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}

              <Stack spacing={2.5}>
                <Box sx={{ ...infoCardSx, p: 2.25 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      color: "#64748b",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {t("sections.personal", {
                      ns: "patientProfile",
                      defaultValue: "Personal information",
                    })}
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.fullName", {
                          ns: "patientProfile",
                          defaultValue: "Full name",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.full_name, "placeholders.fullName")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.dateOfBirth", {
                          ns: "patientProfile",
                          defaultValue: "Date of birth",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.date_of_birth, "placeholders.dateOfBirth")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.gender", {
                          ns: "patientProfile",
                          defaultValue: "Gender",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.gender, "placeholders.gender")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.bloodGroup", {
                          ns: "patientProfile",
                          defaultValue: "Blood group",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.blood_group, "placeholders.bloodGroup")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ ...infoCardSx, p: 2.25 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      color: "#64748b",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {t("sections.contact", {
                      ns: "patientProfile",
                      defaultValue: "Contact information",
                    })}
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.phone", {
                          ns: "patientProfile",
                          defaultValue: "Phone",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.phone, "placeholders.phone")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.email", {
                          ns: "patientProfile",
                          defaultValue: "Email",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.email, "placeholders.email")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.address", {
                          ns: "patientProfile",
                          defaultValue: "Address",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.address, "placeholders.address")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ ...infoCardSx, p: 2.25 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      color: "#64748b",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {t("sections.medical", {
                      ns: "patientProfile",
                      defaultValue: "Medical information",
                    })}
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.allergies", {
                          ns: "patientProfile",
                          defaultValue: "Allergies",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.allergies, "placeholders.allergies")}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.chronicConditions", {
                          ns: "patientProfile",
                          defaultValue: "Chronic conditions",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(
                          form.chronic_conditions,
                          "placeholders.chronicConditions"
                        )}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.notes", {
                          ns: "patientProfile",
                          defaultValue: "Additional notes",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(form.notes, "placeholders.notes")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ ...infoCardSx, p: 2.25 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      color: "#64748b",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {t("sections.emergency", {
                      ns: "patientProfile",
                      defaultValue: "Emergency contact",
                    })}
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.emergencyContactName", {
                          ns: "patientProfile",
                          defaultValue: "Emergency contact name",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(
                          form.emergency_contact_name,
                          "placeholders.emergencyContactName"
                        )}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mb: 0.25 }}>
                        {t("fields.emergencyContactPhone", {
                          ns: "patientProfile",
                          defaultValue: "Emergency contact phone",
                        })}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {renderFieldValue(
                          form.emergency_contact_phone,
                          "placeholders.emergencyContactPhone"
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Paper>
          )}
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
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    {t("summary.title", {
                      ns: "patientProfile",
                      defaultValue: "Profile completion",
                    })}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t("summary.subtitle", {
                      ns: "patientProfile",
                      defaultValue: "Complete the key patient details.",
                    })}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ ...infoCardSx, p: 2 }}>
                <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                  {t("summary.progress", {
                    ns: "patientProfile",
                    defaultValue: "Completion progress",
                  })}
                </Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#0f172a", mb: 1 }}>
                  {profileCompletion}%
                </Typography>
                <Typography sx={{ color: "#475569", fontSize: 14 }}>
                  {!isProfileComplete
                    ? t("summary.incomplete", {
                        ns: "patientProfile",
                        defaultValue:
                          "Fill in the required profile fields to complete your account.",
                      })
                    : t("summary.complete", {
                        ns: "patientProfile",
                        defaultValue:
                          "Your main patient profile details are completed.",
                      })}
                </Typography>
              </Box>
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
                  <ContactPhoneOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    {t("tips.title", {
                      ns: "patientProfile",
                      defaultValue: "Why this matters",
                    })}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t("tips.subtitle", {
                      ns: "patientProfile",
                      defaultValue: "Helpful reasons to keep your data updated.",
                    })}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                <Box sx={{ ...infoCardSx, p: 1.75 }}>
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t("tips.identity", {
                      ns: "patientProfile",
                      defaultValue:
                        "Accurate personal details help the clinic identify your account correctly.",
                    })}
                  </Typography>
                </Box>

                <Box sx={{ ...infoCardSx, p: 1.75 }}>
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t("tips.contacts", {
                      ns: "patientProfile",
                      defaultValue:
                        "Current phone and emergency contact information improves communication.",
                    })}
                  </Typography>
                </Box>

                <Box sx={{ ...infoCardSx, p: 1.75 }}>
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>
                    {t("tips.medical", {
                      ns: "patientProfile",
                      defaultValue:
                        "Medical notes like allergies and chronic conditions support safer care.",
                    })}
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
                  <LocalHospitalOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    {t("required.title", {
                      ns: "patientProfile",
                      defaultValue: "Required fields",
                    })}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    {t("required.subtitle", {
                      ns: "patientProfile",
                      defaultValue: "Fill these first after registration.",
                    })}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1}>
                {[
                  t("fields.fullName", {
                    ns: "patientProfile",
                    defaultValue: "Full name",
                  }),
                  t("fields.phone", {
                    ns: "patientProfile",
                    defaultValue: "Phone",
                  }),
                  t("fields.dateOfBirth", {
                    ns: "patientProfile",
                    defaultValue: "Date of birth",
                  }),
                  t("fields.gender", {
                    ns: "patientProfile",
                    defaultValue: "Gender",
                  }),
                ].map((item) => (
                  <Box key={item} sx={{ ...infoCardSx, p: 1.5 }}>
                    <Typography sx={{ color: "#0f172a", fontSize: 14, fontWeight: 600 }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MyProfile;