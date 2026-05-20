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
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import { DataGrid } from "@mui/x-data-grid";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { InputAdornment } from "@mui/material";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
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

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    notes: "",
  });

  const navigate = useNavigate();

  const loadPatients = useCallback(() => {
    api
      .get("patients/")
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleCreate = () => {
    api
      .post("patients/", form)
      .then(() => {
        setOpen(false);
        setForm({
          name: "",
          phone: "",
          email: "",
          birth_date: "",
          notes: "",
        });
        loadPatients();
      })
      .catch((err) => console.error(err));
  };

  const filteredRows = useMemo(() => {
    return patients.filter((patient) => {
      const text =
        `${patient.name} ${patient.phone || ""} ${patient.email || ""} ${patient.notes || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [patients, search]);

  const totalPatients = patients.length;
  const withEmail = patients.filter((p) => p.email).length;
  const withVisits = patients.filter(
    (p) => (p.appointments_count || 0) > 0,
  ).length;

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "name",
      headerName: "Patient",
      flex: 1.2,
      minWidth: 180,
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
    {
      field: "birth_date",
      headerName: "Birth Date",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => params.value || "—",
    },
    {
      field: "appointments_count",
      headerName: "Visits",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          sx={{
            backgroundColor: "rgba(15, 118, 110, 0.08)",
            color: "#0f766e",
            fontWeight: 700,
            border: "1px solid rgba(15, 118, 110, 0.10)",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => navigate(`/patients/${params.row.id}`)}
          sx={{ fontWeight: 600 }}
        >
          View
        </Button>
      ),
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
              Patient Directory
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Patients
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#475569",
                maxWidth: 620,
                lineHeight: 1.7,
              }}
            >
              Search, review, and manage patient records with quick access to
              visit history and contact details.
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
            Add Patient
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
                <PeopleAltOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total patients
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {totalPatients}
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
                  backgroundColor: "rgba(37, 99, 235, 0.10)",
                  color: "#2563eb",
                }}
              >
                <EmailOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  With email
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {withEmail}
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
                <NotesOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  With visits
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {withVisits}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ ...softPanelSx, p: 2.5 }}>
            <TextField
              fullWidth
              label="Search patient"
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
            Patient List
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Browse and manage patient records in the clinic system
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
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Add New Patient
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Create a new patient profile for the clinic system
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Grid container spacing={2.2}>
            <Grid item xs={12}>
              <TextField
                label="Patient name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                sx={formFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleAltOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                    </InputAdornment>
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
                sx={formFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                    </InputAdornment>
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
                sx={formFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", mb: 0.8, fontWeight: 500 }}
              >
                Birth date
              </Typography>

              <TextField
                type="date"
                value={form.birth_date}
                onChange={(e) =>
                  setForm({ ...form, birth_date: e.target.value })
                }
                fullWidth
                sx={formFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CakeOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#64748b" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
                multiline
                rows={4}
                sx={formFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesOutlinedIcon
                        fontSize="small"
                        sx={{
                          color: "#64748b",
                          alignSelf: "flex-start",
                          mt: 0.8,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 3,
              color: "#475569",
              px: 2,
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
            Save Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Patients;
