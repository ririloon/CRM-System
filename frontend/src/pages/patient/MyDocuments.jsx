import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Grid from "@mui/material/Grid";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const panelSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const itemCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

function MyDocuments() {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("medical-documents/")
      .then((res) => {
        setDocuments(Array.isArray(res.data) ? res.data : []);
        setError("");
      })
      .catch((err) => {
        console.error("medical documents error:", err);
        setError(t("patientDocuments.errors.load", "Failed to load medical documents."));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const metrics = useMemo(() => {
    return {
      total: documents.length,
      withFiles: documents.filter((doc) => Boolean(doc.file)).length,
      withVisits: documents.filter((doc) => Boolean(doc.visit_record)).length,
    };
  }, [documents]);

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString(
        i18n.language === "ky" ? "ky-KG" : i18n.language === "en" ? "en-US" : "ru-RU",
        {
          dateStyle: "medium",
        }
      );
    } catch {
      return value;
    }
  };

  const openFile = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
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
      <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
        <Paper sx={{ ...panelSx, p: 3 }}>
          <Typography sx={{ color: "#b91c1c", fontWeight: 600 }}>
            {error}
          </Typography>
        </Paper>
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
          {t("patientDocuments.eyebrow", "Patient documents")}
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
          {t("patientDocuments.title", "My documents")}
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
            "patientDocuments.subtitle",
            "Review files and medical documents that are available for your patient account."
          )}
        </Typography>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ ...panelSx, p: 2.25 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientDocuments.metrics.total", "Total documents")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ ...panelSx, p: 2.25 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientDocuments.metrics.files", "Available files")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.withFiles}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ ...panelSx, p: 2.25 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
              {t("patientDocuments.metrics.visitLinked", "Linked to visits")}
            </Typography>
            <Typography sx={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
              {metrics.withVisits}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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
            <DescriptionOutlinedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
              {t("patientDocuments.listTitle", "Document list")}
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: 14 }}>
              {t(
                "patientDocuments.listSubtitle",
                "Browse uploaded documents and open available files."
              )}
            </Typography>
          </Box>
        </Stack>

        {documents.length === 0 ? (
          <Alert severity="info">
            {t("patientDocuments.empty", "No medical documents are available yet.")}
          </Alert>
        ) : (
          <Stack spacing={1.5}>
            {documents.map((doc) => (
              <Box key={doc.id} sx={{ ...itemCardSx, p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          minWidth: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "12px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                        }}
                      >
                        <InsertDriveFileOutlinedIcon fontSize="small" />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                          {doc.title || t("patientDocuments.fallbacks.untitled", "Untitled document")}
                        </Typography>

                        <Typography sx={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                          {doc.description ||
                            t(
                              "patientDocuments.fallbacks.noDescription",
                              "No document description provided."
                            )}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      {doc.file && (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => openFile(doc.file)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: "12px",
                              borderColor: "#cbd5e1",
                              color: "#0f172a",
                              backgroundColor: "#fff",
                            }}
                          >
                            {t("patientDocuments.actions.view", "View")}
                          </Button>

                          <Button
                            variant="contained"
                            startIcon={<CloudDownloadOutlinedIcon />}
                            component="a"
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: "12px",
                              boxShadow: "none",
                            }}
                          >
                            {t("patientDocuments.actions.download", "Download")}
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ ...panelSx, p: 1.5, boxShadow: "none" }}>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
                          {t("patientDocuments.fields.date", "Upload date")}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                          {formatDate(doc.created_at || doc.date_created || doc.uploaded_at)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ ...panelSx, p: 1.5, boxShadow: "none" }}>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
                          {t("patientDocuments.fields.type", "Document type")}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                          {doc.document_type || doc.type || "—"}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ ...panelSx, p: 1.5, boxShadow: "none" }}>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
                          {t("patientDocuments.fields.visitLink", "Visit record")}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                          {doc.visit_record || "—"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

export default MyDocuments;