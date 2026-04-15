import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

const drawerWidth = 272;


const menuItems = [
  { text: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/" },
  { text: "Patients", icon: <PeopleAltOutlinedIcon />, path: "/patients" },
  { text: "Appointments", icon: <EventAvailableOutlinedIcon />, path: "/appointments" },
  { text: "Doctors", icon: <LocalHospitalOutlinedIcon />, path: "/doctors" },
  { text: "Schedule", icon: <EventAvailableOutlinedIcon />, path: "/schedule" },
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

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
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
          <Typography sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
            Clinic CRM
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Medical workspace
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
        Navigation
      </Typography>

      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
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
                background: "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.10))",
                color: "#0f172a",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: 15,
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
          Smart clinic flow
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
          Keep patient records, appointments, and doctors in one structured workspace.
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
              <Typography sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
                Clinic Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Manage medical operations efficiently
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
            }}
          >
            <Paper
              sx={{
                px: 2,
                py: 0.7,
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                width: 320,
                borderRadius: 999,
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "none",
              }}
            >
              <SearchIcon sx={{ color: "#64748b", mr: 1 }} />
              <InputBase fullWidth placeholder="Search patients, doctors, appointments..." />
            </Paper>

            <IconButton
              sx={{
                width: 42,
                height: 42,
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.55)",
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </IconButton>

            <Paper
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
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)",
                }}
              >
                A
              </Avatar>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>
                  Admin
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  Reception desk
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
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

export default Layout;