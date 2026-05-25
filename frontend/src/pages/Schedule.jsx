import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import api from "../services/api";

const panelSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const mutedCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

const selectedCardSx = {
  backgroundColor: "#eff6ff",
  border: "1px solid #93c5fd",
  borderRadius: "14px",
  boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.12)",
};

const dayEnabledCardSx = {
  backgroundColor: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
};

const dayDisabledCardSx = {
  backgroundColor: "#f8fafc",
  border: "1px dashed #cbd5e1",
  borderRadius: "14px",
};

const daysOfWeek = [
  { value: 0, label: "Monday", short: "Mon" },
  { value: 1, label: "Tuesday", short: "Tue" },
  { value: 2, label: "Wednesday", short: "Wed" },
  { value: 3, label: "Thursday", short: "Thu" },
  { value: 4, label: "Friday", short: "Fri" },
  { value: 5, label: "Saturday", short: "Sat" },
  { value: 6, label: "Sunday", short: "Sun" },
];

const slotDurationOptions = [15, 20, 30, 45, 60];

const createDefaultDayState = () => ({
  enabled: false,
  start_time: "09:00",
  end_time: "18:00",
  slot_duration: 30,
  lunch_enabled: true,
  lunch_start: "13:00",
  lunch_end: "14:00",
  is_active: true,
  existingIds: [],
  existingRows: [],
});

const createInitialWeekState = () => {
  const state = {};
  daysOfWeek.forEach((day) => {
    state[day.value] = createDefaultDayState();
  });
  return state;
};

