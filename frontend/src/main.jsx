import "./index.css";
import "./i18n";

import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);