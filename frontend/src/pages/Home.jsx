import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { Box, Typography, Paper, Alert } from "@mui/material";
import UserNavBar from "../pages/UserNavBar";
import Working from "../pages/Working";

export default function Home() {
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState(
    "No special notices at the moment."
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <UserNavBar />

      <Box sx={{ ml: "260px", p: 4, width: "100%" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Home
        </Typography>

       

        {/* ROW: Notice (left) + Working Hours (right) */}
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {/* NOTICE CARD */}
          <Paper
            sx={{
              p: 3,
              width: "100%",
              maxWidth: "500px",
              borderRadius: 3,
              background: "#fff",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Special Notice
            </Typography>
            <Typography sx={{ color: "#555" }}>{notice}</Typography>
          </Paper>

          {/* WORKING HOURS CARD */}
          <Working />
        </Box>
      </Box>
    </Box>
  );
}