function Schedule() {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [weekConfig, setWeekConfig] = useState(createInitialWeekState());

  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [clearingDay, setClearingDay] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setServerError("");

    try {
      const [doctorsRes, schedulesRes] = await Promise.all([
        api.get("doctors/"),
        api.get("doctor-schedules/"),
      ]);

      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
    } catch (err) {
      console.error("schedule page load error:", err);
      setServerError("Failed to load doctors or schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedDoctorObject = useMemo(() => {
    return doctors.find((doctor) => String(doctor.id) === String(selectedDoctor));
  }, [doctors, selectedDoctor]);

  const selectedDoctorSchedules = useMemo(() => {
    if (!selectedDoctor) return [];

    return schedules
      .filter((item) => String(item.doctor_pk) === String(selectedDoctor))
      .sort((a, b) => {
        if (Number(a.day_of_week) !== Number(b.day_of_week)) {
          return Number(a.day_of_week) - Number(b.day_of_week);
        }
        return String(a.start_time).localeCompare(String(b.start_time));
      });
  }, [schedules, selectedDoctor]);

  useEffect(() => {
    if (!selectedDoctor) {
      setWeekConfig(createInitialWeekState());
      return;
    }

    const nextState = createInitialWeekState();

    daysOfWeek.forEach((day) => {
      const dayRows = selectedDoctorSchedules
        .filter((item) => Number(item.day_of_week) === Number(day.value))
        .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

      if (!dayRows.length) return;

      if (dayRows.length === 1) {
        nextState[day.value] = {
          enabled: true,
          start_time: String(dayRows[0].start_time || "09:00").slice(0, 5),
          end_time: String(dayRows[0].end_time || "18:00").slice(0, 5),
          slot_duration: Number(dayRows[0].slot_duration || 30),
          lunch_enabled: false,
          lunch_start: "13:00",
          lunch_end: "14:00",
          is_active: Boolean(dayRows[0].is_active),
          existingIds: dayRows.map((row) => row.id),
          existingRows: dayRows,
        };
      } else {
        nextState[day.value] = {
          enabled: true,
          start_time: String(dayRows[0].start_time || "09:00").slice(0, 5),
          end_time: String(dayRows[dayRows.length - 1].end_time || "18:00").slice(0, 5),
          slot_duration: Number(dayRows[0].slot_duration || 30),
          lunch_enabled: true,
          lunch_start: String(dayRows[0].end_time || "13:00").slice(0, 5),
          lunch_end: String(dayRows[1].start_time || "14:00").slice(0, 5),
          is_active: dayRows.some((row) => row.is_active),
          existingIds: dayRows.map((row) => row.id),
          existingRows: dayRows,
        };
      }
    });

    setWeekConfig(nextState);
  }, [selectedDoctor, selectedDoctorSchedules]);

  const activeDaysCount = useMemo(() => {
    return Object.values(weekConfig).filter((day) => day.enabled && day.is_active).length;
  }, [weekConfig]);

  const uniqueDurations = useMemo(() => {
    return [...new Set(selectedDoctorSchedules.map((item) => item.slot_duration))];
  }, [selectedDoctorSchedules]);

  const savedSummaryRows = useMemo(() => {
    return daysOfWeek
      .map((day) => {
        const config = weekConfig[day.value];
        if (!config.enabled || !config.is_active) return null;

        return {
          day: day.label,
          short: day.short,
          start: config.start_time,
          end: config.end_time,
          slot: config.slot_duration,
          lunchEnabled: config.lunch_enabled,
          lunchStart: config.lunch_start,
          lunchEnd: config.lunch_end,
        };
      })
      .filter(Boolean);
  }, [weekConfig]);

  const groupedExistingRows = useMemo(() => {
    const grouped = {};
    daysOfWeek.forEach((day) => {
      grouped[day.value] = selectedDoctorSchedules.filter(
        (row) => Number(row.day_of_week) === Number(day.value)
      );
    });
    return grouped;
  }, [selectedDoctorSchedules]);

  const updateDay = (dayValue, field, value) => {
    setWeekConfig((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        [field]: value,
      },
    }));
    setServerError("");
    setSuccessMessage("");
  };

  const copyDayToOtherDays = (sourceDayValue) => {
    setWeekConfig((prev) => {
      const source = prev[sourceDayValue];
      const next = { ...prev };

      daysOfWeek.forEach((day) => {
        if (day.value === sourceDayValue) return;
        next[day.value] = {
          ...next[day.value],
          enabled: source.enabled,
          start_time: source.start_time,
          end_time: source.end_time,
          slot_duration: source.slot_duration,
          lunch_enabled: source.lunch_enabled,
          lunch_start: source.lunch_start,
          lunch_end: source.lunch_end,
          is_active: source.is_active,
        };
      });

      return next;
    });

    setSuccessMessage("Working hours copied to other days.");
    setServerError("");
  };

  const applyMondayToWeekdays = () => {
    setWeekConfig((prev) => {
      const monday = prev[0];
      const next = { ...prev };

      [1, 2, 3, 4].forEach((dayValue) => {
        next[dayValue] = {
          ...next[dayValue],
          enabled: monday.enabled,
          start_time: monday.start_time,
          end_time: monday.end_time,
          slot_duration: monday.slot_duration,
          lunch_enabled: monday.lunch_enabled,
          lunch_start: monday.lunch_start,
          lunch_end: monday.lunch_end,
          is_active: monday.is_active,
        };
      });

      return next;
    });

    setSuccessMessage("Monday schedule copied to weekdays.");
    setServerError("");
  };

  const validateWeekConfig = () => {
    if (!selectedDoctor) {
      setServerError("Please select a doctor first.");
      return false;
    }

    for (const day of daysOfWeek) {
      const config = weekConfig[day.value];

      if (!config.enabled) continue;

      if (!config.start_time || !config.end_time) {
        setServerError(`${day.label}: start time and end time are required.`);
        return false;
      }

      if (config.start_time >= config.end_time) {
        setServerError(`${day.label}: end time must be later than start time.`);
        return false;
      }

      if (config.lunch_enabled) {
        if (!config.lunch_start || !config.lunch_end) {
          setServerError(`${day.label}: lunch break times are required.`);
          return false;
        }

        const validLunch =
          config.start_time < config.lunch_start &&
          config.lunch_start < config.lunch_end &&
          config.lunch_end < config.end_time;

        if (!validLunch) {
          setServerError(`${day.label}: lunch break must be inside working hours.`);
          return false;
        }
      }
    }

    return true;
  };

  const buildRowsForDay = (dayValue, config) => {
    if (!config.enabled) return [];

    const base = {
      doctor_id: selectedDoctor,
      day_of_week: Number(dayValue),
      slot_duration: Number(config.slot_duration),
      is_active: Boolean(config.is_active),
    };

    if (
      config.lunch_enabled &&
      config.lunch_start &&
      config.lunch_end &&
      config.start_time < config.lunch_start &&
      config.lunch_start < config.lunch_end &&
      config.lunch_end < config.end_time
    ) {
      return [
        {
          ...base,
          start_time: config.start_time,
          end_time: config.lunch_start,
        },
        {
          ...base,
          start_time: config.lunch_end,
          end_time: config.end_time,
        },
      ];
    }

    return [
      {
        ...base,
        start_time: config.start_time,
        end_time: config.end_time,
      },
    ];
  };

  const handleClearDay = async (dayValue) => {
    if (!selectedDoctor) return;

    const dayConfig = weekConfig[dayValue];
    const existingIds = dayConfig.existingIds || [];

    if (!existingIds.length) {
      setWeekConfig((prev) => ({
        ...prev,
        [dayValue]: createDefaultDayState(),
      }));
      setSuccessMessage("Day availability cleared.");
      setServerError("");
      return;
    }

    setClearingDay(dayValue);
    setServerError("");
    setSuccessMessage("");

    try {
      for (const existingId of existingIds) {
        await api.delete(`doctor-schedules/${existingId}/`);
      }

      await loadData();
      setSuccessMessage("Day availability deleted successfully.");
    } catch (err) {
      console.error("clear day availability error:", err);
      setServerError("Failed to delete day availability.");
    } finally {
      setClearingDay(null);
    }
  };

  const handleClearAllSchedule = async () => {
    if (!selectedDoctor) return;

    const existingIds = selectedDoctorSchedules.map((item) => item.id);

    if (!existingIds.length) {
      setWeekConfig(createInitialWeekState());
      setSuccessMessage("No saved weekly availability to delete.");
      setServerError("");
      return;
    }

    setClearingAll(true);
    setServerError("");
    setSuccessMessage("");

    try {
      for (const existingId of existingIds) {
        await api.delete(`doctor-schedules/${existingId}/`);
      }

      await loadData();
      setSuccessMessage("Weekly availability deleted successfully.");
    } catch (err) {
      console.error("clear all weekly schedule error:", err);
      setServerError("Failed to delete weekly availability.");
    } finally {
      setClearingAll(false);
    }
  };

  const handleSaveAll = async () => {
    if (!validateWeekConfig()) return;

    setSavingAll(true);
    setServerError("");
    setSuccessMessage("");

    try {
      for (const day of daysOfWeek) {
        const config = weekConfig[day.value];
        const existingIds = config.existingIds || [];

        if (existingIds.length) {
          for (const existingId of existingIds) {
            await api.delete(`doctor-schedules/${existingId}/`);
          }
        }

        const rows = buildRowsForDay(day.value, config);

        if (rows.length) {
          for (const payload of rows) {
            await api.post("doctor-schedules/", payload);
          }
        }
      }

      await loadData();
      setSuccessMessage("Weekly doctor schedule saved successfully.");
    } catch (err) {
      console.error("save weekly schedule error:", err);
      console.error("backend response:", err?.response?.data);
      setServerError(
        err?.response?.data?.detail ||
          err?.response?.data?.non_field_errors?.[0] ||
          "Failed to save weekly doctor schedule."
      );
    } finally {
      setSavingAll(false);
    }
  };

  const formatSummaryRow = (row) => {
    if (!row.lunchEnabled) {
      return `${row.start}–${row.end} · ${row.slot} min slots`;
    }

    return `${row.start}–${row.lunchStart}, ${row.lunchEnd}–${row.end} · lunch ${row.lunchStart}–${row.lunchEnd} · ${row.slot} min slots`;
  };

  const formatExistingWindow = (row) => {
    return `${String(row.start_time).slice(0, 5)}–${String(row.end_time).slice(0, 5)} · ${row.slot_duration} min`;
  };

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
          Admin scheduling
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
          Weekly doctor availability
        </Typography>

        <Typography
          sx={{
            color: "#475569",
            maxWidth: 820,
            lineHeight: 1.7,
            fontSize: 15,
          }}
        >
          Configure recurring weekly working hours for each doctor. Patient booking
          slots are created from these working periods, and lunch breaks are saved
          as split time windows for the same day.
        </Typography>
      </Paper>

      <Stack spacing={2.5}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Paper sx={{ ...panelSx, p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
                Select doctor
              </Typography>

              <TextField
                select
                fullWidth
                label="Doctor"
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  setServerError("");
                  setSuccessMessage("");
                }}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} — {doctor.specialization}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {selectedDoctorObject ? (
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Box sx={{ ...mutedCardSx, p: 2, flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocalHospitalOutlinedIcon sx={{ color: "#2563eb" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                        Selected doctor
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {selectedDoctorObject.name}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: "#475569" }}>
                        {selectedDoctorObject.specialization}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 2, flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CalendarMonthOutlinedIcon sx={{ color: "#0f766e" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                        Working days
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {activeDaysCount}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ ...mutedCardSx, p: 2, flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ScheduleOutlinedIcon sx={{ color: "#7c3aed" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                        Slot durations
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                        {uniqueDurations.length ? (
                          uniqueDurations.map((duration) => (
                            <Chip key={duration} size="small" label={`${duration} min`} />
                          ))
                        ) : (
                          <Typography sx={{ fontSize: 14, color: "#475569" }}>
                            No saved schedule yet
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ ...mutedCardSx, p: 2 }}>
                <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                  Choose a doctor to configure weekly availability.
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ ...panelSx, p: 3 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                Weekly planner
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14, mt: 0.5 }}>
                Turn days on or off, set working hours, edit availability, and split the day with a lunch break if needed.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyOutlinedIcon />}
                onClick={applyMondayToWeekdays}
                disabled={!selectedDoctor || savingAll || clearingAll}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                }}
              >
                Apply Monday to weekdays
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={handleClearAllSchedule}
                disabled={!selectedDoctor || savingAll || clearingAll}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                }}
              >
                {clearingAll ? "Clearing..." : "Clear weekly availability"}
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSaveAll}
                disabled={!selectedDoctor || savingAll || clearingAll}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  boxShadow: "none",
                  px: 2.5,
                  py: 1.2,
                }}
              >
                {savingAll ? "Saving..." : "Save weekly schedule"}
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={2}>
            {daysOfWeek.map((day) => {
              const config = weekConfig[day.value];
              const existingRowsForDay = groupedExistingRows[day.value] || [];

              return (
                <Box
                  key={day.value}
                  sx={{
                    ...(config.enabled ? dayEnabledCardSx : dayDisabledCardSx),
                    p: 2,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={2}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Switch
                          checked={config.enabled}
                          onChange={(e) => updateDay(day.value, "enabled", e.target.checked)}
                          disabled={!selectedDoctor}
                        />

                        <Box>
                          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                            {day.label}
                          </Typography>
                          <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                            {config.enabled
                              ? "Doctor accepts appointments on this day."
                              : "No availability on this day."}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ContentCopyOutlinedIcon />}
                          onClick={() => copyDayToOtherDays(day.value)}
                          disabled={!selectedDoctor || savingAll || clearingAll}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: "10px",
                          }}
                        >
                          Copy to other days
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          onClick={() => handleClearDay(day.value)}
                          disabled={!selectedDoctor || savingAll || clearingAll || clearingDay === day.value}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: "10px",
                          }}
                        >
                          {clearingDay === day.value ? "Clearing..." : "Clear day"}
                        </Button>
                      </Stack>
                    </Stack>

                    {existingRowsForDay.length > 0 && (
                      <Box sx={{ ...selectedCardSx, p: 2 }}>
                        <Typography sx={{ fontSize: 14, color: "#475569", mb: 0.9 }}>
                          Existing saved windows
                        </Typography>

                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {existingRowsForDay.map((row) => (
                            <Chip
                              key={row.id}
                              label={formatExistingWindow(row)}
                              color={row.is_active ? "primary" : "default"}
                              variant={row.is_active ? "filled" : "outlined"}
                              sx={{ fontWeight: 700 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {config.enabled && (
                      <>
                        <Divider />

                        <Stack direction={{ xs: "column", xl: "row" }} spacing={2}>
                          <TextField
                            label="Start time"
                            type="time"
                            value={config.start_time}
                            onChange={(e) => updateDay(day.value, "start_time", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />

                          <TextField
                            label="End time"
                            type="time"
                            value={config.end_time}
                            onChange={(e) => updateDay(day.value, "end_time", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />

                          <TextField
                            select
                            label="Slot duration"
                            value={config.slot_duration}
                            onChange={(e) => updateDay(day.value, "slot_duration", e.target.value)}
                            fullWidth
                          >
                            {slotDurationOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option} minutes
                              </MenuItem>
                            ))}
                          </TextField>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: { xl: 170 }, px: 1 }}
                          >
                            <Typography sx={{ fontSize: 14, color: "#475569" }}>
                              Active
                            </Typography>
                            <Switch
                              checked={config.is_active}
                              onChange={(e) => updateDay(day.value, "is_active", e.target.checked)}
                            />
                          </Stack>
                        </Stack>

                        <Box sx={{ ...mutedCardSx, p: 2 }}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            spacing={2}
                            sx={{ mb: config.lunch_enabled ? 2 : 0 }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                                Lunch break
                              </Typography>
                              <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                                If enabled, booking skips the lunch interval automatically.
                              </Typography>
                            </Box>

                            <Switch
                              checked={config.lunch_enabled}
                              onChange={(e) =>
                                updateDay(day.value, "lunch_enabled", e.target.checked)
                              }
                            />
                          </Stack>

                          {config.lunch_enabled && (
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                              <TextField
                                label="Lunch start"
                                type="time"
                                value={config.lunch_start}
                                onChange={(e) =>
                                  updateDay(day.value, "lunch_start", e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                              />

                              <TextField
                                label="Lunch end"
                                type="time"
                                value={config.lunch_end}
                                onChange={(e) =>
                                  updateDay(day.value, "lunch_end", e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                              />
                            </Stack>
                          )}
                        </Box>

                        <Box sx={{ ...mutedCardSx, p: 2 }}>
                          <Typography sx={{ fontSize: 14, color: "#64748b", mb: 0.75 }}>
                            Day preview
                          </Typography>

                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Chip
                              label={`${config.start_time}–${config.end_time}`}
                              sx={{ fontWeight: 700 }}
                            />
                            <Chip
                              label={`${config.slot_duration} min slots`}
                              sx={{ fontWeight: 700 }}
                            />
                            {config.lunch_enabled ? (
                              <Chip
                                label={`Lunch ${config.lunch_start}–${config.lunch_end}`}
                                color="warning"
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                              />
                            ) : (
                              <Chip
                                label="No lunch break"
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                            {config.is_active ? (
                              <Chip
                                label="Active"
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                              />
                            ) : (
                              <Chip
                                label="Inactive"
                                color="default"
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        <Paper sx={{ ...panelSx, p: 3 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
            Saved availability summary
          </Typography>

          {!selectedDoctor ? (
            <Box sx={{ ...mutedCardSx, p: 2 }}>
              <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                Select a doctor to see the saved weekly availability summary.
              </Typography>
            </Box>
          ) : !savedSummaryRows.length ? (
            <Box sx={{ ...mutedCardSx, p: 2 }}>
              <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                No active weekly schedule is configured for {selectedDoctorObject?.name || "this doctor"}.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              <Box sx={{ ...selectedCardSx, p: 2 }}>
                <Typography sx={{ fontSize: 15, color: "#475569", mb: 0.4 }}>
                  Doctor
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  {selectedDoctorObject?.name}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#475569", mt: 0.35 }}>
                  {selectedDoctorObject?.specialization}
                </Typography>
              </Box>

              {savedSummaryRows.map((row) => (
                <Box key={row.day} sx={{ ...mutedCardSx, p: 2 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                    {row.day}
                  </Typography>
                  <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
                    {formatSummaryRow(row)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ ...panelSx, p: 3 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
            How it works
          </Typography>

          <Stack spacing={1.25}>
            <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              - Turn on only the days when the doctor accepts appointments.
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              - Edit working hours, slot duration, and lunch break for each day.
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              - Existing saved windows are shown above each day so you can see what is already in the system.
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
              - Clear day removes saved availability only for that day. Clear weekly availability removes the whole weekly template for the selected doctor.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default Schedule;