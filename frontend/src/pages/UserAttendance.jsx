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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
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
        const q = query(
          collection(db, "attendance"),
          where("regNo", "==", regNo)
        );
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

        // Group by lab name
        const grouped = {};
        data.forEach((item) => {
          if (!grouped[item.lab]) grouped[item.lab] = [];
          grouped[item.lab].push(item);
        });

        // Sort each lab's records by date (newest first)
        Object.keys(grouped).forEach((lab) => {
          grouped[lab].sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        setAttendanceByLab(grouped);

        // Auto-expand all labs initially
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
        background: "linear-gradient(135deg, #b1dbeeff 0%, #1531baff 100%)",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: 8,
            }}
          >
            <CircularProgress size={60} sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff" }}>
              Loading your records...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && stats.total === 0 && (
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              textAlign: "center",
              background: "rgba(255,255,255,0.95)",
              borderRadius: 10,
            }}
          >
            <SchoolIcon sx={{ fontSize: 80, color: "#667eea", mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              No Attendance Records Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your attendance will appear here once marked
            </Typography>
          </Paper>
        )}

        {!loading && stats.total > 0 && (
          <>
            {/* Stats Cards - Responsive Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: { xs: 1.5, sm: 2, md: 3 },
                mb: { xs: 2, sm: 3, md: 4 },
              }}
            >

              {/* Total Sessions */}
              <Card
                elevation={4}
                sx={{
                  background: "linear-gradient(135deg, #7eabf3ff 0%, #314bdaff 100%)",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 3 },
                    "&:last-child": { pb: { xs: 1.5, sm: 2, md: 3 } },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          mb: 0.5,
                          fontSize: { xs: "1.5rem", sm: "1.5rem" },
                        }}
                      >
                        Total Sessions
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                        }}
                      >
                        {stats.total}
                      </Typography>
                    </Box>
                    <CalendarIcon
                      sx={{
                        fontSize: { xs: 32, sm: 40, md: 48 },
                        opacity: 0.3,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Present */}
              <Card
                elevation={4}
                sx={{
                  background: "linear-gradient(135deg, #7ee982ff 0%, #388e3c 100%)",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 3 },
                    "&:last-child": { pb: { xs: 1.5, sm: 2, md: 3 } },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          mb: 0.5,
                          fontSize: { xs: "1.5rem", sm: "1.5rem" },
                        }}
                      >
                        Present
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                        }}
                      >
                        {stats.present}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.9,
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        }}
                      >
                        {stats.total > 0
                          ? Math.round((stats.present / stats.total) * 100)
                          : 0}
                        % attendance
                      </Typography>
                    </Box>
                    <CheckCircleIcon
                      sx={{
                        fontSize: { xs: 32, sm: 40, md: 48 },
                        opacity: 0.3,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Absent */}
              <Card
                elevation={4}
                sx={{
                  background: "linear-gradient(135deg, #f78280ff 0%, #c62828 100%)",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 3 },
                    "&:last-child": { pb: { xs: 1.5, sm: 2, md: 3 } },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          mb: 0.5,
                          fontSize: { xs: "1.5rem", sm: "1.5rem" },
                        }}
                      >
                        Absent
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                        }}
                      >
                        {stats.absent}
                      </Typography>
                    </Box>
                    <CancelIcon
                      sx={{
                        fontSize: { xs: 32, sm: 40, md: 48 },
                        opacity: 0.3,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Lab-wise Attendance */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
              {Object.keys(attendanceByLab).map((labName) => {
                const records = attendanceByLab[labName];
                const labStats = getLabStats(records);
                const statusColor = getStatusColor(labStats.percentage);
                const isExpanded = expandedLabs[labName];

                return (
                  <Paper
                    key={labName}
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.95)",
                    }}
                  >
                    {/* Lab Header */}
                    <Box
                      onClick={() => toggleLab(labName)}
                      sx={{
                        p: { xs: 2, sm: 2.5, md: 3 },
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: { xs: 1, sm: 2 },
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.05)",
                        },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          gutterBottom
                          sx={{
                            color: "#667eea",
                            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                            wordBreak: "break-word",
                          }}
                        >
                          {labName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          {labStats.present} / {labStats.total} sessions attended
                        </Typography>

                        {/* Progress Bar */}
                        <Box sx={{ mt: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                            >
                              Attendance Rate
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{
                                color: statusColor,
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              }}
                            >
                              {labStats.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={labStats.percentage}
                            sx={{
                              height: { xs: 6, sm: 8 },
                              borderRadius: 1,
                              backgroundColor: "rgba(0,0,0,0.1)",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: statusColor,
                                borderRadius: 1,
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1, sm: 2 },
                          flexShrink: 0,
                        }}
                      >
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`${labStats.percentage}%`}
                          size="small"
                          sx={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                            fontWeight: 700,
                            border: `2px solid ${statusColor}`,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          }}
                        />
                        {isExpanded ? (
                          <ExpandLessIcon sx={{ color: "#667eea" }} />
                        ) : (
                          <ExpandMoreIcon sx={{ color: "#667eea" }} />
                        )}
                      </Box>
                    </Box>

                    {/* Records List */}
                    <Collapse in={isExpanded}>
                      <Box
                        sx={{
                          p: { xs: 1.5, sm: 2, md: 3 },
                          pt: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: { xs: 1, sm: 1.5 },
                        }}
                      >
                        {records.map((record) => (
                          <Box
                            key={record.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: { xs: 1.5, sm: 2 },
                              borderRadius: 2,
                              backgroundColor: record.present
                                ? "rgba(76, 175, 80, 0.08)"
                                : "rgba(239, 83, 80, 0.08)",
                              border: record.present
                                ? "1px solid rgba(76, 175, 80, 0.2)"
                                : "1px solid rgba(239, 83, 80, 0.2)",
                              gap: { xs: 1, sm: 2 },
                              flexWrap: { xs: "wrap", sm: "nowrap" },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1, sm: 1.5 },
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {record.present ? (
                                <CheckCircleIcon
                                  sx={{
                                    color: "#4caf50",
                                    fontSize: { xs: 20, sm: 24 },
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <CancelIcon
                                  sx={{
                                    color: "#ef5350",
                                    fontSize: { xs: 20, sm: 24 },
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                  }}
                                >
                                  {record.date}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  }}
                                >
                                  {record.time}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={record.present ? "Present" : "Absent"}
                              size="small"
                              sx={{
                                backgroundColor: record.present
                                  ? "#4caf50"
                                  : "#ef5350",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                flexShrink: 0,
                              }}
                            />
                          </Box>
                        ))}
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