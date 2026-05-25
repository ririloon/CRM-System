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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
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

const statusColorMap = {
  scheduled: "default",
  completed: "success",
  cancelled: "error",
  in_progress: "warning",
};

const emptyVisitForm = {
  patient: "",
  appointment: "",
  visit_date: "",
  visit_type: "follow_up",
  chief_complaint: "",
  symptoms: "",
  diagnosis: "",
  treatment_plan: "",
  notes: "",
  follow_up_date: "",
  status: "completed",
};

const emptyPrescription = {
  medication_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const mockVisits = [
  {
    id: 1,
    patient: 12,
    patient_name: "Aizada Toktosunova",
    appointment: 31,
    visit_date: "2026-05-25",
    visit_type: "consultation",
    chief_complaint: "Recurring headaches and fatigue",
    symptoms: "Headache, low energy, dizziness",
    diagnosis: "Migraine, needs observation",
    treatment_plan: "Hydration, rest, migraine diary, follow-up in 7 days",
    notes: "Patient reports symptoms worsen in the evening.",
    follow_up_date: "2026-06-01",
    status: "completed",
    prescriptions: [
      {
        id: 101,
        medication_name: "Ibuprofen",
        dosage: "200 mg",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "After meals",
      },
    ],
  },
  {
    id: 2,
    patient: 18,
    patient_name: "Eliza Amanova",
    appointment: 32,
    visit_date: "2026-05-25",
    visit_type: "online",
    chief_complaint: "Follow-up for blood pressure",
    symptoms: "Stable, mild dizziness in mornings",
    diagnosis: "Hypertension, controlled",
    treatment_plan: "Continue current therapy, monitor BP at home",
    notes: "Discussed medication adherence.",
    follow_up_date: "2026-06-08",
    status: "in_progress",
    prescriptions: [],
  },
];

const mockDocuments = [
  {
    id: 1,
    patient: 12,
    title: "CBC Results",
    type: "Lab result",
    uploaded_at: "2026-05-20",
    file_url: "#",
  },
  {
    id: 2,
    patient: 18,
    title: "Blood Pressure Log",
    type: "Patient report",
    uploaded_at: "2026-05-22",
    file_url: "#",
  },
];

function VisitRecords() {
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const [form, setForm] = useState(emptyVisitForm);
  const [prescriptions, setPrescriptions] = useState([emptyPrescription]);

  const [search, setSearch] = useState("");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const normalizeRecord = (item) => ({
    id: item.id,
    patient: item.patient ?? item.patient_id ?? "",
    patient_name:
      item.patient_name ||
      item.patient_full_name ||
      item.patient_display ||
      "Unknown patient",
    appointment: item.appointment ?? item.appointment_id ?? "",
    visit_date: item.visit_date || item.date || "",
    visit_type: item.visit_type || "follow_up",
    chief_complaint: item.chief_complaint || "",
    symptoms: item.symptoms || "",
    diagnosis: item.diagnosis || "",
    treatment_plan: item.treatment_plan || "",
    notes: item.notes || "",
    follow_up_date: item.follow_up_date || "",
    status: item.status || "completed",
    prescriptions: Array.isArray(item.prescriptions) ? item.prescriptions : [],
  });

  const normalizeDocument = (item) => ({
    id: item.id,
    patient: item.patient ?? item.patient_id ?? "",
    title: item.title || item.name || "Document",
    type: item.type || item.document_type || "Medical document",
    uploaded_at: item.uploaded_at || item.created_at || "",
    file_url: item.file_url || item.file || "#",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [recordsRes, documentsRes] = await Promise.allSettled([
        api.get("doctor/visit-records/"),
        api.get("doctor/documents/"),
      ]);

      let loadedRecords = [];
      let loadedDocuments = [];

      if (
        recordsRes.status === "fulfilled" &&
        Array.isArray(recordsRes.value?.data)
      ) {
        loadedRecords = recordsRes.value.data.map(normalizeRecord);
      } else {
        loadedRecords = mockVisits;
      }

      if (
        documentsRes.status === "fulfilled" &&
        Array.isArray(documentsRes.value?.data)
      ) {
        loadedDocuments = documentsRes.value.data.map(normalizeDocument);
      } else {
        loadedDocuments = mockDocuments;
      }

      setRecords(loadedRecords);
      setDocuments(loadedDocuments);

      if (loadedRecords.length > 0) {
        const first = loadedRecords[0];
        setSelectedRecordId(first.id);
        setForm({
          patient: first.patient || "",
          appointment: first.appointment || "",
          visit_date: first.visit_date || "",
          visit_type: first.visit_type || "follow_up",
          chief_complaint: first.chief_complaint || "",
          symptoms: first.symptoms || "",
          diagnosis: first.diagnosis || "",
          treatment_plan: first.treatment_plan || "",
          notes: first.notes || "",
          follow_up_date: first.follow_up_date || "",
          status: first.status || "completed",
        });
        setPrescriptions(
          first.prescriptions?.length
            ? first.prescriptions.map((p) => ({
                id: p.id,
                medication_name: p.medication_name || "",
                dosage: p.dosage || "",
                frequency: p.frequency || "",
                duration: p.duration || "",
                instructions: p.instructions || "",
              }))
            : [emptyPrescription]
        );
      } else {
        handleCreateNewRecord();
      }
    } catch (error) {
      console.error(error);
      setPageError("Failed to load clinical records.");
      setRecords(mockVisits);
      setDocuments(mockDocuments);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const text = `${item.patient_name || ""} ${item.diagnosis || ""} ${item.chief_complaint || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesType =
        visitTypeFilter === "all" ? true : item.visit_type === visitTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [records, search, visitTypeFilter]);

  const selectedRecord = useMemo(() => {
    return records.find((item) => item.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  const relatedDocuments = useMemo(() => {
    const patientId = form.patient || selectedRecord?.patient;
    return documents.filter((doc) => String(doc.patient) === String(patientId));
  }, [documents, form.patient, selectedRecord]);

  const handleSelectRecord = (record) => {
    setSelectedRecordId(record.id);
    setSaveError("");
    setSaveSuccess("");
    setForm({
      patient: record.patient || "",
      appointment: record.appointment || "",
      visit_date: record.visit_date || "",
      visit_type: record.visit_type || "follow_up",
      chief_complaint: record.chief_complaint || "",
      symptoms: record.symptoms || "",
      diagnosis: record.diagnosis || "",
      treatment_plan: record.treatment_plan || "",
      notes: record.notes || "",
      follow_up_date: record.follow_up_date || "",
      status: record.status || "completed",
    });
    setPrescriptions(
      record.prescriptions?.length
        ? record.prescriptions.map((p) => ({
            id: p.id,
            medication_name: p.medication_name || "",
            dosage: p.dosage || "",
            frequency: p.frequency || "",
            duration: p.duration || "",
            instructions: p.instructions || "",
          }))
        : [emptyPrescription]
    );
  };

  const handleCreateNewRecord = () => {
    setSelectedRecordId(null);
    setSaveError("");
    setSaveSuccess("");
    setForm({
      ...emptyVisitForm,
      visit_date: new Date().toISOString().slice(0, 10),
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

  const handleSaveRecord = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (!form.patient && !selectedRecord?.patient) {
      setSaveError("Patient is required for a visit record.");
      return;
    }

    if (!form.visit_date) {
      setSaveError("Visit date is required.");
      return;
    }

    if (!form.chief_complaint.trim()) {
      setSaveError("Chief complaint is required.");
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
      patient: form.patient || selectedRecord?.patient,
      appointment: form.appointment || selectedRecord?.appointment || null,
      visit_date: form.visit_date,
      visit_type: form.visit_type,
      chief_complaint: form.chief_complaint,
      symptoms: form.symptoms,
      diagnosis: form.diagnosis,
      treatment_plan: form.treatment_plan,
      notes: form.notes,
      follow_up_date: form.follow_up_date || null,
      status: form.status,
      prescriptions: cleanedPrescriptions,
    };

    setSaving(true);

    try {
      if (selectedRecordId) {
        await api.put(`doctor/visit-records/${selectedRecordId}/`, payload);
        setSaveSuccess("Visit record updated successfully.");
      } else {
        await api.post("doctor/visit-records/", payload);
        setSaveSuccess("Visit record created successfully.");
      }
      await loadData();
    } catch (error) {
      console.error(error);

      // fallback for MVP when backend not ready
      if (selectedRecordId) {
        setRecords((prev) =>
          prev.map((item) =>
            item.id === selectedRecordId
              ? {
                  ...item,
                  ...payload,
                  patient_name: item.patient_name || "Patient",
                  prescriptions: cleanedPrescriptions,
                }
              : item
          )
        );
        setSaveSuccess("Visit record updated locally (backend endpoint not ready).");
      } else {
        const localId = Date.now();
        const newRecord = {
          id: localId,
          ...payload,
          patient_name: selectedRecord?.patient_name || `Patient #${payload.patient}`,
        };
        setRecords((prev) => [newRecord, ...prev]);
        setSelectedRecordId(localId);
        setSaveSuccess("Visit record saved locally (backend endpoint not ready).");
      }
    } finally {
      setSaving(false);
    }
  };

  const totalRecords = records.length;
  const completedRecords = records.filter((item) => item.status === "completed").length;
  const inProgressRecords = records.filter((item) => item.status === "in_progress").length;
  const totalDocuments = documents.length;

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
              Visit Records
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#475569",
                maxWidth: 800,
                lineHeight: 1.7,
              }}
            >
              Review patient visits, write clinical notes, record diagnoses, add prescriptions,
              and review supporting medical documents in one workflow-friendly workspace.
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
            New Visit Record
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            lg: "320px 1fr 360px",
          },
          alignItems: "start",
        }}
      >
        <Paper sx={{ ...softPanelSx, p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                Visit List
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Select a patient visit to review or update the clinical record.
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gap: 1.5 }}>
              <TextField
                placeholder="Search patient or diagnosis"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                sx={formFieldSx}
              />

              <TextField
                select
                label="Visit type"
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
                fullWidth
                sx={formFieldSx}
              >
                <MenuItem value="all">All visit types</MenuItem>
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="follow_up">Follow-up</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </TextField>
            </Box>

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
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                              {item.patient_name}
                            </Typography>
                            <Chip
                              label={item.status.replace("_", " ")}
                              size="small"
                              color={statusColorMap[item.status] || "default"}
                              sx={{ textTransform: "capitalize", fontWeight: 600 }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography sx={{ color: "#475569", fontSize: 13 }}>
                              {item.chief_complaint || "No complaint recorded"}
                            </Typography>
                            <Typography
                              sx={{ color: "#94a3b8", fontSize: 12, mt: 0.6 }}
                            >
                              {item.visit_date || "No date"} • {item.visit_type || "Visit"}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))
                ) : (
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    No visit records found.
                  </Typography>
                )}
              </List>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ ...softPanelSx, p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2.2}>
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
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 22 }}>
                  Clinical Record
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Document patient complaints, diagnosis, treatment plan, and follow-up instructions.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<AssignmentOutlinedIcon />}
                  label={selectedRecordId ? `Record #${selectedRecordId}` : "New record"}
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
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <TextField
                label="Patient ID"
                value={form.patient}
                onChange={(e) => handleChangeForm("patient", e.target.value)}
                fullWidth
                sx={formFieldSx}
              />

              <TextField
                label="Appointment ID"
                value={form.appointment}
                onChange={(e) => handleChangeForm("appointment", e.target.value)}
                fullWidth
                sx={formFieldSx}
              />

              <TextField
                label="Visit date"
                type="date"
                value={form.visit_date}
                onChange={(e) => handleChangeForm("visit_date", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={formFieldSx}
              />

              <TextField
                select
                label="Visit type"
                value={form.visit_type}
                onChange={(e) => handleChangeForm("visit_type", e.target.value)}
                fullWidth
                sx={formFieldSx}
              >
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="follow_up">Follow-up</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </TextField>

              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(e) => handleChangeForm("status", e.target.value)}
                fullWidth
                sx={formFieldSx}
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>

              <TextField
                label="Follow-up date"
                type="date"
                value={form.follow_up_date}
                onChange={(e) => handleChangeForm("follow_up_date", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={formFieldSx}
              />
            </Box>

            <TextField
              label="Chief complaint"
              value={form.chief_complaint}
              onChange={(e) => handleChangeForm("chief_complaint", e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={formFieldSx}
            />

            <TextField
              label="Symptoms"
              value={form.symptoms}
              onChange={(e) => handleChangeForm("symptoms", e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={formFieldSx}
            />

            <TextField
              label="Diagnosis"
              value={form.diagnosis}
              onChange={(e) => handleChangeForm("diagnosis", e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={formFieldSx}
            />

            <TextField
              label="Treatment plan"
              value={form.treatment_plan}
              onChange={(e) => handleChangeForm("treatment_plan", e.target.value)}
              fullWidth
              multiline
              minRows={3}
              sx={formFieldSx}
            />

            <TextField
              label="Clinical notes"
              value={form.notes}
              onChange={(e) => handleChangeForm("notes", e.target.value)}
              fullWidth
              multiline
              minRows={4}
              sx={formFieldSx}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSaveRecord}
                disabled={saving}
                sx={{
                  borderRadius: 3,
                  boxShadow: "none",
                  px: 2.5,
                  py: 1.15,
                }}
              >
                {saving ? "Saving..." : selectedRecordId ? "Update Record" : "Save Record"}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={2}>
          <Paper sx={{ ...softPanelSx, p: 2 }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Prescriptions
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                    Add medications and usage instructions for this visit.
                  </Typography>
                </Box>

                <Button
                  size="small"
                  startIcon={<AddOutlinedIcon />}
                  onClick={handleAddPrescription}
                  sx={{ borderRadius: 999 }}
                >
                  Add
                </Button>
              </Box>

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
                        gridTemplateColumns: "1fr 1fr",
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
          </Paper>

          <Paper sx={{ ...softPanelSx, p: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Documents
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Read-only medical documents linked to the selected patient.
                </Typography>
              </Box>

              {relatedDocuments.length ? (
                relatedDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid rgba(148,163,184,0.18)",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.10))",
                          color: "#0f766e",
                          flexShrink: 0,
                        }}
                      >
                        <DescriptionOutlinedIcon fontSize="small" />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {doc.title}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.4 }}>
                          {doc.type}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.4 }}>
                          Uploaded: {doc.uploaded_at || "Unknown date"}
                        </Typography>
                      </Box>

                      <IconButton
                        component="a"
                        href={doc.file_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ color: "#2563eb" }}
                      >
                        <DownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
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
                    No medical documents available for the selected patient.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ ...softPanelSx, p: 2 }}>
            <GridStats
              totalRecords={totalRecords}
              completedRecords={completedRecords}
              inProgressRecords={inProgressRecords}
              totalDocuments={totalDocuments}
            />
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}

function GridStats({
  totalRecords,
  completedRecords,
  inProgressRecords,
  totalDocuments,
}) {
  const cards = [
    {
      label: "Total records",
      value: totalRecords,
      color: "#0f172a",
      icon: <AssignmentOutlinedIcon fontSize="small" />,
    },
    {
      label: "Completed",
      value: completedRecords,
      color: "#16a34a",
      icon: <LocalHospitalOutlinedIcon fontSize="small" />,
    },
    {
      label: "In progress",
      value: inProgressRecords,
      color: "#d97706",
      icon: <MedicationOutlinedIcon fontSize="small" />,
    },
    {
      label: "Documents",
      value: totalDocuments,
      color: "#2563eb",
      icon: <DescriptionOutlinedIcon fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.2,
        gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
      }}
    >
      {cards.map((item) => (
        <Box
          key={item.label}
          sx={{
            p: 1.5,
            borderRadius: 3,
            backgroundColor: "#fff",
            border: "1px solid rgba(148,163,184,0.18)",
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
              backgroundColor: "rgba(248, 250, 252, 0.92)",
              color: item.color,
            }}
          >
            {item.icon}
          </Box>

          <Typography sx={{ color: "#64748b", fontSize: 13, mb: 0.4 }}>
            {item.label}
          </Typography>
          <Typography sx={{ fontWeight: 800, color: item.color, fontSize: 24 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default VisitRecords;