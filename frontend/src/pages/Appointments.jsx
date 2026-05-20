import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
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
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GlassFormDialog from "../components/GlassFormDialog";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
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
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: dayjs(),
    status: "scheduled",
  });

  const loadAppointments = useCallback(() => {
    api
      .get("appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadPatients = useCallback(() => {
    api
      .get("patients/")
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadDoctors = useCallback(() => {
    api
      .get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDoctors();
  }, [loadAppointments, loadPatients, loadDoctors]);

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({
      patient: "",
      doctor: "",
      date: dayjs(),
      status: "scheduled",
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      patient: "",
      doctor: "",
      date: dayjs(),
      status: "scheduled",
    });
    setOpen(true);
  };

  const handleSave = () => {
    const payload = {
      patient_id: form.patient,
      odoctor_id: form.doctor,
      date: form.date.toISOString(),
      status: form.status,
    };

    const request = editingId
      ? api.put(`appointments/${editingId}/`, payload)
      : api.post("appointments/", payload);

    request
      .then(() => {
        handleClose();
        loadAppointments();
      })
      .catch((err) => console.error(err));
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      patient: row.patient,
      doctor: row.doctor,
      date: row.date ? dayjs(row.date) : dayjs(),
      status: row.status || "scheduled",
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Delete this appointment?");
    if (!confirmed) return;

    api
      .delete(`appointments/${id}/`)
      .then(() => loadAppointments())
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
        statusFilter === "all"
          ? true
          : statusFilter === "upcoming"
            ? item.status === "scheduled" || item.status === "confirmed"
            : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;
  const scheduledAppointments = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed",
  ).length;

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "patient_name",
      headerName: "Patient",
      flex: 1.1,
      minWidth: 170,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            height: "100%",
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
              background:
                "linear-gradient(135deg, rgba(15,118,110,0.14), rgba(37,99,235,0.12))",
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
      renderCell: (params) =>
        params.value ? dayjs(params.value).format("DD MMM YYYY, HH:mm") : "—",
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
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ color: "#2563eb" }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            sx={{ color: "#dc2626" }}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
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
                Manage appointment flow, track statuses, and coordinate patient
                visits with a clean scheduling workspace.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
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

        <Paper
          sx={{
            ...softPanelSx,
            mb: 3,
            overflow: "hidden",
            p: 0,
          }}
        >
          <Grid container>
            {[
              {
                key: "all",
                label: "Total appointments",
                value: totalAppointments,
                color: "#0f172a",
              },
              {
                key: "completed",
                label: "Completed",
                value: completedAppointments,
                color: "#16a34a",
              },
              {
                key: "cancelled",
                label: "Cancelled",
                value: cancelledAppointments,
                color: "#dc2626",
              },
              {
                key: "upcoming",
                label: "Upcoming",
                value: scheduledAppointments,
                color: "#d97706",
              },
            ].map((item, index) => {
              const isActive = statusFilter === item.key;

              return (
                <Grid item xs={12} md={3} key={item.key}>
                  <Box
                    onClick={() => setStatusFilter(item.key)}
                    sx={{
                      cursor: "pointer",
                      px: 3,
                      py: 3,
                      minHeight: 118,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      borderRight:
                        index !== 3
                          ? "1px solid rgba(148, 163, 184, 0.14)"
                          : "none",
                      backgroundColor: isActive
                        ? "rgba(248, 250, 252, 0.9)"
                        : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(248, 250, 252, 0.75)",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        mb: 1,
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 34,
                        lineHeight: 1,
                        fontWeight: 800,
                        color: item.color,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {item.value}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1.2,
                        color: isActive ? "#2563eb" : "#94a3b8",
                        fontWeight: 600,
                        letterSpacing: 0.2,
                      }}
                    >
                      {isActive ? "Active filter" : "Click to filter"}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        <Box sx={{ display: "grid", gap: 2, mb: 3 }}>
          <Paper sx={{ ...softPanelSx, p: 2.5 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 1.2,
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              Search
            </Typography>

            <TextField
              fullWidth
              placeholder="Search patient, doctor, or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={formFieldSx}
            />
          </Paper>

          <Paper sx={{ ...softPanelSx, p: 2.5 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 1.2,
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              Status filter
            </Typography>

            <TextField
              select
              fullWidth
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={formFieldSx}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Paper>
        </Box>
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

        <GlassFormDialog
          open={open}
          onClose={handleClose}
          title={editingId ? "Edit Appointment" : "Create Appointment"}
          subtitle={
            editingId
              ? "Update appointment details in the clinic system"
              : "Schedule a new patient appointment in the clinic system"
          }
          saveText={editingId ? "Update Appointment" : "Save Appointment"}
          onSave={handleSave}
        >
          <Box sx={{ display: "grid", gap: 2.2 }}>
            <TextField
              select
              fullWidth
              label="Patient"
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              sx={formFieldSx}
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Doctor"
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              sx={formFieldSx}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name} — {doctor.specialization}
                </MenuItem>
              ))}
            </TextField>

            <DateTimePicker
              label="Appointment date and time"
              value={form.date}
              onChange={(newValue) =>
                setForm({ ...form, date: newValue || dayjs() })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: formFieldSx,
                },
              }}
            />

            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              sx={formFieldSx}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </GlassFormDialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Appointments;
