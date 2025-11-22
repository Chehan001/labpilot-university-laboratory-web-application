import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";

export default function AdminHome() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        backgroundColor: "#f5f5f5",
        padding: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 5,
          borderRadius: 4,
          maxWidth: 2000,
          textAlign: "center",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 2, color: "#333333", fontWeight: 500 }}
        >
          Welcome to Admin Home
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "#555555" }}>
          Easily manage users, monitor reports, and handle all admin tasks
          efficiently.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Get Started
        </Button>
      </Paper>
    </Box>
  );
}
