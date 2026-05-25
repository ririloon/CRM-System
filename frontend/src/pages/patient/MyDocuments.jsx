import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
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

function normalizeDocument(item) {
  return {
    id: item.id,
    patient: item.patient,
    patient_name: item.patient_name || "Unknown patient",
    visit_record: item.visit_record,
    title: item.title || "Document",
    type: item.document_type || "Medical document",
    uploaded_at: item.uploaded_at || "",
    file_url: item.file || "#",
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

export default function MyDocuments() {
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [recordsRes, documentsRes] = await Promise.allSettled([
        api.get("visit-records/my/"),
        api.get("medical-documents/my/"),
      ]);

      const loadedRecords =
        recordsRes.status === "fulfilled" && Array.isArray(recordsRes.value?.data)
          ? recordsRes.value.data.map(normalizeVisitRecord)
          : [];

      const loadedDocuments =
        documentsRes.status === "fulfilled" && Array.isArray(documentsRes.value?.data)
          ? documentsRes.value.data.map(normalizeDocument)
          : [];

      setRecords(loadedRecords);
      setDocuments(loadedDocuments);

      if (!loadedRecords.length) {
        setSelectedRecordId(null);
      } else {
        setSelectedRecordId((prev) =>
          loadedRecords.some((r) => r.id === prev) ? prev : loadedRecords[0].id
        );
      }

      if (recordsRes.status === "rejected") {
        setPageError("Could not load visit records.");
      }
    } catch (error) {
      console.error(error);
      setPageError("Failed to load visit records.");
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

  const relatedDocuments = useMemo(() => {
    if (!selectedRecordId) return [];
    return documents.filter(
      (doc) => String(doc.visit_record) === String(selectedRecordId)
    );
  }, [documents, selectedRecordId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#0f766e" }} />
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
              Patient Portal
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              My Visit Records
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#475569",
                maxWidth: 820,
                lineHeight: 1.7,
              }}
            >
              Review your visit summaries, recommendations, prescriptions,
              attachments, and follow-up information from your care team.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadData}
            sx={{
              borderRadius: 3,
              px: 2.2,
              py: 1.1,
              bgcolor: "rgba(255,255,255,0.7)",
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {pageError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {pageError}
        </Alert>
      ) : null}

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
                Visit History
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Open any completed visit summary to review its details.
              </Typography>
            </Box>

            <Divider />

            {records.length ? (
              <List sx={{ p: 0, display: "grid", gap: 1 }}>
                {records.map((item) => (
                  <ListItemButton
                    key={item.id}
                    onClick={() => setSelectedRecordId(item.id)}
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
                            Visit #{item.id}
                          </Typography>
                          <Chip
                            label="Available"
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
                            {item.doctor_notes || "Visit summary"}
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
                ))}
              </List>
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
                  No visit records available yet.
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ ...softPanelSx, p: { xs: 2, md: 2.5 }, height: "100%" }}>
          {selectedRecord ? (
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
                  <Typography
                    sx={{ fontWeight: 800, color: "#0f172a", fontSize: 24 }}
                  >
                    Visit Summary
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", mt: 0.5 }}
                  >
                    Information shared by your doctor after the visit.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<AssignmentOutlinedIcon />}
                    label={`Record #${selectedRecord.id}`}
                    sx={{
                      backgroundColor: "rgba(37,99,235,0.08)",
                      color: "#1d4ed8",
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    icon={<TaskAltRoundedIcon />}
                    label="Visible to you"
                    sx={{
                      backgroundColor: "rgba(15,118,110,0.10)",
                      color: "#0f766e",
                      fontWeight: 700,
                    }}
                  />
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
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography sx={sectionTitleSx}>Visit details</Typography>
                </Stack>
                <Typography sx={sectionHintSx}>
                  Summary created on {formatDate(selectedRecord.created_at)}.
                </Typography>

                {selectedRecord.follow_up_date ? (
                  <Box
                    sx={{
                      mt: 1.5,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 3,
                      background: "rgba(37,99,235,0.05)",
                      border: "1px solid rgba(37,99,235,0.12)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                      Follow-up date
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: 13, mt: 0.35 }}>
                      {formatDate(selectedRecord.follow_up_date)}
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
                  Main summary from your doctor.
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: "#0f172a",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedRecord.doctor_notes || "No note provided."}
                </Typography>
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
                  Care plan, treatment advice, or next steps.
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: "#0f172a",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedRecord.treatment_plan || "No recommendation provided."}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.76)",
                  border: "1px solid rgba(148,163,184,0.16)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MedicationOutlinedIcon sx={{ fontSize: 18, color: "#0f766e" }} />
                  <Typography sx={sectionTitleSx}>Prescriptions</Typography>
                </Stack>
                <Typography sx={sectionHintSx}>
                  Medications added to this visit summary.
                </Typography>

                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                  {selectedRecord.prescriptions?.length ? (
                    selectedRecord.prescriptions.map((item, index) => (
                      <Box
                        key={item.id || index}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          border: "1px solid rgba(148,163,184,0.18)",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}
                        >
                          {item.medication_name || `Medication ${index + 1}`}
                        </Typography>

                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1.2}
                          sx={{ mt: 1, flexWrap: "wrap" }}
                        >
                          {item.dosage ? (
                            <Chip
                              label={`Dosage: ${item.dosage}`}
                              size="small"
                              sx={{ width: "fit-content" }}
                            />
                          ) : null}
                          {item.frequency ? (
                            <Chip
                              label={`Frequency: ${item.frequency}`}
                              size="small"
                              sx={{ width: "fit-content" }}
                            />
                          ) : null}
                          {item.duration ? (
                            <Chip
                              label={`Duration: ${item.duration}`}
                              size="small"
                              sx={{ width: "fit-content" }}
                            />
                          ) : null}
                        </Stack>

                        {item.instructions ? (
                          <Typography
                            sx={{ color: "#475569", fontSize: 13.5, mt: 1.2 }}
                          >
                            {item.instructions}
                          </Typography>
                        ) : null}
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ color: "#94a3b8", fontSize: 13.5 }}>
                      No prescriptions were added for this visit.
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <AttachFileOutlinedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                  <Typography sx={sectionTitleSx}>Attachments</Typography>
                </Stack>
                <Typography sx={sectionHintSx}>
                  Files shared with you for this visit.
                </Typography>

                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
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
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}
                        >
                          <Stack direction="row" spacing={1.1} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2.5,
                                display: "grid",
                                placeItems: "center",
                                background:
                                  "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.10))",
                                color: "#0f766e",
                              }}
                            >
                              <DescriptionOutlinedIcon fontSize="small" />
                            </Box>

                            <Box>
                              <Typography
                                sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}
                              >
                                {doc.title}
                              </Typography>
                              <Typography
                                sx={{ color: "#64748b", fontSize: 12.5, mt: 0.2 }}
                              >
                                {doc.type} • {formatDate(doc.uploaded_at)}
                              </Typography>
                            </Box>
                          </Stack>

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
                    <Typography sx={{ color: "#94a3b8", fontSize: 13.5 }}>
                      No attachments were shared for this visit.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Box
              sx={{
                minHeight: 420,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                px: 3,
              }}
            >
              <Box>
                <AssignmentOutlinedIcon
                  sx={{ fontSize: 40, color: "#cbd5e1", mb: 1.5 }}
                />
                <Typography sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  No visit selected
                </Typography>
                <Typography sx={{ color: "#cbd5e1", fontSize: 13, mt: 0.5 }}>
                  Choose a visit record from the left to view its summary
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}