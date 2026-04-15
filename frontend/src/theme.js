import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0f766e",
    },
    secondary: {
      main: "#1d4ed8",
    },
    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },
    success: {
      main: "#16a34a",
    },
    warning: {
      main: "#d97706",
    },
    error: {
      main: "#dc2626",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "1.8rem",
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
  },
});

export default theme;