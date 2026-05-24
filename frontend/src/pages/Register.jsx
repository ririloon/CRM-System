import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm_password: "",
    name: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["register", "common"]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("auth/register/patient/", form);

      setSuccess(
        t("success", {
          ns: "register",
          defaultValue: "Registration completed successfully.",
        })
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(err);

      const apiErrors = err?.response?.data;

      if (typeof apiErrors === "string") {
        setError(apiErrors);
        return;
      }

      if (apiErrors && typeof apiErrors === "object") {
        const firstError = Object.values(apiErrors)[0];
        if (Array.isArray(firstError)) {
          setError(firstError[0]);
          return;
        }
      }

      setError(
        t("errors.default", {
          ns: "register",
          defaultValue: "Registration failed. Please try again.",
        })
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
          maxWidth: 460,
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
          {t("title", {
            ns: "register",
            defaultValue: "Create account",
          })}
        </Typography>

        <Typography sx={{ color: "#64748b", mb: 3 }}>
          {t("subtitle", {
            ns: "register",
            defaultValue: "Register as a patient to book appointments and manage your profile.",
          })}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label={t("name", {
              ns: "register",
              defaultValue: "Full name",
            })}
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange("name")}
          />

          <TextField
            label={t("username", {
              ns: "register",
              defaultValue: "Username",
            })}
            fullWidth
            margin="normal"
            value={form.username}
            onChange={handleChange("username")}
          />

          <TextField
            label={t("phone", {
              ns: "register",
              defaultValue: "Phone",
            })}
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={handleChange("phone")}
          />

          <TextField
            label={t("email", {
              ns: "register",
              defaultValue: "Email",
            })}
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange("email")}
          />

          <TextField
            label={t("password", {
              ns: "register",
              defaultValue: "Password",
            })}
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange("password")}
          />

          <TextField
            label={t("confirmPassword", {
              ns: "register",
              defaultValue: "Confirm password",
            })}
            type="password"
            fullWidth
            margin="normal"
            value={form.confirm_password}
            onChange={handleChange("confirm_password")}
          />

          {error && (
            <Typography sx={{ color: "#dc2626", mt: 1, fontSize: 14 }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography sx={{ color: "#16a34a", mt: 1, fontSize: 14 }}>
              {success}
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
              ns: "register",
              defaultValue: "Register",
            })}
          </Button>

          <Typography sx={{ mt: 2.5, color: "#64748b", textAlign: "center" }}>
            {t("haveAccount", {
              ns: "register",
              defaultValue: "Already have an account?",
            })}{" "}
            <Box
              component={RouterLink}
              to="/login"
              sx={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {t("goLogin", {
                ns: "register",
                defaultValue: "Sign in",
              })}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;