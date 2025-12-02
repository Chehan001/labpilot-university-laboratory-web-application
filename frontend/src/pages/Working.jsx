import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { db } from "../firebase/config"; 
import { doc, getDoc } from "firebase/firestore";

export default function Working() {
  const [hours, setHours] = useState({});
  const [today, setToday] = useState("");
  const [holiday, setHoliday] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const docRef = doc(db, "workingHours", "hours"); //  path --> Firestore (db)
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setHours(data);

          // Correct today mapping
          const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          const todayIndex = new Date().getDay();
          const todayName = dayNames[todayIndex];
          setToday(todayName);

          //  holiday --> Automatic detection
          const todayHoliday = data[todayName] === "Closed" ? "Closed" : data.holiday || "";
          setHoliday(todayHoliday);
        } else {
          setError("No working hours found in Firestore");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch working hours");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHours();
  }, []);

  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
      <CircularProgress size={32} />
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;

  if (!hours || Object.keys(hours).length === 0) {
    return <Alert severity="warning">Unable to load hours. Check Firestore.</Alert>;
  }

  // Display ---> days in desired order
  const displayDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  return (
    <Paper
      elevation={4}
      sx={{ p: 4, borderRadius: 4, mt: 4, width: "75%", maxWidth: "400px", margin: "auto" }}
    >
      <Typography fontWeight={700} fontSize={"2.2rem"} color={"#0B3D91"} gutterBottom>
        Working Hours
      </Typography>

      {holiday ? (
        <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(0,0,255,0.05)" }}>
          <strong>Today is:</strong> {holiday === "Closed" ? "Closed" : holiday}
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Today is:</strong> {today}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        {displayDays.map((day) => (
          <Box
            key={day}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              mb: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: today === day ? "rgba(25, 118, 210, 0.08)" : "white",
              boxShadow: today === day ? "0 4px 12px rgba(25, 118, 210, 0.1)" : "none",
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
              <Typography fontWeight={600} color={today === day ? "#1565c0" : "#333"}>
                {day}
              </Typography>
              <Typography>{hours[day]}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
