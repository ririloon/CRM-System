import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const drawerWidth = 272;

const menuItems = [
  {
    key: "Dashboard",
    icon: <DashboardOutlinedIcon />,
    path: "/doctor",
    end: true,
  },
  {
    key: "Schedule",
    icon: <EventAvailableOutlinedIcon />,
    path: "/doctor/schedule",
  },
  {
    key: "Patients",
    icon: <PeopleAltOutlinedIcon />,
    path: "/doctor/patients",
  },
  {
    key: "Records",
    icon: <LocalHospitalOutlinedIcon />,
    path: "/doctor/records",
  },
];

const glassSidebarSx = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderRight: "1px solid rgba(255,255,255,0.55)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const glassTopbarSx = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderBottom: "1px solid rgba(255,255,255,0.55)",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
};

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authRole");
  localStorage.removeItem("authUsername");
  localStorage.removeItem("patientDisplayName");
}

function DoctorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["common", "doctorLayout"]);

  const currentUserName = localStorage.getItem("authUsername") || "Doctor";
  const currentUserRole = localStorage.getItem("authRole") || "doctor";

  const currentLang = i18n.language?.startsWith("ky")
    ? "ky"
    : i18n.language?.startsWith("en")
      ? "en"
      : "ru";

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    handleCloseUserMenu();
    clearSession();
    window.location.replace("/login");
  };

  const handleGoToProfile = () => {
    handleCloseUserMenu();
    navigate("/doctor/patients");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        px: 2,
        py: 2,
        display: "flex",
        flexDirection: "column",
        background: `
          radial-gradient(circle at 0% 0%, rgba(15, 118, 110, 0.08), transparent 24%),
          radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.08), transparent 22%),
          rgba(255,255,255,0.74)
        `,
      }}
    >
      <Box
        sx={{
          px: 1,
          pt: 1,
          pb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.16)",
          }}
        >
          C
        </Box>

        <Box>
          <Typography
            sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}
          >
            {t("brand.name", {
              ns: "common",
              defaultValue: "Clinic CRM",
            })}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {t("brand.subtitle", {
              ns: "common",
              defaultValue: "Clinic management system",
            })}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          px: 1.5,
          mb: 1,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {t("nav.section", {
          ns: "doctorLayout",
          defaultValue: "Navigation",
        })}
      </Typography>

      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.key}
            component={NavLink}
            to={item.path}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 3,
              mb: 1,
              px: 1.5,
              py: 1.2,
              color: "#334155",
              "& .MuiListItemIcon-root": {
                minWidth: 40,
                color: "inherit",
              },
              "&.active": {
                background:
                  "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.10))",
                color: "#0f172a",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={t(`nav.${item.key}`, {
                ns: "doctorLayout",
                defaultValue: item.key,
              })}
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: 15,
                textTransform: "capitalize",
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Paper
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 4,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
          {t("promo.title", {
            ns: "doctorLayout",
            defaultValue: "Doctor workspace",
          })}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
          {t("promo.text", {
            ns: "doctorLayout",
            defaultValue:
              "Review appointments, manage patient records, write visit notes, and track medical documents.",
          })}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: `
          radial-gradient(circle at top left, rgba(15,118,110,0.07), transparent 20%),
          radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 18%),
          linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%)
        `,
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ...glassTopbarSx,
          color: "#0f172a",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 72,
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}
              >
                {t("topbar.title", {
                  ns: "doctorLayout",
                  defaultValue: "Doctor workspace",
                })}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {t("topbar.subtitle", {
                  ns: "doctorLayout",
                  defaultValue:
                    "Manage your patients, visits, schedule, and clinical notes",
                })}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                overflow: "hidden",
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.55)",
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

            <Paper
              onClick={handleOpenUserMenu}
              sx={{
                px: 1.2,
                py: 0.8,
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                borderRadius: 999,
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "none",
                cursor: "pointer",
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)",
                }}
              >
                {(currentUserName || "D").charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}
                >
                  {currentUserName}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  {currentUserRole === "doctor"
                    ? t("roles.doctor", {
                        ns: "doctorLayout",
                        defaultValue: "Doctor workspace",
                      })
                    : "Doctor workspace"}
                </Typography>
              </Box>
            </Paper>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleGoToProfile}>
                {t("user.profile", {
                  ns: "doctorLayout",
                  defaultValue: "My patients",
                })}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                {t("user.logout", {
                  ns: "doctorLayout",
                  defaultValue: "Log out",
                })}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              ...glassSidebarSx,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              ...glassSidebarSx,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, md: 3 },
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important" }} />
        <Outlet />
      </Box>
    </Box>
  );
}

export default DoctorLayout;