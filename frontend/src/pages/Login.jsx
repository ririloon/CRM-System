import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const tokenRes = await api.post("auth/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("accessToken", tokenRes.data.access);
      localStorage.setItem("refreshToken", tokenRes.data.refresh);

      const meRes = await api.get("auth/me/");
      localStorage.setItem("role", meRes.data.role || "patient");
      localStorage.setItem("username", meRes.data.username || "");

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Неверный логин или пароль");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(circle at 0% 0%, rgba(15,118,110,0.10), transparent 28%),
          radial-gradient(circle at 100% 0%, rgba(37,99,235,0.10), transparent 26%),
          linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%)
        `,
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.60)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
          Clinic CRM
        </Typography>

        <Typography sx={{ color: "#64748b", mb: 3 }}>
          Войдите, чтобы продолжить работу в системе
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={form.username}
            onChange={handleChange("username")}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange("password")}
          />

          {error && (
            <Typography sx={{ color: "#dc2626", mt: 1, fontSize: 14 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: 3,
              boxShadow: "none",
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;