import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authRole");
  localStorage.removeItem("authUsername");
}

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["login", "common"]);

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      clearAuthStorage();

      const tokenRes = await api.post("auth/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("accessToken", tokenRes.data.access);
      localStorage.setItem("refreshToken", tokenRes.data.refresh);

      const meRes = await api.get("auth/me/");
      const role = meRes.data.role || "patient";
      const username = meRes.data.username || form.username;

      localStorage.setItem("authRole", role);
      localStorage.setItem("authUsername", username);

      if (role === "patient") {
        const patientRes = await api.get("patients/");
        const patient = Array.isArray(patientRes.data)
          ? patientRes.data[0]
          : patientRes.data;

        const isProfileComplete =
          patient?.full_name &&
          patient?.phone &&
          patient?.date_of_birth &&
          patient?.gender;

        if (isProfileComplete) {
          navigate("/patient", { replace: true });
        } else {
          navigate("/patient/profile?mode=setup", { replace: true });
        }
        return;
      }

      if (role === "doctor") {
        navigate("/doctor", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      clearAuthStorage();
      console.error(err);
      setError(
        t("errors.invalidCredentials", {
          ns: "login",
          defaultValue: "Invalid username or password",
        }),
      );
    }
  };

  const currentLang = i18n.language?.startsWith("ky")
    ? "ky"
    : i18n.language?.startsWith("en")
      ? "en"
      : "ru";

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              overflow: "hidden",
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.60)",
              boxShadow: "none",
            }}
          >
            {["ru", "ky", "en"].map((lng) => (
              <Button
                key={lng}
                onClick={() => i18n.changeLanguage(lng)}
                variant={currentLang === lng ? "contained" : "text"}
                size="small"
                sx={{
                  minWidth: 52,
                  borderRadius: 0,
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                {t(`languages.${lng}`, {
                  ns: "common",
                  defaultValue: lng.toUpperCase(),
                })}
              </Button>
            ))}
          </Paper>
        </Box>

        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}
        >
          {t("brand.name", {
            ns: "common",
            defaultValue: "Clinic CRM",
          })}
        </Typography>

        <Typography sx={{ color: "#64748b", mb: 3 }}>
          {t("subtitle", {
            ns: "login",
            defaultValue: "Sign in to continue using the clinic system",
          })}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label={t("username", {
              ns: "login",
              defaultValue: "Username",
            })}
            fullWidth
            margin="normal"
            value={form.username}
            onChange={handleChange("username")}
          />

          <TextField
            label={t("password", {
              ns: "login",
              defaultValue: "Password",
            })}
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
            {t("submit", {
              ns: "login",
              defaultValue: "Sign in",
            })}
          </Button>

          <Typography sx={{ mt: 2.5, color: "#64748b", textAlign: "center" }}>
            {t("noAccount", {
              ns: "login",
              defaultValue: "Don't have an account?",
            })}{" "}
            <Box
              component={RouterLink}
              to="/register"
              sx={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {t("goRegister", {
                ns: "login",
                defaultValue: "Register",
              })}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;