import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddIcon from "@mui/icons-material/Add";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { DataGrid } from "@mui/x-data-grid";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import api from "../services/api";
import dayjs from "dayjs";

const glassCardSx = {
  background: "rgba(255, 255, 255, 0.62)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const softPanelSx = {
  background: "rgba(255, 255, 255, 0.78)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  borderRadius: 4,
};

const tableSx = {
  border: "none",
  background: "transparent",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "rgba(248, 250, 252, 0.85)",
    color: "#334155",
    borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 700,
    fontSize: 14,
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid rgba(148, 163, 184, 0.10)",
    color: "#0f172a",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(248, 250, 252, 0.75)",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid rgba(148, 163, 184, 0.14)",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
};

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: dayjs(),
    status: "scheduled",
  });

  const loadAppointments = useCallback(() => {
    api.get("appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadPatients = useCallback(() => {
    api.get("patients/")
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadDoctors = useCallback(() => {
    api.get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDoctors();
  }, [loadAppointments, loadPatients, loadDoctors]);

  const handleCreate = () => {
    api.post("appointments/", {
      patient: form.patient,
      doctor: form.doctor,
      date: form.date.toISOString(),
      status: form.status,
    })
      .then(() => {
        setOpen(false);
        setForm({
          patient: "",
          doctor: "",
          date: dayjs(),
          status: "scheduled",
        });
        loadAppointments();
      })
      .catch((err) => console.error(err));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "confirmed":
        return "primary";
      case "cancelled":
        return "error";
      case "no_show":
        return "warning";
      case "scheduled":
        return "default";
      default:
        return "default";
    }
  };

  const filteredRows = useMemo(() => {
    return appointments.filter((item) => {
      const text =
        `${item.patient_name || ""} ${item.doctor_name || ""} ${item.status || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled").length;
  const scheduledAppointments = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length;

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "patient_name",
      headerName: "Patient",
      flex: 1.1,
      minWidth: 170,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, height: "100%" }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, rgba(15,118,110,0.14), rgba(37,99,235,0.12))",
              color: "#0f766e",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {params.value?.charAt(0)?.toUpperCase() || "P"}
          </Box>
          <Typography sx={{ fontWeight: 600 }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "doctor_name",
      headerName: "Doctor",
      flex: 1.1,
      minWidth: 170,
      renderCell: (params) => params.value || "—",
    },
    {
      field: "date",
      headerName: "Date & Time",
      flex: 1.2,
      minWidth: 190,
      renderCell: (params) => dayjs(params.value).format("DD MMM YYYY, HH:mm"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={String(params.value).replace("_", " ")}
          color={getStatusColor(params.value)}
          size="small"
          sx={{
            textTransform: "capitalize",
            fontWeight: 600,
          }}
        />
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 65%)",
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
              background: "radial-gradient(circle, rgba(15,118,110,0.16), transparent 65%)",
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
                Scheduling Center
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Appointments
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#475569",
                  maxWidth: 620,
                  lineHeight: 1.7,
                }}
              >
                Manage appointment flow, track statuses, and coordinate patient visits
                with a clean scheduling workspace.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: 3,
                boxShadow: "none",
                px: 2.2,
                py: 1.1,
              }}
            >
              New Appointment
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(15, 118, 110, 0.10)",
                    color: "#0f766e",
                  }}
                >
                  <EventAvailableOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total appointments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalAppointments}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(34, 197, 94, 0.10)",
                    color: "#16a34a",
                  }}
                >
                  <CheckCircleOutlineOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {completedAppointments}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(239, 68, 68, 0.10)",
                    color: "#dc2626",
                  }}
                >
                  <CancelOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {cancelledAppointments}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    color: "#d97706",
                  }}
                >
                  <ScheduleOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {scheduledAppointments}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <TextField
                fullWidth
                label="Search patient, doctor, or status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <TextField
                select
                fullWidth
                label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All statuses</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Grid>
        </Grid>

        <Paper
          sx={{
            ...softPanelSx,
            p: 0,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Appointment List
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Browse and manage patient bookings and visit statuses
            </Typography>
          </Box>

          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
              }}
              disableRowSelectionOnClick
              sx={tableSx}
            />
          </Box>
        </Paper>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.65)",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Create Appointment
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Schedule a new patient appointment in the clinic system
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Patient"
                  value={form.patient}
                  onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: "flex", color: "#64748b" }}>
                        <PersonOutlinedIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Doctor"
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: "flex", color: "#64748b" }}>
                        <LocalHospitalOutlinedIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} — {doctor.specialization}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <DateTimePicker
                  label="Appointment date and time"
                  value={form.date}
                  onChange={(newValue) =>
                    setForm({ ...form, date: newValue || dayjs() })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: 3,
                color: "#475569",
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                borderRadius: 3,
                px: 2.5,
                boxShadow: "none",
              }}
            >
              Save Appointment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Appointments;