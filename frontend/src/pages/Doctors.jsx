import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GlassFormDialog from "../components/GlassFormDialog";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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

const tableSx = {
  border: "none",
  background: "transparent",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "rgba(248, 250, 252, 0.92)",
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
    display: "flex",
    alignItems: "center",
    py: 1,
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(248, 250, 252, 0.72)",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid rgba(148, 163, 184, 0.14)",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  "& .MuiDataGrid-cellContent": {
    whiteSpace: "normal",
    lineHeight: "1.35 !important",
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

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
  license_number: "",
  experience_years: "",
  bio: "",
  is_available_online: false,
};

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadDoctors = useCallback(() => {
    api
      .get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    const payload = {
      name: form.name,
      specialization: form.specialization,
      phone: form.phone,
      email: form.email,
      license_number: form.license_number,
      experience_years:
        form.experience_years === "" ? 0 : Number(form.experience_years),
      bio: form.bio,
      is_available_online: form.is_available_online,
    };

    const request = editingId
      ? api.put(`doctors/${editingId}/`, payload)
      : api.post("doctors/", payload);

    request
      .then(() => {
        handleClose();
        loadDoctors();
      })
      .catch((err) => console.error(err));
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      specialization: row.specialization || "",
      phone: row.phone || "",
      email: row.email || "",
      license_number: row.license_number || "",
      experience_years: row.experience_years ?? "",
      bio: row.bio || "",
      is_available_online: !!row.is_available_online,
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Delete this doctor?");
    if (!confirmed) return;

    api
      .delete(`doctors/${id}/`)
      .then(() => loadDoctors())
      .catch((err) => console.error(err));
  };

  const specializationOptions = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean)
      .map((value) => value.trim());

    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const filteredRows = useMemo(() => {
    return doctors.filter((doctor) => {
      const text =
        `${doctor.name || ""} ${doctor.specialization || ""} ${doctor.phone || ""} ${doctor.email || ""} ${doctor.license_number || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesSpecialization =
        specializationFilter === "all"
          ? true
          : doctor.specialization === specializationFilter;

      const matchesOnline = onlineOnly ? doctor.is_available_online : true;

      return matchesSearch && matchesSpecialization && matchesOnline;
    });
  }, [doctors, search, specializationFilter, onlineOnly]);

  const totalDoctors = doctors.length;
  const totalSpecializations = specializationOptions.length;
  const onlineDoctors = doctors.filter((d) => d.is_available_online).length;
  const avgExperience = doctors.length
    ? Math.round(
        doctors.reduce((sum, doctor) => sum + (doctor.experience_years || 0), 0) /
          doctors.length
      )
    : 0;

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      {
        field: "name",
        headerName: "Doctor",
        flex: 1.25,
        minWidth: 240,
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              width: "100%",
              height: "100%",
              py: 1,
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
                flexShrink: 0,
              }}
            >
              {params.value?.charAt(0)?.toUpperCase() || "D"}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
                lineHeight: "initial",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.25,
                  color: "#0f172a",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: "#2563eb",
                  },
                }}
                onClick={() => navigate(`/doctors/${params.row.id}`)}
              >
                {params.value}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  lineHeight: 1.25,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {params.row.license_number || "License not specified"}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "specialization",
        headerName: "Specialization",
        flex: 1.1,
        minWidth: 170,
        renderCell: (params) => (
          <Chip
            label={params.value || "General"}
            size="small"
            sx={{
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              color: "#1d4ed8",
              fontWeight: 600,
              border: "1px solid rgba(37, 99, 235, 0.10)",
            }}
          />
        ),
      },
      {
        field: "experience_years",
        headerName: "Experience",
        width: 120,
        renderCell: (params) =>
          params.value || params.value === 0 ? `${params.value} yrs` : "—",
      },
      {
        field: "is_available_online",
        headerName: "Online",
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Available" : "Offline only"}
            size="small"
            color={params.value ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        field: "phone",
        headerName: "Phone",
        flex: 1,
        minWidth: 150,
        renderCell: (params) => params.value || "—",
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1.2,
        minWidth: 220,
        renderCell: (params) => params.value || "—",
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: "100%" }}>
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
          </Stack>
        ),
      },
    ],
    [navigate]
  );

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
              Provider Directory
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Doctors
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#475569",
                maxWidth: 700,
                lineHeight: 1.7,
              }}
            >
              Manage clinic doctors, specialties, experience, licensing details,
              and online consultation availability in one clear directory.
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
            Add Doctor
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
              label: "Total doctors",
              value: totalDoctors,
              color: "#0f172a",
              icon: <LocalHospitalOutlinedIcon fontSize="small" />,
            },
            {
              label: "Specializations",
              value: totalSpecializations,
              color: "#2563eb",
              icon: <SchoolOutlinedIcon fontSize="small" />,
            },
            {
              label: "Online available",
              value: onlineDoctors,
              color: "#0f766e",
              icon: <PublicOutlinedIcon fontSize="small" />,
            },
            {
              label: "Avg. experience",
              value: `${avgExperience} yrs`,
              color: "#d97706",
              icon: <SchoolOutlinedIcon fontSize="small" />,
            },
          ].map((item, index) => (
            <Grid item xs={12} md={3} key={item.label}>
              <Box
                sx={{
                  px: 3,
                  py: 3,
                  minHeight: 116,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRight:
                    index !== 3
                      ? "1px solid rgba(148, 163, 184, 0.14)"
                      : "none",
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
                    mb: 1.2,
                    backgroundColor: "rgba(248, 250, 252, 0.9)",
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mb: 0.7,
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 30,
                    lineHeight: 1,
                    fontWeight: 800,
                    color: item.color,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
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
            placeholder="Search doctor, specialization, email, phone, or license"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={formFieldSx}
          />
        </Paper>

        <Paper sx={{ ...softPanelSx, p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.2,
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                Specialization
              </Typography>

              <TextField
                select
                fullWidth
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                sx={formFieldSx}
              >
                <MenuItem value="all">All specializations</MenuItem>
                {specializationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.2,
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                Availability
              </Typography>

              <Box
                sx={{
                  minHeight: 56,
                  px: 1.5,
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlineOnly}
                      onChange={(e) => setOnlineOnly(e.target.checked)}
                    />
                  }
                  label="Online doctors only"
                  sx={{ m: 0 }}
                />
              </Box>
            </Grid>
          </Grid>
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
            Doctor Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Browse, update, and maintain doctor profiles for scheduling and clinic operations.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ px: 1.5, pb: 1.5, pt: 1 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            autoHeight
            getRowHeight={() => "auto"}
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
        title={editingId ? "Edit Doctor" : "Add New Doctor"}
        subtitle={
          editingId
            ? "Update provider profile details in the clinic directory"
            : "Create a complete provider profile for scheduling and patient access"
        }
        saveText={editingId ? "Update Doctor" : "Save Doctor"}
        onSave={handleSave}
        saveDisabled={!form.name || !form.specialization}
      >
        <Box sx={{ display: "grid", gap: 2.2 }}>
          <TextField
            label="Doctor name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            sx={formFieldSx}
          />

          <TextField
            label="Specialization"
            value={form.specialization}
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
            fullWidth
            sx={formFieldSx}
          />

          <Box
            sx={{
              display: "grid",
              gap: 2.2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
              sx={formFieldSx}
            />

            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              sx={formFieldSx}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2.2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <TextField
              label="License number"
              value={form.license_number}
              onChange={(e) =>
                setForm({ ...form, license_number: e.target.value })
              }
              fullWidth
              sx={formFieldSx}
            />

            <TextField
              label="Experience (years)"
              type="number"
              value={form.experience_years}
              onChange={(e) =>
                setForm({ ...form, experience_years: e.target.value })
              }
              fullWidth
              sx={formFieldSx}
            />
          </Box>

          <TextField
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            fullWidth
            multiline
            minRows={3}
            sx={formFieldSx}
          />

          <Box
            sx={{
              minHeight: 56,
              px: 1.5,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_available_online}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_available_online: e.target.checked,
                    })
                  }
                />
              }
              label="Available for online consultations"
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      </GlassFormDialog>
    </Box>
  );
}

export default Doctors;