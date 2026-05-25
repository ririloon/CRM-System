import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import api from "../../services/api";

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

const formFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(148, 163, 184, 0.24)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(100, 116, 139, 0.38)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
  },
};

const externalLabelSx = {
  fontSize: 14,
  fontWeight: 500,
  color: "#64748b",
  mb: 0.75,
};

const sectionTitleSx = {
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
};

const sectionHintSx = {
  fontSize: 13.5,
  color: "#64748b",
  mt: 0.4,
};

const emptyVisitForm = {
  appointment_id: "",
  doctor_notes: "",
  treatment_plan: "",
  follow_up_date: "",
};

const emptyPrescription = {
  medication_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

function normalizeVisitRecord(item) {
  return {
    id: item.id,
    appointment: item.appointment,
    patient: item.patient,
    doctor: item.doctor,
    diagnosis: item.diagnosis || "",
    treatment_plan: item.treatment_plan || "",
    doctor_notes: item.doctor_notes || "",
    follow_up_date: item.follow_up_date || "",
    created_at: item.created_at || "",
    prescriptions: Array.isArray(item.prescriptions) ? item.prescriptions : [],
  };
}

function normalizeAppointment(item) {
  return {
    id: item.id,
    patient_id: item.patient,
    patient_name: item.patient_name || "Unknown patient",
    date: item.date,
    status: item.status,
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function VisitRecords() {
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [form, setForm] = useState(emptyVisitForm);
  const [prescriptions, setPrescriptions] = useState([{ ...emptyPrescription }]);
  const [files, setFiles] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [pageError, setPageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [recordsRes, appointmentsRes] = await Promise.allSettled([
        api.get("visit-records/my/"),
        api.get("appointments/my/"),
      ]);

      const loadedRecords =
        recordsRes.status === "fulfilled" && Array.isArray(recordsRes.value?.data)
          ? recordsRes.value.data.map(normalizeVisitRecord)
          : [];

      const loadedAppointments =
        appointmentsRes.status === "fulfilled" && Array.isArray(appointmentsRes.value?.data)
          ? appointmentsRes.value.data.map(normalizeAppointment)
          : [];

      setRecords(loadedRecords);
      setAppointments(loadedAppointments);

      if (appointmentsRes.status === "rejected") {
        setPageError("Could not load appointments.");
      }

      if (loadedRecords.length > 0) {
        const first = loadedRecords[0];
        setSelectedRecordId(first.id);
        setForm({
          appointment_id: first.appointment || "",
          doctor_notes: first.doctor_notes || "",
          treatment_plan: first.treatment_plan || "",
          follow_up_date: first.follow_up_date || "",
        });
        setPrescriptions(
          first.prescriptions.length
            ? first.prescriptions.map((p) => ({
                id: p.id,
                medication_name: p.medication_name || "",
                dosage: p.dosage || "",
                frequency: p.frequency || "",
                duration: p.duration || "",
                instructions: p.instructions || "",
              }))
            : [{ ...emptyPrescription }]
        );
      } else {
        setSelectedRecordId(null);
        setForm({ ...emptyVisitForm });
        setPrescriptions([{ ...emptyPrescription }]);
      }
    } catch (error) {
      console.error(error);
      setPageError("Failed to load visit data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) || null,
    [records, selectedRecordId]
  );

  const selectedAppointment = useMemo(() => {
    const id = Number(form.appointment_id || selectedRecord?.appointment);
    if (!id) return null;
    return appointments.find((a) => a.id === id) || null;
  }, [appointments, form.appointment_id, selectedRecord]);

  const filteredRecords = useMemo(() => {
    if (!records.length) return [];
    return records.filter((item) => {
      const text =
        `${item.patient || ""} ${item.doctor_notes || ""} ${item.treatment_plan || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [records, search]);

  const availableAppointments = useMemo(() => {
    const usedIds = new Set(records.map((r) => String(r.appointment)));

    if (selectedRecordId) {
      const current = appointments.find(
        (a) => String(a.id) === String(selectedRecord?.appointment)
      );
      return current ? [current] : [];
    }

    return appointments.filter((a) => !usedIds.has(String(a.id)));
  }, [appointments, records, selectedRecordId, selectedRecord]);

  const handleSelectRecord = (record) => {
    setSelectedRecordId(record.id);
    setSaveError("");
    setSaveSuccess("");
    setFiles([]);
    setForm({
      appointment_id: record.appointment || "",
      doctor_notes: record.doctor_notes || "",
      treatment_plan: record.treatment_plan || "",
      follow_up_date: record.follow_up_date || "",
    });
    setPrescriptions(
      record.prescriptions.length
        ? record.prescriptions.map((p) => ({
            id: p.id,
            medication_name: p.medication_name || "",
            dosage: p.dosage || "",
            frequency: p.frequency || "",
            duration: p.duration || "",
            instructions: p.instructions || "",
          }))
        : [{ ...emptyPrescription }]
    );
  };

  const handleCreateNewRecord = () => {
    setSelectedRecordId(null);
    setSaveError("");
    setSaveSuccess("");
    setFiles([]);
    setForm({
      ...emptyVisitForm,
      appointment_id: "",
    });
    setPrescriptions([{ ...emptyPrescription }]);
  };

  const handleChangeForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    setPrescriptions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddPrescription = () => {
    setPrescriptions((prev) => [...prev, { ...emptyPrescription }]);
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions((prev) => {
      if (prev.length === 1) return [{ ...emptyPrescription }];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  };

  const saveSummary = async (mode = "publish") => {
    setSaveError("");
    setSaveSuccess("");

    const appointmentId = form.appointment_id || selectedRecord?.appointment || "";

    if (!appointmentId) {
      setSaveError("Appointment is required.");
      return;
    }

    if (!form.doctor_notes.trim() && !form.treatment_plan.trim()) {
      setSaveError("Add at least a clinical note or recommendation.");
      return;
    }

    const cleanedPrescriptions = prescriptions.filter(
      (item) =>
        item.medication_name?.trim() ||
        item.dosage?.trim() ||
        item.frequency?.trim() ||
        item.duration?.trim() ||
        item.instructions?.trim()
    );

    const payload = {
      appointment_id: Number(appointmentId),
      diagnosis: form.doctor_notes || "Visit summary",
      treatment_plan: form.treatment_plan,
      doctor_notes: form.doctor_notes,
      follow_up_date: form.follow_up_date || null,
    };

    if (mode === "draft") setSavingDraft(true);
    if (mode === "publish") setPublishing(true);

    try {
      let visitRecordId = selectedRecordId;

      if (selectedRecordId) {
        await api.patch(`visit-records/${selectedRecordId}/`, payload);
      } else {
        const res = await api.post("visit-records/", payload);
        visitRecordId = res.data?.id;
        setSelectedRecordId(visitRecordId);
      }

      if (visitRecordId && cleanedPrescriptions.length) {
        await Promise.all(
          cleanedPrescriptions.map((p) =>
            api.post("prescriptions/", {
              visit_record_id: visitRecordId,
              medication_name: p.medication_name,
              dosage: p.dosage,
              frequency: p.frequency,
              duration: p.duration,
              instructions: p.instructions,
            })
          )
        );
      }

      if (visitRecordId && files.length) {
        const appointment = appointments.find((a) => a.id === Number(appointmentId));
        const patientId = appointment?.patient_id;

        if (patientId) {
          await Promise.all(
            files.map((file) => {
              const fd = new FormData();
              fd.append("patient", patientId);
              fd.append("visit_record", visitRecordId);
              fd.append("title", file.name);
              fd.append("document_type", "visit attachment");
              fd.append("file", file);

              return api.post("medical-documents/", fd, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            })
          );
        }
      }

      setSaveSuccess(
        mode === "draft"
          ? "Summary saved successfully."
          : "Summary published and available to the patient."
      );
      setFiles([]);
      await loadData();
    } catch (error) {
      console.error(error);
      setSaveError(
        mode === "draft"
          ? "Failed to save summary."
          : "Failed to publish summary."
      );
    } finally {
      setSavingDraft(false);
      setPublishing(false);
    }
  };

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
              Clinical Workspace
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Patient Visit Records
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#475569",
                maxWidth: 820,
                lineHeight: 1.7,
              }}
            >
              Create one complete summary for the patient: clinical note,
              recommendation, prescriptions, attachments, and follow-up plan.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={handleCreateNewRecord}
            sx={{
              borderRadius: 3,
              boxShadow: "none",
              px: 2.2,
              py: 1.1,
            }}
          >
            New Summary
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            xl: "420px minmax(0, 1fr)",
          },
          alignItems: "stretch",
        }}
      >
        <Paper sx={{ ...softPanelSx, p: 2, height: "100%" }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                Visit Summaries
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Open an existing summary or create a new patient-facing summary.
              </Typography>
            </Box>

            <TextField
              placeholder="Search summaries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={formFieldSx}
            />

            <Divider />

            {loading ? (
              <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <List sx={{ p: 0, display: "grid", gap: 1 }}>
                {filteredRecords.length ? (
                  filteredRecords.map((item) => (
                    <ListItemButton
                      key={item.id}
                      onClick={() => handleSelectRecord(item)}
                      sx={{
                        borderRadius: 3,
                        p: 1.5,
                        border:
                          item.id === selectedRecordId
                            ? "1px solid rgba(37,99,235,0.28)"
                            : "1px solid rgba(148,163,184,0.16)",
                        background:
                          item.id === selectedRecordId
                            ? "linear-gradient(135deg, rgba(15,118,110,0.08), rgba(37,99,235,0.07))"
                            : "#fff",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                              {item.patient}
                            </Typography>
                            <Chip
                              label="Published"
                              size="small"
                              sx={{
                                backgroundColor: "rgba(15,118,110,0.10)",
                                color: "#0f766e",
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              sx={{
                                color: "#475569",
                                fontSize: 13,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.doctor_notes || "No note yet"}
                            </Typography>
                            <Typography
                              sx={{ color: "#94a3b8", fontSize: 12, mt: 0.6 }}
                            >
                              {formatDate(item.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px dashed rgba(148,163,184,0.28)",
                      backgroundColor: "rgba(255,255,255,0.65)",
                    }}
                  >
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                      No visit summaries yet.
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ ...softPanelSx, p: { xs: 2, md: 2.5 }, height: "100%" }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 24 }}>
                  Summary Package
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Everything in this summary becomes visible to the patient.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<AssignmentOutlinedIcon />}
                  label={selectedRecordId ? `Summary #${selectedRecordId}` : "Draft"}
                  sx={{
                    backgroundColor: "rgba(37,99,235,0.08)",
                    color: "#1d4ed8",
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Box>

            {pageError ? <Alert severity="warning">{pageError}</Alert> : null}
            {saveError ? <Alert severity="error">{saveError}</Alert> : null}
            {saveSuccess ? <Alert severity="success">{saveSuccess}</Alert> : null}

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Typography sx={sectionTitleSx}>Appointment</Typography>
              <Typography sx={sectionHintSx}>
                Select the visit this summary belongs to.
              </Typography>

              <TextField
                select
                label="Appointment"
                value={form.appointment_id || ""}
                onChange={(e) => handleChangeForm("appointment_id", e.target.value)}
                fullWidth
                sx={{ ...formFieldSx, mt: 1.5 }}
                disabled={!!selectedRecordId}
              >
                <MenuItem value="">Select appointment</MenuItem>
                {availableAppointments.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.patient_name} — {formatDate(a.date)} ({a.status})
                  </MenuItem>
                ))}
              </TextField>

              {selectedAppointment ? (
                <Box
                  sx={{
                    mt: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 3,
                    background: "rgba(37,99,235,0.05)",
                    border: "1px solid rgba(37,99,235,0.12)",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                    {selectedAppointment.patient_name}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: 13, mt: 0.35 }}>
                    Appointment: {formatDate(selectedAppointment.date)} •{" "}
                    {selectedAppointment.status}
                  </Typography>
                </Box>
              ) : null}
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Typography sx={sectionTitleSx}>Clinical note</Typography>
              <Typography sx={sectionHintSx}>
                Add the main doctor note that the patient should read.
              </Typography>

              <TextField
                label="Doctor note"
                value={form.doctor_notes}
                onChange={(e) => handleChangeForm("doctor_notes", e.target.value)}
                fullWidth
                multiline
                minRows={5}
                sx={{ ...formFieldSx, mt: 1.5 }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Typography sx={sectionTitleSx}>Recommendation</Typography>
              <Typography sx={sectionHintSx}>
                Add care advice, treatment instructions, or next steps.
              </Typography>

              <TextField
                label="Recommendation"
                value={form.treatment_plan}
                onChange={(e) => handleChangeForm("treatment_plan", e.target.value)}
                fullWidth
                multiline
                minRows={4}
                sx={{ ...formFieldSx, mt: 1.5 }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Box>
                  <Typography sx={sectionTitleSx}>Prescriptions</Typography>
                  <Typography sx={sectionHintSx}>
                    These medications are included in the same patient summary.
                  </Typography>
                </Box>

                <Button
                  size="small"
                  startIcon={<AddOutlinedIcon />}
                  onClick={handleAddPrescription}
                  sx={{ borderRadius: 999 }}
                >
                  Add medication
                </Button>
              </Stack>

              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {prescriptions.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid rgba(148,163,184,0.18)",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Stack spacing={1.4}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Chip
                          icon={<MedicationOutlinedIcon />}
                          label={`Medication ${index + 1}`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(15,118,110,0.08)",
                            color: "#0f766e",
                            fontWeight: 700,
                          }}
                        />

                        <IconButton
                          size="small"
                          onClick={() => handleRemovePrescription(index)}
                          sx={{ color: "#dc2626" }}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <TextField
                        label="Medication name"
                        value={item.medication_name}
                        onChange={(e) =>
                          handlePrescriptionChange(index, "medication_name", e.target.value)
                        }
                        fullWidth
                        sx={formFieldSx}
                      />

                      <Box
                        sx={{
                          display: "grid",
                          gap: 1.2,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        }}
                      >
                        <TextField
                          label="Dosage"
                          value={item.dosage}
                          onChange={(e) =>
                            handlePrescriptionChange(index, "dosage", e.target.value)
                          }
                          fullWidth
                          sx={formFieldSx}
                        />
                        <TextField
                          label="Frequency"
                          value={item.frequency}
                          onChange={(e) =>
                            handlePrescriptionChange(index, "frequency", e.target.value)
                          }
                          fullWidth
                          sx={formFieldSx}
                        />
                        <TextField
                          label="Duration"
                          value={item.duration}
                          onChange={(e) =>
                            handlePrescriptionChange(index, "duration", e.target.value)
                          }
                          fullWidth
                          sx={formFieldSx}
                        />
                        <TextField
                          label="Instructions"
                          value={item.instructions}
                          onChange={(e) =>
                            handlePrescriptionChange(index, "instructions", e.target.value)
                          }
                          fullWidth
                          sx={formFieldSx}
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Typography sx={sectionTitleSx}>Attachments</Typography>
              <Typography sx={sectionHintSx}>
                Upload files that should appear inside the patient summary.
              </Typography>

              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileOutlinedIcon />}
                  sx={{ borderRadius: 3, justifyContent: "flex-start", width: "fit-content" }}
                >
                  Upload files
                  <input hidden multiple type="file" onChange={handleFilesChange} />
                </Button>

                {files.length ? (
                  <Stack spacing={1}>
                    {files.map((file) => (
                      <Box
                        key={file.name}
                        sx={{
                          px: 1.25,
                          py: 1,
                          borderRadius: 2.5,
                          backgroundColor: "#fff",
                          border: "1px solid rgba(148,163,184,0.18)",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 13.5, color: "#0f172a", fontWeight: 600 }}
                        >
                          {file.name}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: 13.5, color: "#94a3b8" }}>
                    No files selected yet.
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(148,163,184,0.16)",
              }}
            >
              <Typography sx={sectionTitleSx}>Follow-up</Typography>
              <Typography sx={sectionHintSx}>
                Add a follow-up date if the patient needs another visit.
              </Typography>

              <Box sx={{ mt: 1.5 }}>
                <Typography sx={externalLabelSx}>Follow-up date</Typography>
                <TextField
                  type="date"
                  value={form.follow_up_date || ""}
                  onChange={(e) => handleChangeForm("follow_up_date", e.target.value)}
                  fullWidth
                  sx={formFieldSx}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
                flexWrap: "wrap",
                pt: 1,
              }}
            >
              <Typography sx={{ color: "#64748b", fontSize: 13.5, maxWidth: 560 }}>
                Notes, recommendations, prescriptions, attachments, and follow-up
                details are saved together as one patient-facing summary.
              </Typography>

              <Stack direction="row" spacing={1.2}>
                <Button
                  variant="outlined"
                  startIcon={<SaveOutlinedIcon />}
                  onClick={() => saveSummary("draft")}
                  disabled={savingDraft || publishing}
                  sx={{ borderRadius: 3, px: 2 }}
                >
                  {savingDraft ? "Saving..." : "Save Draft"}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<PublishOutlinedIcon />}
                  onClick={() => saveSummary("publish")}
                  disabled={savingDraft || publishing}
                  sx={{
                    borderRadius: 3,
                    boxShadow: "none",
                    px: 2.3,
                  }}
                >
                  {publishing
                    ? "Publishing..."
                    : selectedRecordId
                    ? "Save Changes for Patient"
                    : "Publish to Patient"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default VisitRecords;