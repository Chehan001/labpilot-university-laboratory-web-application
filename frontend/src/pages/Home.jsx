import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { Box, Typography, CircularProgress } from "@mui/material";
import UserNavBar from "../pages/UserNavBar";
import Working from "../pages/Working";
import UserProfile from "../pages/UserProfile";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <CircularProgress size={40} sx={{ color: "#667eea" }} />
      </Box>
    );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #bacff0ff 25%, #2665ccff 75%)",
      }}
    >
      <Box
        sx={{
          ml: { xs: 0, md: "260px" },
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
          transition: "margin 0.3s ease",
        }}
      >

        {/* Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 400px",
            },
            gap: 4,
            alignItems: "start",
          }}
        >
          {user && <UserProfile />}
          <Working />
        </Box>
      </Box>
    </Box>
  );
}