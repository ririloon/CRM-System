import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { DataGrid } from "@mui/x-data-grid";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import api from "../services/api";

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

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const loadDoctors = useCallback(() => {
    api.get("doctors/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleCreate = () => {
    api.post("doctors/", form)
      .then(() => {
        setOpen(false);
        setForm({
          name: "",
          specialization: "",
          phone: "",
          email: "",
        });
        loadDoctors();
      })
      .catch((err) => console.error(err));
  };

  const filteredRows = useMemo(() => {
    return doctors.filter((doctor) => {
      const text = `${doctor.name} ${doctor.specialization} ${doctor.phone || ""} ${doctor.email || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [doctors, search]);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "name",
      headerName: "Doctor",
      flex: 1.2,
      minWidth: 180,
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
            {params.value?.charAt(0)?.toUpperCase() || "D"}
          </Box>
          <Typography sx={{ fontWeight: 600 }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "specialization",
      headerName: "Specialization",
      flex: 1.2,
      minWidth: 180,
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
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => params.value || "—",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => params.value || "—",
    },
  ];

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
                maxWidth: 620,
                lineHeight: 1.7,
              }}
            >
              Maintain a structured directory of doctors, specialties, and contact details
              for faster appointment scheduling and clinic coordination.
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
            Add Doctor
          </Button>
        </Box>
      </Paper>

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
                  backgroundColor: "rgba(15, 118, 110, 0.10)",
                  color: "#0f766e",
                }}
              >
                <LocalHospitalOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total doctors
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {doctors.length}
                </Typography>
              </Box>
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
                  backgroundColor: "rgba(37, 99, 235, 0.10)",
                  color: "#2563eb",
                }}
              >
                <BadgeOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Specializations
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {new Set(doctors.map((d) => d.specialization)).size}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ ...softPanelSx, p: 2.5 }}>
            <TextField
              fullWidth
              label="Search doctor or specialization"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            Doctor Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Browse and manage doctors in the clinic system
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
            Add New Doctor
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Enter doctor profile details for the clinic directory
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Doctor name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: "flex", color: "#64748b" }}>
                      <BadgeOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Specialization"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: "flex", color: "#64748b" }}>
                      <LocalHospitalOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: "flex", color: "#64748b" }}>
                      <PhoneOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: "flex", color: "#64748b" }}>
                      <EmailOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
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
            Save Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Doctors;