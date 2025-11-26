// Practical.jsx
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function Practicals() {
  const [tabIndex, setTabIndex] = useState(0);
  const [practicalName, setPracticalName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([
    { id: Date.now(), title: "", details: "" },
  ]);
  const [file, setFile] = useState(null);
  const [practicals, setPracticals] = useState([]);
  const [viewing, setViewing] = useState(null);
  const LOCAL_KEY = "practicals_v1";

  useEffect(() => {
    // Load saved ---> practicals from localStorage
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      setPracticals(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(practicals));
  }, [practicals]);

  // Handlers ---> dynamic steps
  function addStep() {
    setSteps((s) => [...s, { id: Date.now() + Math.random(), title: "", details: "" }]);
  }
  function updateStep(id, field, value) {
    setSteps((s) => s.map((st) => (st.id === id ? { ...st, [field]: value } : st)));
  }
  function removeStep(id) {
    if (steps.length === 1) return; // keep at ---> least one step
    setSteps((s) => s.filter((st) => st.id !== id));
  }

  // File input handler
  function onFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  // Add practical 
  function handleAddPractical() {
    if (!practicalName.trim()) {
      alert("Please enter a practical name.");
      return;
    }

    const newPractical = {
      id: Date.now().toString(),
      name: practicalName.trim(),
      description: description.trim(),
      steps: steps.map((s, i) => ({ order: i + 1, title: s.title.trim(), details: s.details.trim() })),
      fileName: file ? file.name : null,
      createdAt: new Date().toISOString(),
      
    };

    setPracticals((p) => [newPractical, ...p]);
    // Reset form
    setPracticalName("");
    setDescription("");
    setSteps([{ id: Date.now(), title: "", details: "" }]);
    setFile(null);
    setTabIndex(1); //  Show Practical tab --> to --> view the saved item
  }

  function handleDelete(id) {
    if (!confirm("Delete this practical?")) return;
    setPracticals((p) => p.filter((x) => x.id !== id));
  }

  return (
    <Box p={2}>
      <Paper elevation={2} sx={{ mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} indicatorColor="primary" textColor="primary">
          <Tab label="Add Practical" />
          <Tab label="Show Practicals" />
        </Tabs>
      </Paper>

      {tabIndex === 0 && (
        <Box component={Paper} p={3}>
          <Typography variant="h6" gutterBottom>
            Add Practical
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Practical Name"
                value={practicalName}
                onChange={(e) => setPracticalName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Brief Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
              />
              <Box mt={1} display="flex" alignItems="center" gap={1}>
                <label htmlFor="practical-file-input">
                  <input
                    id="practical-file-input"
                    type="file"
                    style={{ display: "none" }}
                    onChange={onFileChange}
                  />
                  <Button variant="outlined" component="span" startIcon={<UploadFileIcon />}>
                    {file ? "Change Document" : "Upload Document"}
                  </Button>
                </label>
                {file && <Typography variant="body2">{file.name}</Typography>}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Steps (Add step-by-step)</Typography>

              {steps.map((st, idx) => (
                <Paper key={st.id} variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Step {idx + 1}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => removeStep(st.id)}
                        disabled={steps.length === 1}
                        title="Remove step"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Step title (short)"
                    value={st.title}
                    onChange={(e) => updateStep(st.id, "title", e.target.value)}
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Step details / instructions"
                    multiline
                    rows={3}
                    value={st.details}
                    onChange={(e) => updateStep(st.id, "details", e.target.value)}
                    margin="dense"
                  />
                </Paper>
              ))}

              <Box mt={2}>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addStep} variant="contained">
                  + Add New Step
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" gap={2}>
            <Button variant="contained" onClick={handleAddPractical}>
              Save Practical
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // clear form
                setPracticalName("");
                setDescription("");
                setSteps([{ id: Date.now(), title: "", details: "" }]);
                setFile(null);
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box component={Paper} p={2}>
          <Typography variant="h6" gutterBottom>
            All Practicals
          </Typography>

          {practicals.length === 0 ? (
            <Typography>No practicals added yet.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
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
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 300 }}>
                          {p.description || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.steps?.length ?? 0}</TableCell>
                      <TableCell>{p.fileName ?? "-"}</TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => setViewing(p)} title="View details">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(p.id)} title="Delete">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* View  */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="md" fullWidth>
        <DialogTitle>Practical Details</DialogTitle>
        <DialogContent dividers>
          {viewing && (
            <Box>
              <Typography variant="h6">{viewing.name}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {viewing.description || "No description"}
              </Typography>

              <Typography variant="subtitle1">Steps</Typography>
              {viewing.steps && viewing.steps.length > 0 ? (
                viewing.steps.map((s) => (
                  <Paper key={s.order} variant="outlined" sx={{ p: 1, my: 1 }}>
                    <Typography variant="subtitle2">Step {s.order}: {s.title || "(no title)"}</Typography>
                    <Typography variant="body2">{s.details || "(no details)"}</Typography>
                  </Paper>
                ))
              ) : (
                <Typography>No steps added.</Typography>
              )}

              <Box mt={2}>
                <Typography variant="subtitle1">Related document</Typography>
                {viewing.fileName ? (
                  <Typography>{viewing.fileName}</Typography>
                ) : (
                  <Typography>No document uploaded.</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
