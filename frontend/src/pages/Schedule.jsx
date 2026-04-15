import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddIcon from "@mui/icons-material/Add";
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

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const statusColors = {
  scheduled: { bg: "rgba(15,118,110,0.10)", color: "#0f766e" },
  confirmed: { bg: "rgba(37,99,235,0.10)", color: "#2563eb" },
  completed: { bg: "rgba(34,197,94,0.10)", color: "#16a34a" },
  cancelled: { bg: "rgba(239,68,68,0.10)", color: "#dc2626" },
  no_show: { bg: "rgba(245,158,11,0.14)", color: "#d97706" },
};

function Schedule() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("all");

  const [weekStart, setWeekStart] = useState(
    dayjs().startOf("week").add(1, "day") // понедельник
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    patient: "",
    doctor: "",
    date: dayjs(),
    status: "scheduled",
  });
  const [patients, setPatients] = useState([]);

  const loadAppointments = useCallback(() => {
    api
      .get("appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadDoctors = useCallback(() => {
    api
      .get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadPatients = useCallback(() => {
    api
      .get("patients/")
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadAppointments();
    loadDoctors();
    loadPatients();
  }, [loadAppointments, loadDoctors, loadPatients]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = weekStart.add(index, "day");
      return {
        label: date.format("dd"),
        dayNumber: date.format("DD"),
        isToday: date.isSame(dayjs(), "day"),
        date,
      };
    });
  }, [weekStart]);

  const scheduleMap = useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      const d = dayjs(appt.date);
      const dayKey = d.format("YYYY-MM-DD");
      const timeKey = d.format("HH:mm");

      if (selectedDoctor !== "all" && appt.doctor !== selectedDoctor) {
        return;
      }

      if (!map[dayKey]) map[dayKey] = {};
      map[dayKey][timeKey] = appt;
    });
    return map;
  }, [appointments, selectedDoctor]);

  const handleCreateFromSlot = (slotDate) => {
    setCreateForm((prev) => ({
      ...prev,
      date: slotDate,
      doctor: selectedDoctor !== "all" ? selectedDoctor : "",
    }));
    setCreateOpen(true);
  };

  const handleCreateSubmit = () => {
    api
      .post("appointments/", {
        patient: createForm.patient,
        doctor: createForm.doctor,
        date: createForm.date.toISOString(),
        status: createForm.status,
      })
      .then(() => {
        setCreateOpen(false);
        setCreateForm({
          patient: "",
          doctor: "",
          date: dayjs(),
          status: "scheduled",
        });
        loadAppointments();
      })
      .catch((err) => console.error(err));
  };

  const totalWeekAppointments = appointments.filter((appt) =>
    dayjs(appt.date).isBetween(
      weekStart.startOf("day"),
      weekStart.add(7, "day").endOf("day"),
      null,
      "[]"
    )
  ).length;

  const totalDoctorAppointments =
    selectedDoctor === "all"
      ? totalWeekAppointments
      : appointments.filter(
          (appt) =>
            appt.doctor === selectedDoctor &&
            dayjs(appt.date).isBetween(
              weekStart.startOf("day"),
              weekStart.add(7, "day").endOf("day"),
              null,
              "[]"
            )
        ).length;

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
        {/* Hero */}
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
                Weekly Schedule
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Clinic Calendar
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#475569",
                  maxWidth: 620,
                  lineHeight: 1.7,
                }}
              >
                Visualize doctor availability and quickly create appointments
                directly from the weekly grid.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
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

        {/* Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
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
                    backgroundColor: "rgba(37, 99, 235, 0.10)",
                    color: "#2563eb",
                  }}
                >
                  <LocalHospitalOutlinedIcon fontSize="small" />
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body2" color="text.secondary">
                    Doctor
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <MenuItem value="all">All doctors</MenuItem>
                    {doctors.map((doc) => (
                      <MenuItem key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialization}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ ...softPanelSx, p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Week
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setWeekStart((prev) => prev.subtract(7, "day"))}
                  sx={{ borderRadius: 3 }}
                >
                  Prev
                </Button>
                <Typography sx={{ fontWeight: 600 }}>
                  {weekStart.format("DD MMM")} –{" "}
                  {weekStart.add(6, "day").format("DD MMM YYYY")}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setWeekStart((prev) => prev.add(7, "day"))}
                  sx={{ borderRadius: 3 }}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
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
                    Appointments this week
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalWeekAppointments}
                    {selectedDoctor !== "all" && (
                      <Typography
                        component="span"
                        sx={{ fontSize: 13, color: "#64748b", ml: 1 }}
                      >
                        ({totalDoctorAppointments} for selected doctor)
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Grid schedule */}
        <Paper
          sx={{
            ...softPanelSx,
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Header days row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "80px repeat(7, 1fr)",
              borderBottom: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(248,250,252,0.85)",
            }}
          >
            <Box sx={{ p: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Time
              </Typography>
            </Box>
            {weekDays.map((day) => (
              <Box
                key={day.date.toString()}
                sx={{
                  p: 1.5,
                  borderLeft: "1px solid rgba(148,163,184,0.18)",
                  textAlign: "center",
                  backgroundColor: day.isToday
                    ? "rgba(37,99,235,0.06)"
                    : "transparent",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: 12,
                  }}
                >
                  {day.label}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: day.isToday ? "#2563eb" : "#0f172a",
                  }}
                >
                  {day.dayNumber}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Time slots rows */}
          {timeSlots.map((time) => (
            <Box
              key={time}
              sx={{
                display: "grid",
                gridTemplateColumns: "80px repeat(7, 1fr)",
                borderTop: "1px solid rgba(148,163,184,0.10)",
                "&:hover": {
                  backgroundColor: "rgba(248,250,252,0.7)",
                },
              }}
            >
              {/* Time column */}
              <Box
                sx={{
                  p: 1,
                  pr: 1.5,
                  borderRight: "1px solid rgba(148,163,184,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}
                >
                  {time}
                </Typography>
              </Box>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayKey = day.date.format("YYYY-MM-DD");
                const appt = scheduleMap[dayKey]?.[time];

                if (!appt) {
                  return (
                    <Box
                      key={dayKey + time}
                      sx={{
                        p: 0.5,
                        borderRight: "1px solid rgba(148,163,184,0.08)",
                        minHeight: 46,
                        cursor: "pointer",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(15,118,110,0.06), rgba(37,99,235,0.06))",
                        },
                      }}
                      onClick={() =>
                        handleCreateFromSlot(
                          day.date
                            .hour(Number(time.slice(0, 2)))
                            .minute(Number(time.slice(3, 5)))
                        )
                      }
                    >
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: "1px dashed rgba(148,163,184,0.5)",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#94a3b8" }}
                        >
                          + Free
                        </Typography>
                      </Box>
                    </Box>
                  );
                }

                const colors =
                  statusColors[appt.status] || statusColors["scheduled"];

                return (
                  <Box
                    key={dayKey + time}
                    sx={{
                      p: 0.5,
                      borderRight: "1px solid rgba(148,163,184,0.08)",
                      minHeight: 46,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 2,
                        backgroundColor: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.color}33`,
                        px: 1,
                        py: 0.7,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {appt.patient_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", display: "block" }}
                      >
                        {appt.doctor_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {String(appt.status).replace("_", " ")}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Paper>

        {/* Create appointment from schedule (упрощённая версия dialog) */}
        {createOpen && (
          <Paper
            sx={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15,23,42,0.35)",
              zIndex: 1300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setCreateOpen(false)}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                maxWidth: 540,
                width: "100%",
                mx: 2,
                ...softPanelSx,
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ScheduleOutlinedIcon sx={{ color: "#0f766e" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Create Appointment
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Patient"
                      value={createForm.patient}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, patient: e.target.value })
                      }
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{ mr: 1, display: "flex", color: "#64748b" }}
                          >
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
                      value={createForm.doctor}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, doctor: e.target.value })
                      }
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{ mr: 1, display: "flex", color: "#64748b" }}
                          >
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
                      value={createForm.date}
                      onChange={(newValue) =>
                        setCreateForm({
                          ...createForm,
                          date: newValue || dayjs(),
                        })
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1.5,
                  mt: 3,
                }}
              >
                <Button
                  onClick={() => setCreateOpen(false)}
                  sx={{ borderRadius: 3, color: "#475569" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateSubmit}
                  sx={{ borderRadius: 3, px: 2.5, boxShadow: "none" }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default Schedule;