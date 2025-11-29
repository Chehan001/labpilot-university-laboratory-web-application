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
} from "@mui/material";

import * as XLSX from "xlsx";

import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Attendance() {
  const [tabIndex, setTabIndex] = useState(0);

  /* -------------------------------------------------------
      1) ADD STUDENTS FROM EXCEL
  --------------------------------------------------------*/
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

    alert("Students saved!");
    setExcelStudents([]);
  };

  /* -------------------------------------------------------
      2) MARK ATTENDANCE
  --------------------------------------------------------*/
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

    alert("Attendance saved!");
    setStudentsList([]);
    setAttendanceTick({});
  };

  /* -------------------------------------------------------
      3) SHOW SUMMARY TAB
  --------------------------------------------------------*/
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

  /* -------------------------------------------------------
      UI
  --------------------------------------------------------*/
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700}>
        Attendance System
      </Typography>

      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mt: 3 }}>
        <Tab label="Add Student Details" />
        <Tab label="Mark Attendance" />
        <Tab label="Show Summary" />
      </Tabs>

      {/* ------------------------ ADD STUDENT ------------------------ */}
      {tabIndex === 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography fontWeight={600}>Upload Student Excel</Typography>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            style={{ marginTop: 20 }}
          />

          {excelStudents.length > 0 && (
            <>
              <Typography sx={{ mt: 3 }} fontWeight={600}>
                Preview ({excelStudents.length} students)
              </Typography>

              {excelStudents.map((s, i) => (
                <Paper key={i} sx={{ p: 2, mt: 1 }}>
                  <Typography>Reg No: {s.regNo}</Typography>
                  <Typography>Name: {s.name}</Typography>
                  <Typography>Badge: {s.badge}</Typography>
                </Paper>
              ))}

              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={handleSaveExcelStudents}
              >
                Save All Students
              </Button>
            </>
          )}
        </Paper>
      )}

      {/* ------------------------ MARK ATTENDANCE ------------------------ */}
      {tabIndex === 1 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography fontWeight={600}>Mark Attendance</Typography>

          <TextField
            label="Lab Name"
            fullWidth
            sx={{ mt: 2 }}
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
          />

          <TextField
            label="Badge"
            fullWidth
            sx={{ mt: 2 }}
            value={badgeName}
            onChange={(e) => setBadgeName(e.target.value)}
          />

          <Button variant="contained" sx={{ mt: 2 }} onClick={loadStudentsForAttendance}>
            Load Students
          </Button>

          {studentsList.length > 0 && (
            <>
              <Typography sx={{ mt: 3 }} fontWeight={600}>
                Students ({studentsList.length})
              </Typography>

              {studentsList.map((s) => (
                <Paper key={s.regNo} sx={{ p: 2, mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={attendanceTick[s.regNo]}
                        onChange={() => handleTick(s.regNo)}
                      />
                    }
                    label={`${s.regNo} - ${s.name}`}
                  />
                </Paper>
              ))}

              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={saveMarkedAttendance}
              >
                Save Attendance
              </Button>
            </>
          )}
        </Paper>
      )}

      {/* ------------------------ SHOW SUMMARY ------------------------ */}
      {tabIndex === 2 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          {/* STUDENT SUMMARY */}
          <Typography fontWeight={600}>Search by Student Reg No</Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reg No"
                value={sumReg}
                onChange={(e) => setSumReg(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button fullWidth variant="contained" onClick={loadStudentSummary}>
                Search
              </Button>
            </Grid>
          </Grid>

          {studentSummary.length > 0 && (
            <>
              <Table sx={{ mt: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Lab</TableCell>
                    <TableCell>Present</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentSummary.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>{row.lab}</TableCell>
                      <TableCell>{row.present ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <Divider sx={{ my: 4 }} />

          {/* BADGE + LAB SUMMARY */}
          <Typography fontWeight={600}>Search by Badge + Lab</Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Badge"
                value={sumBadge}
                onChange={(e) => setSumBadge(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Lab Name"
                value={sumLab}
                onChange={(e) => setSumLab(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" onClick={loadBadgeSummary}>
                Search
              </Button>
            </Grid>
          </Grid>

          {badgeSummary.length > 0 && (
            <>
              <Table sx={{ mt: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Reg No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Present</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {badgeSummary.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.regNo}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.present ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}
