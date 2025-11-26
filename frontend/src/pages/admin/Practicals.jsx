import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { db } from "../../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function Practicals() {
  const auth = getAuth();
  const practicalsCollectionRef = collection(db, "practicals");

  const [tabIndex, setTabIndex] = useState(0);
  const [practicalName, setPracticalName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ id: Date.now(), title: "", details: "" }]);
  const [file, setFile] = useState(null);
  const [practicals, setPracticals] = useState([]);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    async function fetchPracticals() {
      try {
        const snapshot = await getDocs(practicalsCollectionRef);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPracticals(data.reverse());
      } catch (err) {
        console.error("Error fetching practicals:", err);
      }
    }
    fetchPracticals();
  }, []);

  const addStep = () => setSteps((s) => [...s, { id: Date.now() + Math.random(), title: "", details: "" }]);
  const updateStep = (id, field, value) => setSteps((s) => s.map((st) => (st.id === id ? { ...st, [field]: value } : st)));
  const removeStep = (id) => steps.length > 1 && setSteps((s) => s.filter((st) => st.id !== id));
  const onFileChange = (e) => setFile(e.target.files?.[0] ?? null);

  const handleAddPractical = async () => {
    if (!auth.currentUser) return alert("You must be logged in to add a practical.");
    if (!practicalName.trim()) return alert("Please enter a practical name.");

    const newPractical = {
      name: practicalName.trim(),
      description: description.trim(),
      steps: steps.map((s, i) => ({ order: i + 1, title: s.title.trim(), details: s.details.trim() })),
      fileName: file ? file.name : null,
      createdAt: new Date().toISOString(),
      userId: auth.currentUser.uid,
    };

    try {
      const docRef = await addDoc(practicalsCollectionRef, newPractical);
      setPracticals((p) => [{ id: docRef.id, ...newPractical }, ...p]);
      setPracticalName(""); setDescription(""); setSteps([{ id: Date.now(), title: "", details: "" }]); setFile(null); setTabIndex(1);
    } catch (err) {
      console.error(err); alert("Failed to save practical.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this practical?")) return;
    try {
      const docRef = doc(db, "practicals", id);
      await deleteDoc(docRef);
      setPracticals((p) => p.filter((x) => x.id !== id));
    } catch (err) { console.error(err); alert("Failed to delete."); }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <Box p={2}>
  
  <Tabs
    value={tabIndex}
    onChange={(_, v) => setTabIndex(v)}
    indicatorColor="primary"
    textColor="primary"
    variant="fullWidth"
    sx={{
      "& .MuiTab-root": {
        borderRadius: "20px",
        mx: 1,
        textTransform: "none",
        transition: "0.3s",
      },
      "& .Mui-selected": {
       
      },
    }}
  >
    <Tab label="ADD PRACTICAL" />
    <Tab label="SHOW PRACTICALS" />
  </Tabs>


      <AnimatePresence mode="wait">
        {tabIndex === 0 && (
          <motion.div key="add" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <Box component={Paper} p={3} sx={{ borderRadius: 3, boxShadow: 4 }}>
              <Typography variant="h5" gutterBottom color="primary">Add Practical</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Practical Name" value={practicalName} onChange={(e) => setPracticalName(e.target.value)} margin="normal" />
                  <TextField fullWidth label="Brief Description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" />

                  <Box mt={2} display="flex" alignItems="center" gap={1}>
                    <label htmlFor="practical-file-input">
                      <input id="practical-file-input" type="file" style={{ display: "none" }} onChange={onFileChange} />
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadFileIcon />}
                        sx={{ borderRadius: "30px", textTransform: "none", fontWeight: 500 }}
                        color="primary"
                      >
                        {file ? "Change Document" : "Upload Document"}
                      </Button>
                    </label>
                    {file && <Typography variant="body2" sx={{ fontStyle: "italic" }}>{file.name}</Typography>}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Steps</Typography>
                  {steps.map((st, idx) => (
                    <motion.div
                      key={st.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card variant="outlined" sx={{ mb: 2, position: "relative", borderRadius: 3, "&:hover": { boxShadow: 6 } }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2">Step {idx + 1}</Typography>
                            <IconButton size="small" onClick={() => removeStep(st.id)} disabled={steps.length === 1} color="error">
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Box>
                          <TextField fullWidth label="Step title" value={st.title} onChange={(e) => updateStep(st.id, "title", e.target.value)} margin="dense" />
                          <TextField fullWidth label="Step details" value={st.details} onChange={(e) => updateStep(st.id, "details", e.target.value)} multiline rows={3} margin="dense" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  <Button
                    startIcon={<AddCircleOutlineIcon />}
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: "30px", mt: 1, py:1.5, background: "linear-gradient(90deg, #1976d2, #42a5f5)" }}
                    onClick={addStep}
                  >
                    Add New Step
                  </Button>
                </Grid>
              </Grid>

              <Box mt={4} display="flex" gap={2}>
               <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "30px", py: 1.5, background: "linear-gradient(90deg, #1976d2, #42a5f5)" }}
                  onClick={handleAddPractical}
                >Save Practical</Button>
                <Button variant="outlined" color="primary" sx={{ borderRadius: "30px" }} onClick={() => { setPracticalName(""); setDescription(""); setSteps([{ id: Date.now(), title: "", details: "" }]); setFile(null); }}>Reset</Button>
              </Box>
            </Box>
          </motion.div>
        )}

        {tabIndex === 1 && (
          <motion.div key="show" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <Box component={Paper} p={2} sx={{ borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h5" color="primary" gutterBottom>All Practicals</Typography>
              {practicals.length === 0 ? <Typography>No practicals added yet</Typography> : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Steps</TableCell>
                        <TableCell>Document</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {practicals.map((p) => (
                        <TableRow key={p.id} sx={{ "&:hover": { backgroundColor: "#f0f8ff" } }}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell><Typography noWrap sx={{ maxWidth: 300 }}>{p.description || "-"}</Typography></TableCell>
                          <TableCell>{p.steps?.length ?? 0}</TableCell>
                          <TableCell>{p.fileName ?? "-"}</TableCell>
                          <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => setViewing(p)} color="primary"><VisibilityIcon /></IconButton>
                            <IconButton onClick={() => handleDelete(p.id)} color="error"><DeleteOutlineIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="md" fullWidth>
        <DialogTitle>Practical Details</DialogTitle>
        <DialogContent dividers>
          {viewing && (
            <Box>
              <Typography variant="h5" color="primary">{viewing.name}</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{viewing.description || "No description"}</Typography>
              <Typography variant="h6">Steps</Typography>
              {viewing.steps && viewing.steps.length > 0 ? (
                viewing.steps.map((s) => (
                  <Card key={s.order} variant="outlined" sx={{ p: 1, my: 1, borderRadius: 3, "&:hover": { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="subtitle1">Step {s.order}: {s.title || "(no title)"}</Typography>
                      <Typography variant="body2">{s.details || "(no details)"}</Typography>
                    </CardContent>
                  </Card>
                ))
              ) : <Typography>No steps added</Typography>}
              <Box mt={2}>
                <Typography variant="subtitle1">Related Document</Typography>
                {viewing.fileName ? <Typography sx={{ fontStyle: "italic" }}>{viewing.fileName}</Typography> : <Typography>No document uploaded</Typography>}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)} color="primary" sx={{ borderRadius: "30px" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
