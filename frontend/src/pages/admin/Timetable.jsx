import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Divider,
  Stack,
  InputAdornment,
  Chip,
  Alert,
  Fade,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import BadgeIcon from "@mui/icons-material/Badge";
import ScienceIcon from "@mui/icons-material/Science";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";

export default function Timetable() {
  const [tabIndex, setTabIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [badge, setBadge] = useState("");
  const [lab, setLab] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [searchLab, setSearchLab] = useState("");
  const [searchBadge, setSearchBadge] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const handleAddSlot = async () => {
    if (!badge || !lab || !day || !startTime || !endTime) {
      alert("Please complete all fields.");
      return;
    }

    await addDoc(collection(db, "timetable"), {
      badge,
      lab,
      day,
      startTime,
      endTime,
      createdAt: new Date(),
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    setBadge("");
    setLab("");
    setDay("");
    setStartTime("");
    setEndTime("");
  };

  const fetchLabTimetable = async () => {
    if (!searchLab.trim()) {
      alert("Please enter a lab name to search.");
      return;
    }
    const q = query(collection(db, "timetable"), where("lab", "==", searchLab));
    const snapshot = await getDocs(q);
    setTimeSlots(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setHasSearched(true);
  };

  const fetchBadgeTimetable = async () => {
    if (!searchBadge.trim()) {
      alert("Please enter a badge number to search.");
      return;
    }
    const q = query(
      collection(db, "timetable"),
      where("badge", "==", searchBadge)
    );
    const snapshot = await getDocs(q);
    setTimeSlots(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setHasSearched(true);
  };

  const dayColors = {
    Monday: { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
    Tuesday: { bg: "#FCE4EC", text: "#C2185B", border: "#F48FB1" },
    Wednesday: { bg: "#E8F5E9", text: "#2E7D32", border: "#81C784" },
    Thursday: { bg: "#FFF3E0", text: "#EF6C00", border: "#FFB74D" },
    Friday: { bg: "#F3E5F5", text: "#7B1FA2", border: "#CE93D8" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 1 }}>
              <EventNoteIcon sx={{ fontSize: 40, color: "rgba(94, 92, 92, 0.9)" }} />
              <Typography
                variant="h3"
                sx={{
                  color: "rgba(94, 92, 92, 0.9)",
                  fontWeight: 700,
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Timetable Management
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: "#546e7a", fontSize: "1.1rem" }}>
              Schedule and track laboratory time slots efficiently
            </Typography>
          </Box>

          {/* Success Alert */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  severity="success"
                  icon={<CheckCircleOutlineIcon />}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                    fontWeight: 600,
                  }}
                >
                  Time slot added successfully!
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={(e, v) => setTabIndex(v)}
              variant="fullWidth"
              TabIndicatorProps={{
                style: {
                  height: 4,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                },
              }}
              sx={{
                background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                "& .MuiTab-root": {
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  fontWeight: 700,
                  textTransform: "none",
                  color: "rgba(255,255,255,0.7)",
                  py: 2.5,
                  transition: "all 0.3s",
                  "&:hover": {
                    color: "rgba(255,255,255,0.95)",
                    background: "rgba(255,255,255,0.1)",
                  },
                  "&.Mui-selected": {
                    color: "#fff",
                    background: "rgba(255,255,255,0.15)",
                  },
                },
              }}
            >
              <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Add Time Slot" />
              <Tab icon={<SearchIcon />} iconPosition="start" label="Show Timetable" />
            </Tabs>

            {/* ADD TIME SLOT */}
            {tabIndex === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box sx={{ p: { xs: 3, md: 5 }, background: "#fafafa" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "white",
                      border: "1px solid #e0e0e0",
                      maxWidth: 700,
                      mx: "auto",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AddCircleOutlineIcon sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" fontWeight={700} color="#2c3e50">
                        Add New Time Slot
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                      {/* Badge */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Badge Number"
                          fullWidth
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          placeholder="Enter staff badge number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />
                      </Grid>

                      {/* Lab */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Laboratory Name"
                          fullWidth
                          value={lab}
                          onChange={(e) => setLab(e.target.value)}
                          placeholder="e.g., Chemistry Lab A"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ScienceIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />
                      </Grid>

                      {/* Day */}
                      <Grid item xs={12}>
                        <TextField
                          select
                          label="Select Day"
                          fullWidth
                          value={day}
                          onChange={(e) => setDay(e.target.value)}
                          helperText={!day ? "Please select a day to continue" : ""}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        >
                          {days.map((d) => (
                            <MenuItem key={d} value={d}>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background: dayColors[d].text,
                                  }}
                                />
                                <Typography fontWeight={500}>{d}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Start Time */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="time"
                          label="Start Time"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />
                      </Grid>

                      {/* End Time */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="time"
                          label="End Time"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* BUTTON */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{
                          mt: 4,
                          py: 1.8,
                          borderRadius: 14,
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          textTransform: "none",
                          background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                          transition: "all 0.3s",
                          "&:hover": {
                            background: "linear-gradient(90deg, #1565c0, #1976d2)",
                            boxShadow: "0 6px 30px rgba(25, 118, 210, 0.5)",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={handleAddSlot}
                      >
                        Add Time Slot
                      </Button>
                    </motion.div>
                  </Paper>
                </Box>
              </motion.div>
            )}

            {/* SHOW TIMETABLE */}
            {tabIndex === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box sx={{ p: { xs: 3, md: 5 }, background: "#fafafa" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "white",
                      border: "1px solid #e0e0e0",
                      mb: 4,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SearchIcon sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" fontWeight={700} color="#2c3e50">
                        Search Timetable
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                      {/* Search Lab */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Search by Lab Name"
                          fullWidth
                          value={searchLab}
                          onChange={(e) => setSearchLab(e.target.value)}
                          placeholder="Enter lab name"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ScienceIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SearchIcon />}
                            sx={{
                              py: 1.5,
                              borderRadius: 14,
                              fontWeight: 600,
                              fontSize: "1rem",
                              textTransform: "none",
                              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                              transition: "all 0.3s",
                              "&:hover": {
                                background: "linear-gradient(90deg, #1565c0, #1976d2)",
                                boxShadow: "0 6px 30px rgba(25, 118, 210, 0.5)",
                              },
                            }}
                            onClick={fetchLabTimetable}
                          >
                            Search by Lab
                          </Button>
                        </motion.div>
                      </Grid>

                      {/* Search Badge */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Search by Badge"
                          fullWidth
                          value={searchBadge}
                          onChange={(e) => setSearchBadge(e.target.value)}
                          placeholder="Enter badge number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SearchIcon />}
                            sx={{
                              py: 1.5,
                              borderRadius: 14,
                              fontWeight: 600,
                              fontSize: "1rem",
                              textTransform: "none",
                              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                              transition: "all 0.3s",
                              "&:hover": {
                                background: "linear-gradient(90deg, #1565c0, #1976d2)",
                                boxShadow: "0 6px 30px rgba(25, 118, 210, 0.5)",
                              },
                            }}
                            onClick={fetchBadgeTimetable}
                          >
                            Search by Badge
                          </Button>
                        </motion.div>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Timetable Results */}
                  {hasSearched && (
                    <Fade in={hasSearched}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          border: "1px solid #e0e0e0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                              background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                            p: 2.5,
                          }}
                        >
                          <Typography variant="h6" fontWeight={700} color="white">
                            Timetable Results
                          </Typography>
                        </Box>

                        <CardContent sx={{ p: 0 }}>
                          {timeSlots.length === 0 ? (
                            <Box sx={{ p: 6, textAlign: "center" }}>
                              <SearchIcon sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                                No records found
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Try searching with a different lab name or badge number
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ overflowX: "auto" }}>
                              <Table>
                                <TableHead>
                                  <TableRow sx={{ background: "#f5f5f5" }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#2c3e50" }}>
                                      Day
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#2c3e50" }}>
                                      Badge
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#2c3e50" }}>
                                      Lab
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#2c3e50" }}>
                                      Start
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#2c3e50" }}>
                                      End
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {timeSlots.map((slot, index) => (
                                    <motion.tr
                                      key={slot.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      component={TableRow}
                                      sx={{
                                        borderLeft: `4px solid ${dayColors[slot.day]?.border}`,
                                        backgroundColor: dayColors[slot.day]?.bg,
                                        transition: "all 0.3s",
                                        "&:hover": {
                                          transform: "translateX(4px)",
                                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        },
                                      }}
                                    >
                                      <TableCell>
                                        <Chip
                                          label={slot.day}
                                          size="small"
                                          sx={{
                                            backgroundColor: "white",
                                            color: dayColors[slot.day]?.text,
                                            fontWeight: 700,
                                            border: `2px solid ${dayColors[slot.day]?.border}`,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>{slot.badge}</TableCell>
                                      <TableCell>{slot.lab}</TableCell>
                                      <TableCell sx={{ fontWeight: 500 }}>{slot.startTime}</TableCell>
                                      <TableCell sx={{ fontWeight: 500 }}>{slot.endTime}</TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Fade>
                  )}
                </Box>
              </motion.div>
            )}
          </Paper>
        </Box>
      </motion.div>
    </Box>
  );
}