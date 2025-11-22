import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Divider,
} from "@mui/material";

const drawerWidth = 240;

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(
    location.pathname === "/admin" ? 0 : -1
  );

  const menuItems = [
    { name: "Admin Home", path: "/admin" },
    { name: "Equipment", path: "/admin/equipment" },
    { name: "Chemical", path: "/admin/chemical" },
    { name: "Practicals", path: "/admin/practicals" },
    { name: "Timetable", path: "/admin/timetable" },
    { name: "Report", path: "/admin/report" },
    { name: "Attendance", path: "/admin/attendance" },
  ];

  const handleNavigation = (item, index) => {
    setActiveIndex(index);
    navigate(item.path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* NAVBAR */}
<AppBar
  position="fixed"
  sx={{
    zIndex: (theme) => theme.zIndex.drawer + 1,
    background: "linear-gradient(90deg, #0d47a1dd, #1976d2dd)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  }}
>

        <Toolbar>
          <Typography variant="h5" noWrap sx={{ fontWeight: "800", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 1, }}>
            Admin Dashboard
          </Typography>

        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#e3f2fd",
            borderRight: "1px solid #ccc",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item, index)}
                  sx={{
                    backgroundColor:
                      activeIndex === index ? "rgba(25, 118, 210, 0.2)" : "inherit",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: activeIndex === index ? "bold" : "medium",
                      color: activeIndex === index ? "#0d47a1" : "#333",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  localStorage.removeItem("admin");
                  navigate("/login");
                }}
                sx={{
                  "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                }}
              >
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ color: "#d32f2f", fontWeight: "bold" }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          p: 3,
          minHeight: "100vh",
          borderRadius: "10px",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
