import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BadgeIcon from "@mui/icons-material/Badge";
import ScienceIcon from "@mui/icons-material/Science";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";

export default function Attendance() {
  const [tabIndex, setTabIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ADD STUDENTS ----> FROM EXCEL */
  const [excelStudents, setExcelStudents] = useState([]);

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      setExcelStudents(sheetData);
    };

    reader.readAsBinaryString(file);
  };

  const handleSaveExcelStudents = async () => {
    if (excelStudents.length === 0) {
      alert("Upload Excel file first!");
      return;
    }

    for (let s of excelStudents) {
      await addDoc(collection(db, "students"), {
        regNo: s.regNo,
        name: s.name,
        badge: s.badge,
      });
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setExcelStudents([]);
  };

  /* MARK ATTENDANCE */
  const [labName, setLabName] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [studentsList, setStudentsList] = useState([]);
  const [attendanceTick, setAttendanceTick] = useState({});

  const loadStudentsForAttendance = async () => {
    if (!labName || !badgeName) {
      alert("Enter lab and badge!");
      return;
    }

    const q = query(collection(db, "students"), where("badge", "==", badgeName));
    const snap = await getDocs(q);

    let result = [];
    snap.forEach((doc) => result.push(doc.data()));

    setStudentsList(result);

    let tickObj = {};
    result.forEach((s) => {
      tickObj[s.regNo] = false;
    });

    setAttendanceTick(tickObj);
  };

  const handleTick = (regNo) => {
    setAttendanceTick({
      ...attendanceTick,
      [regNo]: !attendanceTick[regNo],
    });
  };

  const saveMarkedAttendance = async () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toLocaleTimeString();

    for (let s of studentsList) {
      if (attendanceTick[s.regNo] === true) {
        await addDoc(collection(db, "attendance"), {
          regNo: s.regNo,
          name: s.name,
          badge: s.badge,
          lab: labName,
          date,
          time,
          present: true,
        });
      }
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setStudentsList([]);
    setAttendanceTick({});
  };

  /* SHOW SUMMARY TAB   */
  const [sumReg, setSumReg] = useState("");
  const [studentSummary, setStudentSummary] = useState([]);

  const loadStudentSummary = async () => {
    if (!sumReg) return;

    const q = query(collection(db, "attendance"), where("regNo", "==", sumReg));
    const snap = await getDocs(q);

    let result = [];
    snap.forEach((doc) => result.push({ id: doc.id, ...doc.data() }));

    setStudentSummary(result);
  };

  const [sumBadge, setSumBadge] = useState("");
  const [sumLab, setSumLab] = useState("");
  const [badgeSummary, setBadgeSummary] = useState([]);

  const loadBadgeSummary = async () => {
    if (!sumBadge || !sumLab) return;

    const q = query(
      collection(db, "attendance"),
      where("badge", "==", sumBadge),
      where("lab", "==", sumLab)
    );

    const snap = await getDocs(q);

    let result = [];
    snap.forEach((doc) => result.push({ id: doc.id, ...doc.data() }));

    setBadgeSummary(result);
  };

  /* UI HELPERS */
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
  };

  const tabConfig = [
    {
      label: "Add Students",
      icon: <PersonAddIcon />,
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #3ea0efff 0%, #42a5f5 100%)",
    },
    {
      label: "Mark Attendance",
      icon: <HowToRegIcon />,
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #3ea0efff 0%, #42a5f5 100%)",
    },
    {
      label: "View Summary",
      icon: <AssessmentIcon />,
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #3ea0efff 0%, #42a5f5 100%)",
    },
  ];

  const renderCard = (title, icon, gradient, children) => (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" exit="exit">
      <Card
        elevation={0}
        sx={{
          maxWidth: 800,
          mx: "auto",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            background: gradient,
            p: 3,
            color: "white",
            borderRadius: "16px 16px 0 0",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              {icon}
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
          </Stack>
        </Box>

        <CardContent sx={{ p: 4 }}>{children}</CardContent>
      </Card>
    </motion.div>
  );

  const renderTextField = (label, value, onChange, icon, placeholder = "") => (
    <TextField
      label={label}
      fullWidth
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      }}
      sx={{
        mb: 2.5,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          transition: "all 0.3s",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
          "&.Mui-focused": {
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.2)",
          },
        },
      }}
    />
  );

  const renderButton = (onClick, label, gradient, icon = <CheckCircleOutlineIcon />) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        fullWidth
        variant="contained"
        onClick={onClick}
        startIcon={icon}
        sx={{
          py: 1.8,
          borderRadius: 14,
          textTransform: "none",
          fontSize: "1.05rem",
          fontWeight: 600,
          background: gradient,
          background: "linear-gradient(90deg, #1976d2, #42a5f5)",
          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",

          "&:hover": {
            background: "linear-gradient(90deg, #1565c0, #1976d2)",
            boxShadow: "0 6px 30px rgba(25, 118, 210, 0.5)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {label}
      </Button>
    </motion.div>
  );

  const presentCount = Object.values(attendanceTick).filter(Boolean).length;

  /* UI */
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
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                color: "rgba(94, 92, 92, 0.9)",
                fontWeight: 700,
                mb: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              Attendance System
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(94, 92, 92, 0.9)" }}>
              Track and manage student attendance efficiently
            </Typography>
          </Box>

          {/* Success Alert */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    maxWidth: 800,
                    mx: "auto",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                  }}
                  icon={<CheckCircleOutlineIcon />}
                >
                  <Typography fontWeight={600}>Successfully saved!</Typography>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={(e, v) => setTabIndex(v)}
              variant="fullWidth"
              sx={{
                background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", md: "0.95rem" },
                  py: 2.5,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "rgba(255,255,255,0.95)",
                    background: "rgba(255,255,255,0.1)",
                  },
                },
                "& .Mui-selected": {
                  color: "#fff !important",
                  background: "rgba(255,255,255,0.2)",
                },
                "& .MuiTabs-indicator": {
                  height: 4,
                  backgroundColor: "#fff",
                  borderRadius: "4px 4px 0 0",
                },
              }}
            >
              {tabConfig.map((tab, idx) => (
                <Tab key={idx} icon={tab.icon} iconPosition="start" label={tab.label} />
              ))}
            </Tabs>

            <Box sx={{ p: { xs: 2, md: 5 }, minHeight: 500, background: "#fafafa" }}>
              <AnimatePresence mode="wait">
                {/* ADD STUDENTS */}
                {tabIndex === 0 &&
                  renderCard(
                    "Upload Student Details",
                    <UploadFileIcon sx={{ fontSize: 28 }} />,
                    tabConfig[0].gradient,
                    <>
                      <Box
                        sx={{
                          border: "2px dashed #667eea",
                          borderRadius: 3,
                          p: 4,
                          textAlign: "center",
                          mb: 3,
                          cursor: "pointer",
                          transition: "all 0.3s",
                          "&:hover": {
                            background: "rgba(102, 126, 234, 0.05)",
                            borderColor: "#764ba2",
                          },
                        }}
                      >
                        <UploadFileIcon sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
                        <Typography variant="h6" fontWeight={600} mb={1}>
                          Upload Excel File
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Select an Excel file containing student information
                        </Typography>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleExcelUpload}
                          style={{ display: "none" }}
                          id="excel-upload"
                        />
                        <label htmlFor="excel-upload">
                          <Button variant="contained" component="span" sx={{
                            borderRadius: 14,
                            background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                            boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                            "&:hover": {
                              background: "linear-gradient(90deg, #1565c0, #1976d2)",
                              boxShadow: "0 6px 30px rgba(25, 118, 210, 0.5)",
                              transform: "translateY(-2px)",
                            },
                          }}>
                            Choose File
                          </Button>
                        </label>
                      </Box>

                      {excelStudents.length > 0 && (
                        <>
                          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography fontWeight={600} variant="h6">
                              Preview
                            </Typography>
                            <Chip
                              label={`${excelStudents.length} students`}
                              color="primary"
                              size="small"
                            />
                          </Box>

                          <Box sx={{ maxHeight: 400, overflow: "auto", mb: 3 }}>
                            {excelStudents.map((s, i) => (
                              <Paper
                                key={i}
                                sx={{
                                  p: 2,
                                  mb: 1.5,
                                  borderRadius: 2,
                                  border: "1px solid #e0e0e0",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <Stack direction="row" spacing={3}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Reg No
                                    </Typography>
                                    <Typography fontWeight={600}>{s.regNo}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Name
                                    </Typography>
                                    <Typography fontWeight={600}>{s.name}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Badge
                                    </Typography>
                                    <Chip label={s.badge} size="small" color="primary" />
                                  </Box>
                                </Stack>
                              </Paper>
                            ))}
                          </Box>

                          {renderButton(
                            handleSaveExcelStudents,
                            "Save All Students",
                            tabConfig[0].gradient
                          )}
                        </>
                      )}
                    </>
                  )}

                {/* MARK ATTENDANCE */}
                {tabIndex === 1 &&
                  renderCard(
                    "Mark Attendance",
                    <HowToRegIcon sx={{ fontSize: 28 }} />,
                    tabConfig[1].gradient,
                    <>
                      {renderTextField(
                        "Laboratory Name",
                        labName,
                        (e) => setLabName(e.target.value),
                        <ScienceIcon color="action" />,
                        "e.g., Chemistry Lab A"
                      )}

                      {renderTextField(
                        "Badge Number",
                        badgeName,
                        (e) => setBadgeName(e.target.value),
                        <BadgeIcon color="action" />,
                        "Enter badge identifier"
                      )}

                      {renderButton(
                        loadStudentsForAttendance,
                        "Load Students",
                        tabConfig[1].gradient,
                        <SearchIcon />
                      )}

                      {studentsList.length > 0 && (
                        <>
                          <Divider sx={{ my: 3 }} />

                          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography fontWeight={600} variant="h6">
                              Students
                            </Typography>
                            <Chip
                              label={`${presentCount}/${studentsList.length} present`}
                              color="success"
                              size="small"
                            />
                          </Box>

                          <Box sx={{ maxHeight: 400, overflow: "auto", mb: 3 }}>
                            {studentsList.map((s) => (
                              <Paper
                                key={s.regNo}
                                sx={{
                                  p: 2,
                                  mb: 1.5,
                                  borderRadius: 2,
                                  border: attendanceTick[s.regNo]
                                    ? "2px solid #4caf50"
                                    : "1px solid #e0e0e0",
                                  background: attendanceTick[s.regNo]
                                    ? "rgba(76, 175, 80, 0.05)"
                                    : "white",
                                  transition: "all 0.2s",
                                  cursor: "pointer",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                }}
                                onClick={() => handleTick(s.regNo)}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={attendanceTick[s.regNo]}
                                      onChange={() => handleTick(s.regNo)}
                                      sx={{
                                        "& .MuiSvgIcon-root": { fontSize: 28 },
                                      }}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography fontWeight={600} variant="body1">
                                        {s.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {s.regNo}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </Paper>
                            ))}
                          </Box>

                          {renderButton(
                            saveMarkedAttendance,
                            "Save Attendance",
                            tabConfig[1].gradient
                          )}
                        </>
                      )}
                    </>
                  )}

                {/* VIEW SUMMARY */}
                {tabIndex === 2 &&
                  renderCard(
                    "View Attendance Summary",
                    <AssessmentIcon sx={{ fontSize: 28 }} />,
                    tabConfig[2].gradient,
                    <>
                      {/* Student Summary */}
                      <Typography fontWeight={600} variant="h6" mb={2}>
                        Search by Student
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={8}>
                          {renderTextField(
                            "Registration Number",
                            sumReg,
                            (e) => setSumReg(e.target.value),
                            <BadgeIcon color="action" />,
                            "Enter student reg number"
                          )}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          {renderButton(
                            loadStudentSummary,
                            "Search",
                            tabConfig[2].gradient,
                            <SearchIcon />
                          )}
                        </Grid>
                      </Grid>

                      {studentSummary.length > 0 && (
                        <Paper
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            mb: 4,
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Table>
                            <TableHead>
                              <TableRow sx={{ background: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Lab</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {studentSummary.map((row) => (
                                <TableRow key={row.id}>
                                  <TableCell>{row.date}</TableCell>
                                  <TableCell>{row.time}</TableCell>
                                  <TableCell>{row.lab}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={row.present ? "Present" : "Absent"}
                                      color={row.present ? "success" : "error"}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      )}

                      <Divider sx={{ my: 4 }} />

                      {/* Badge Summary */}
                      <Typography fontWeight={600} variant="h6" mb={2}>
                        Search by Badge & Lab
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={5}>
                          {renderTextField(
                            "Badge",
                            sumBadge,
                            (e) => setSumBadge(e.target.value),
                            <BadgeIcon color="action" />
                          )}
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          {renderTextField(
                            "Lab Name",
                            sumLab,
                            (e) => setSumLab(e.target.value),
                            <ScienceIcon color="action" />
                          )}
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          {renderButton(
                            loadBadgeSummary,
                            "Search",
                            tabConfig[2].gradient,
                            <SearchIcon />
                          )}
                        </Grid>
                      </Grid>

                      {badgeSummary.length > 0 && (
                        <Paper
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Table>
                            <TableHead>
                              <TableRow sx={{ background: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: 600 }}>Reg No</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {badgeSummary.map((row) => (
                                <TableRow key={row.id}>
                                  <TableCell>{row.regNo}</TableCell>
                                  <TableCell>{row.name}</TableCell>
                                  <TableCell>{row.date}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={row.present ? "Present" : "Absent"}
                                      color={row.present ? "success" : "error"}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      )}
                    </>
                  )}
              </AnimatePresence>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Box>
  );
}