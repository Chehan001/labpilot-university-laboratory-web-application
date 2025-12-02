import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";

export default function Working() {
  const [hours, setHours] = useState({});
  const [today, setToday] = useState("");
  const [holiday, setHoliday] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/hours")
      .then((res) => {
        console.log("API Response:", res.data);

        // Support both:
        // { hours, today, holiday }
        // AND
        // { data: { hours, today, holiday } }
        const d = res.data.data || res.data;

        if (!d || !d.hours) {
          setError("Invalid data format from server");
          setIsLoading(false);
          return;
        }

        setHours(d.hours || {});
        setToday(d.today || "");
        setHoliday(d.holiday || "");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hours:", err);
        setError("Failed to load working hours.");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!hours || typeof hours !== "object" || Object.keys(hours).length === 0) {
    return (
      <Alert severity="warning">
        Unable to load hours. Please check backend format.
      </Alert>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: 4,
        mt: 4,
        width: "100%",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <Typography
        fontWeight={700}
        fontSize={"2.2rem"}
        color={"#0B3D91"}
        gutterBottom
      >
        Working Hours
      </Typography>

      {holiday ? (
        <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(0,0,255,0.05)" }}>
          <strong>Today is a holiday:</strong> {holiday}
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Today is:</strong> {today}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        {Object.entries(hours).map(([day, time]) => (
          <Box
            key={day}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              mb: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor:
                today === day ? "rgba(25, 118, 210, 0.08)" : "white",
              boxShadow:
                today === day ? "0 4px 12px rgba(25, 118, 210, 0.1)" : "none",
              transition: "0.3s",
            }}
          >
            <AccessTimeIcon
              sx={{
                fontSize: 30,
                color: today === day ? "#1565c0" : "#555",
                mr: 2,
              }}
            />

            <Box>
              <Typography
                fontWeight={600}
                color={today === day ? "#1565c0" : "#333"}
              >
                {day}
              </Typography>
              <Typography>{time}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
