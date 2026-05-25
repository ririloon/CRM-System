import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "../../services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const PALETTES = [
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#dcfce7", color: "#166534" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#ccfbf1", color: "#0f766e" },
];

const palette = (id) => PALETTES[Number(id) % PALETTES.length];

const STATUS = {
  confirmed: { bg: "#dcfce7", color: "#166534", label: "Confirmed" },
  scheduled: { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled" },
  completed: { bg: "#ede9fe", color: "#6d28d9", label: "Completed" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
  no_show: { bg: "#f1f5f9", color: "#475569", label: "No show" },
};

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
];

const fmt = (d) =>
  d
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(d))
    : "—";

// ─── small UI atoms ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={0.7}>{children}</Stack>
    </Box>
  );
}

function Row({ icon, label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={1}
    >
      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
        {icon && (
          <Box sx={{ color: "#94a3b8", display: "flex", flexShrink: 0 }}>{icon}</Box>
        )}
        <Typography sx={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#0f172a",
          textAlign: "right",
          wordBreak: "break-word",
          maxWidth: "60%",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

// ─── expanded patient panel ───────────────────────────────────────────────────

function PatientDetail({ patientId, appointments, onStatusUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const appt = appointments[0];
    if (!appt) {
      setLoading(false);
      return;
    }

    api
      .get(`appointments/${appt.id}/`)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, appointments]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setStatusError("");
    setStatusSavingId(appointmentId);

    try {
      await api.patch(`appointments/${appointmentId}/`, { status: newStatus });
      onStatusUpdated?.(appointmentId, newStatus);
    } catch (error) {
      console.error(error);
      setStatusError("Failed to update appointment status.");
    } finally {
      setStatusSavingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 3, display: "grid", placeItems: "center" }}>
        <CircularProgress size={22} sx={{ color: "#0f766e" }} />
      </Box>
    );
  }

  const p = data?.patient;

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 2.5, pt: 0.5 }}>
      <Divider sx={{ mb: 2.5, borderColor: "#f1f5f9" }} />

      {statusError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statusError}
        </Alert>
      ) : null}

      <Stack spacing={2.5} direction={{ xs: "column", md: "row" }}>
        {/* ── Left: personal + contact + medical ── */}
        <Stack spacing={2.5} sx={{ flex: 1 }}>
          <Section title="Personal information">
            <Row label="Full name" value={p?.name} />
            <Row label="Date of birth" value={fmt(p?.birth_date)} />
            <Row label="Gender" value={p?.gender} />
          </Section>

          <Section title="Contact">
            <Row
              icon={<PhoneRoundedIcon sx={{ fontSize: 14 }} />}
              label="Phone"
              value={p?.phone}
            />
            <Row
              icon={<EmailRoundedIcon sx={{ fontSize: 14 }} />}
              label="Email"
              value={p?.email}
            />
            <Row
              icon={<HomeRoundedIcon sx={{ fontSize: 14 }} />}
              label="Address"
              value={p?.address}
            />
          </Section>

          <Section title="Medical">
            <Row
              icon={<LocalHospitalRoundedIcon sx={{ fontSize: 14 }} />}
              label="Allergies"
              value={p?.allergies}
            />
            <Row label="Chronic conditions" value={p?.chronic_conditions} />
            <Row label="Notes" value={p?.notes} />
          </Section>

          {(p?.emergency_contact_name || p?.emergency_contact_phone) && (
            <Section title="Emergency contact">
              <Row label="Name" value={p.emergency_contact_name} />
              <Row label="Phone" value={p.emergency_contact_phone} />
            </Section>
          )}
        </Stack>

        {/* ── Right: appointments timeline ── */}
        <Box sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              mb: 1.2,
            }}
          >
            Appointments
          </Typography>

          <Stack spacing={1}>
            {appointments.map((a) => {
              const s = STATUS[a.status] || STATUS.scheduled;
              const isSaving = statusSavingId === a.id;

              return (
                <Box
                  key={a.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#fafcff",
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.2 }}
                    >
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <CalendarTodayRoundedIcon
                          sx={{ fontSize: 13, color: "#94a3b8" }}
                        />
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                        >
                          {fmt(a.date)}
                        </Typography>
                      </Stack>

                      <Chip
                        size="small"
                        label={s.label}
                        sx={{
                          bgcolor: s.bg,
                          color: s.color,
                          fontWeight: 700,
                          fontSize: 11,
                          borderRadius: 999,
                          height: 20,
                        }}
                      />
                    </Stack>

                    {a.complaint ? (
                      <Typography sx={{ fontSize: 12.5, color: "#475569" }}>
                        {a.complaint}
                      </Typography>
                    ) : null}

                    <TextField
                      select
                      size="small"
                      label="Status"
                      value={a.status || "scheduled"}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      disabled={isSaving}
                      fullWidth
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2.5,
                          bgcolor: "#fff",
                          fontSize: 13,
                        },
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function MyPatients() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await api.get("appointments/my/");
      setAppointments(Array.isArray(r.data) ? r.data : []);
    } catch {
      setError("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusUpdated = (appointmentId, newStatus) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId ? { ...item, status: newStatus } : item
      )
    );
  };

  const patients = useMemo(() => {
    const map = new Map();

    appointments.forEach((a) => {
      const id = String(a.patient);
      const name = a.patient_name || `Patient #${a.patient}`;

      if (!map.has(id)) {
        map.set(id, {
          id,
          name,
          appointments: [],
          lastDate: null,
          statuses: {},
        });
      }

      const p = map.get(id);
      p.appointments.push(a);
      p.statuses[a.status] = (p.statuses[a.status] || 0) + 1;

      if (!p.lastDate || new Date(a.date) > new Date(p.lastDate)) {
        p.lastDate = a.date;
      }
    });

    return [...map.values()]
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
  }, [appointments, query]);

  const uniqueCount = useMemo(
    () => new Set(appointments.map((a) => String(a.patient))).size,
    [appointments]
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#0f766e" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f1f5f9", minHeight: "100vh" }}>
      <Stack spacing={2.5}>
        {error && (
          <Alert
            severity="error"
            action={
              <Button
                size="small"
                onClick={load}
                startIcon={<RefreshRoundedIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* ── Header in Clinical Workspace style ── */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.24)",
            background:
              "linear-gradient(135deg, #0f766e 0%, #0f172a 58%, #2563eb 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.16)",
            position: "relative",
            overflow: "hidden",
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
              background: "rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 80,
              bottom: -60,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
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
                  color: "rgba(255,255,255,0.76)",
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
                  color: "#fff",
                }}
              >
                My Patients
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "rgba(255,255,255,0.78)",
                  maxWidth: 760,
                  lineHeight: 1.7,
                }}
              >
                Review your patient list, open full patient details, and update
                appointment statuses from one clean clinical workspace.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.2}>
              <Box
                sx={{
                  minWidth: 110,
                  px: 2.1,
                  py: 1.3,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography
                  sx={{ fontWeight: 800, color: "#fff", fontSize: 22, lineHeight: 1 }}
                >
                  {uniqueCount}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, mt: 0.4 }}
                >
                  patients
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: 120,
                  px: 2.1,
                  py: 1.3,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography
                  sx={{ fontWeight: 800, color: "#fff", fontSize: 22, lineHeight: 1 }}
                >
                  {appointments.length}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, mt: 0.4 }}
                >
                  appointments
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* ── Search ── */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search patients by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 380,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "#fff",
              fontSize: 14,
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#cbd5e1" },
              "&.Mui-focused fieldset": {
                borderColor: "#0f766e",
                borderWidth: 1.5,
              },
            },
          }}
        />

        {/* ── Empty state ── */}
        {patients.length === 0 ? (
          <Paper
            sx={{
              py: 8,
              textAlign: "center",
              borderRadius: 4,
              border: "1px dashed #cbd5e1",
              bgcolor: "#f8fafc",
              boxShadow: "none",
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 38, color: "#cbd5e1", mb: 1.5 }} />
            <Typography sx={{ color: "#94a3b8", fontWeight: 600 }}>
              {query ? "No patients match your search" : "No patients yet"}
            </Typography>
            <Typography sx={{ color: "#cbd5e1", fontSize: 13, mt: 0.5 }}>
              Patients will appear once appointments are linked to your account
            </Typography>
          </Paper>
        ) : (
          <Paper
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
              overflow: "hidden",
            }}
          >
            {patients.map((patient, idx) => {
              const pal = palette(patient.id);
              const isOpen = expanded === patient.id;
              const upcoming =
                (patient.statuses.scheduled || 0) + (patient.statuses.confirmed || 0);
              const statKeys = Object.entries(patient.statuses).filter(([, v]) => v > 0);

              return (
                <Box key={patient.id}>
                  {idx > 0 && <Divider sx={{ borderColor: "#f1f5f9" }} />}

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    onClick={() => setExpanded(isOpen ? null : patient.id)}
                    sx={{
                      px: { xs: 2, md: 2.5 },
                      py: 1.8,
                      cursor: "pointer",
                      bgcolor: isOpen ? "#f8fafc" : "transparent",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        flexShrink: 0,
                        bgcolor: pal.bg,
                        color: pal.color,
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: 0.4,
                      }}
                    >
                      {getInitials(patient.name)}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: 14.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {patient.name}
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: 12.5 }}>
                        Last visit: {fmt(patient.lastDate)}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={0.6}
                      sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap" }}
                    >
                      {statKeys.map(([s, cnt]) => {
                        const st = STATUS[s] || { bg: "#f1f5f9", color: "#475569", label: s };
                        return (
                          <Chip
                            key={s}
                            size="small"
                            label={`${cnt} ${st.label.toLowerCase()}`}
                            sx={{
                              bgcolor: st.bg,
                              color: st.color,
                              fontWeight: 700,
                              fontSize: 11.5,
                              borderRadius: 999,
                              height: 22,
                            }}
                          />
                        );
                      })}
                    </Stack>

                    {upcoming > 0 && (
                      <Chip
                        size="small"
                        label={`${upcoming} upcoming`}
                        sx={{
                          bgcolor: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 700,
                          fontSize: 11.5,
                          borderRadius: 999,
                          height: 22,
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <Box sx={{ color: "#94a3b8", display: "flex", flexShrink: 0 }}>
                      {isOpen ? (
                        <KeyboardArrowUpRoundedIcon />
                      ) : (
                        <KeyboardArrowDownRoundedIcon />
                      )}
                    </Box>
                  </Stack>

                  <Collapse in={isOpen} unmountOnExit>
                    <PatientDetail
                      patientId={patient.id}
                      appointments={patient.appointments}
                      onStatusUpdated={handleStatusUpdated}
                    />
                  </Collapse>
                </Box>
              );
            })}
          </Paper>
        )}
      </Stack>
    </Box>
  );
}