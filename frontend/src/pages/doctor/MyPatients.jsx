import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import Grid from "@mui/material/Grid";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import api from "../../services/api";

function MyPatients() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [Doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [visitRecords, setVisitRecords] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [meRes, doctorsRes, appointmentsRes, visitRecordsRes] = await Promise.all([
          api.get("auth/me/"),
          api.get("doctors/"),
          api.get("appointments/"),
          api.get("visit-records/"),
        ]);

        const doctors = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
        const me = meRes.data || {};

        const currentDoctor =
          doctors.find((d) => d.user === me.id) ||
          doctors.find((d) => d.user?.id === me.id) ||
          doctors.find((d) => d.email && me.email && d.email === me.email) ||
          null;

        setDoctor(currentDoctor);

        const allAppointments = Array.isArray(appointmentsRes.data)
          ? appointmentsRes.data
          : [];
        const allVisitRecords = Array.isArray(visitRecordsRes.data)
          ? visitRecordsRes.data
          : [];

        if (!currentDoctor) {
          setAppointments([]);
          setVisitRecords([]);
          return;
        }

        const doctorAppointments = allAppointments.filter((a) => {
          const doctorId = a.doctor?.id ?? a.doctor;
          return Number(doctorId) === Number(currentDoctor.id);
        });

        const doctorVisitRecords = allVisitRecords.filter((r) => {
          const doctorId = r.doctor?.id ?? r.doctor;
          return Number(doctorId) === Number(currentDoctor.id);
        });

        setAppointments(doctorAppointments);
        setVisitRecords(doctorVisitRecords);
      } catch (err) {
        console.error(err);
        setError("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const patients = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;
      const patientId = patient?.id ?? patient;
      const key = String(patientId);

      if (!map.has(key)) {
        map.set(key, {
          id: patientId,
          name: patient?.name || `Patient #${patientId}`,
          phone: patient?.phone || "—",
          email: patient?.email || "—",
          gender: patient?.gender || "—",
          birth_date: patient?.birth_date || "—",
          appointmentsCount: 0,
          lastAppointment: appointment.date,
          completedVisits: 0,
        });
      }

      const existing = map.get(key);
      existing.appointmentsCount += 1;

      if (!existing.lastAppointment || new Date(appointment.date) > new Date(existing.lastAppointment)) {
        existing.lastAppointment = appointment.date;
      }
    });

    visitRecords.forEach((record) => {
      const patient = record.patient;
      const patientId = patient?.id ?? patient;
      const key = String(patientId);

      if (!map.has(key)) {
        map.set(key, {
          id: patientId,
          name: patient?.name || `Patient #${patientId}`,
          phone: patient?.phone || "—",
          email: patient?.email || "—",
          gender: patient?.gender || "—",
          birth_date: patient?.birth_date || "—",
          appointmentsCount: 0,
          lastAppointment: null,
          completedVisits: 0,
        });
      }

      const existing = map.get(key);
      existing.completedVisits += 1;
    });

    return [...map.values()]
      .filter((item) =>
        `${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments, visitRecords, query]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f8fafc", minHeight: "100vh" }}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography sx={{ fontSize: 30, fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            My Patients
          </Typography>
          <Typography sx={{ color: "#64748b" }}>
            Patients related to your appointments and visit records
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by patient name, phone, or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Paper>

        {patients.length === 0 ? (
          <Alert severity="info">No patients found for this doctor.</Alert>
        ) : (
          <Grid container spacing={2.2}>
            {patients.map((patient) => (
              <Grid key={patient.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Paper
                  sx={{
                    p: 2.3,
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#dbeafe", color: "#1d4ed8" }}>
                      <PersonOutlineRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {patient.name}
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                        {patient.phone}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography sx={{ color: "#475569", fontSize: 14 }}>
                      Email: {patient.email}
                    </Typography>
                    <Typography sx={{ color: "#475569", fontSize: 14 }}>
                      Gender: {patient.gender}
                    </Typography>
                    <Typography sx={{ color: "#475569", fontSize: 14 }}>
                      Birth date: {patient.birth_date}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                    <Chip label={`Appointments: ${patient.appointmentsCount}`} />
                    <Chip label={`Visits: ${patient.completedVisits}`} />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}

export default MyPatients;