import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Collapse,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function UserAttendance() {
  const [attendanceByLab, setAttendanceByLab] = useState({});
  const [expandedLabs, setExpandedLabs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
          setError("User profile not found");
          setLoading(false);
          return;
        }

        const regNo = userDoc.data().regNo;
        const q = query(collection(db, "attendance"), where("regNo", "==", regNo));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Calculate stats
        const totalRecords = data.length;
        const presentCount = data.filter((item) => item.present).length;
        const absentCount = totalRecords - presentCount;

        setStats({
          total: totalRecords,
          present: presentCount,
          absent: absentCount,
        });

        // Group by --> lab name
        const grouped = {};
        data.forEach((item) => {
          if (!grouped[item.lab]) grouped[item.lab] = [];
          grouped[item.lab].push(item);
        });

        // Sort --> each lab's records by date (newest first)
        Object.keys(grouped).forEach((lab) => {
          grouped[lab].sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        setAttendanceByLab(grouped);

        // Auto-expand --> all labs initially
        const expanded = {};
        Object.keys(grouped).forEach((lab) => {
          expanded[lab] = true;
        });
        setExpandedLabs(expanded);
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const toggleLab = (labName) => {
    setExpandedLabs((prev) => ({
      ...prev,
      [labName]: !prev[labName],
    }));
  };

  const getLabStats = (records) => {
    const total = records.length;
    const present = records.filter((r) => r.present).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, percentage };
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return "#4caf50";
    if (percentage >= 50) return "#ff9800";
    return "#ef5350";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        ml: { xs: 0, lg: "72px" },
        pt: { xs: "64px", lg: 0 },
        transition: "margin 0.3s ease",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: "1400px",
          mx: "auto",
        }}
      >

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={48} sx={{ color: "#667eea" }} />
              <Typography sx={{ mt: 2, color: "#666" }}>Loading your records...</Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && stats.total === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: "center",
              border: "2px dashed #e0e0e0",
              background: "white",
            }}
          >
            <SchoolIcon sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No Attendance Records Yet
            </Typography>
            <Typography sx={{ color: "#666" }}>
              Your attendance will appear here once marked
            </Typography>
          </Paper>
        )}

        {!loading && stats.total > 0 && (
          <>
            {/* Stats Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 3,
                mb: 4,
              }}
            >
              {/* Total Sessions */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #10247bff 0%, #9abde8ff 100%)",
                  color: "white",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    filter: "blur(30px)",
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <SchoolIcon sx={{ fontSize: 24 }} />
                    <Typography sx={{ fontSize: "0.9rem", opacity: 0.9 }}>
                      Total Sessions
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>

              {/* Present */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #09643eff 0%, #aae4adff 100%)",
                  color: "white",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    filter: "blur(30px)",
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 24 }} />
                    <Typography sx={{ fontSize: "0.9rem", opacity: 0.9 }}>
                      Present
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats.present}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", opacity: 0.9, mt: 0.5 }}>
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% attendance
                  </Typography>
                </CardContent>
              </Card>

              {/* Absent */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #cf100dff 0%, #ebaea8ff 100%)",
                  color: "white",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    filter: "blur(30px)",
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CancelIcon sx={{ fontSize: 24 }} />
                    <Typography sx={{ fontSize: "0.9rem", opacity: 0.9 }}>
                      Absent
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats.absent}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Lab-wise Attendance */}
            <Box sx={{ display: "grid", gap: 3 }}>
              {Object.keys(attendanceByLab).map((labName) => {
                const records = attendanceByLab[labName];
                const labStats = getLabStats(records);
                const statusColor = getStatusColor(labStats.percentage);
                const isExpanded = expandedLabs[labName];

                return (
                  <Paper
                    key={labName}
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {/* Lab Header */}
                    <Box
                      onClick={() => toggleLab(labName)}
                      sx={{
                        p: 3,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            <SchoolIcon />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                              {labName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              {labStats.present} / {labStats.total} sessions attended
                            </Typography>
                          </Box>
                        </Box>

                        {/* Progress Bar */}
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#666" }}>
                              Attendance Rate
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: statusColor }}
                            >
                              {labStats.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={labStats.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                          label={`${labStats.percentage}%`}
                          size="small"
                          sx={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                            fontWeight: 700,
                            border: `2px solid ${statusColor}`,
                          }}
                        />
                        {isExpanded ? (
                          <ExpandLessIcon sx={{ fontSize: 28, color: "#666" }} />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 28, color: "#666" }} />
                        )}
                      </Box>
                    </Box>

                    {/* Records List */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ p: 3, backgroundColor: "#fafafa" }}>
                        <Box sx={{ display: "grid", gap: 2 }}>
                          {records.map((record) => (
                            <Box
                              key={record.id}
                              sx={{
                                p: 2.5,
                                borderRadius: 3,
                                background: "white",
                                border: "1px solid #e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  transform: "translateX(4px)",
                                },
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>                
                                <Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                                    <CalendarIcon sx={{ fontSize: 16, color: "#666" }} />
                                    <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                                      {record.date}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <ScheduleIcon sx={{ fontSize: 16, color: "#666" }} />
                                    <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                                      {record.time}
                                    </Typography>
                                    <Chip
                                      label={`Batch ${record.badge}`}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.75rem",
                                        backgroundColor: "#667eea20",
                                        color: "#667eea",
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Box>

                              <Chip
                                label={record.present ? "Present" : "Absent"}
                                sx={{
                                  fontWeight: 700,
                                  backgroundColor: record.present ? "#4caf50" : "#e40e0aff",
                                  color: "white",
                                  minWidth: 80,
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}