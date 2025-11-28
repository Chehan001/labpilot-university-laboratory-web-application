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
  Chip,
  Stack,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ScienceIcon from "@mui/icons-material/Science";
import DescriptionIcon from "@mui/icons-material/Description";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachFileIcon from "@mui/icons-material/AttachFile";
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
      setPracticalName("");
      setDescription("");
      setSteps([{ id: Date.now(), title: "", details: "" }]);
      setFile(null);
      setTabIndex(1);
    } catch (err) {
      console.error(err);
      alert("Failed to save practical.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this practical?")) return;
    try {
      const docRef = doc(db, "practicals", id);
      await deleteDoc(docRef);
      setPracticals((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: 30, transition: { duration: 0.3 } },
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
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                color: "rgba(94, 92, 92, 0.9)",
                fontWeight: 700,
                mb: 1,
                textShadow: "0 2px 10px rgba(10, 10, 10, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              Practicals Manager
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(94, 92, 92, 0.9)" }}>
              Organize and manage your laboratory practicals efficiently
            </Typography>
          </Box>

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
              onChange={(_, v) => setTabIndex(v)}
              variant="fullWidth"
              sx={{
                background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  py: 2,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "rgba(255,255,255,0.95)",
                    background: "rgba(255,255,255,0.1)",
                  },
                },
                "& .Mui-selected": {
                  color: "#fff !important",
                  background: "rgba(255,255,255,0.15)",
                },
                "& .MuiTabs-indicator": {
                  height: 4,
                  backgroundColor: "#fff",
                  borderRadius: "4px 4px 0 0",
                },
              }}
            >
              <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Add Practical" />
              <Tab icon={<ListAltIcon />} iconPosition="start" label={`All Practicals (${practicals.length})`} />
            </Tabs>

            <Box sx={{ p: 4, minHeight: 600, background: "#fafafa" }}>
              <AnimatePresence mode="wait">
                {/* ADD TAB */}
                {tabIndex === 0 && (
                  <motion.div key="add" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        background: "white",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 2,
                            background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ScienceIcon sx={{ color: "white", fontSize: 28 }} />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="primary">
                            Create New Practical
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Fill in the details below to add a new practical
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={4}>
                        {/* Left Column */}
                        <Grid item xs={12} md={6}>
                          <Stack spacing={3}>
                            <TextField
                              fullWidth
                              label="Practical Name"
                              value={practicalName}
                              onChange={(e) => setPracticalName(e.target.value)}
                              placeholder="e.g., Chemistry Lab Experiment"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DescriptionIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  },
                                  "&.Mui-focused": {
                                    boxShadow: "0 4px 20px rgba(25,118,210,0.15)",
                                  },
                                },
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Brief Description"
                              multiline
                              rows={5}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Describe the purpose and objectives of this practical..."
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  },
                                  "&.Mui-focused": {
                                    boxShadow: "0 4px 20px rgba(25,118,210,0.15)",
                                  },
                                },
                              }}
                            />

                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                background: "rgba(25, 118, 210, 0.05)",
                                border: "2px dashed rgba(25, 118, 210, 0.3)",
                                textAlign: "center",
                                transition: "all 0.3s",
                                "&:hover": {
                                  background: "rgba(25, 118, 210, 0.08)",
                                  borderColor: "#1976d2",
                                },
                              }}
                            >
                              <input id="practical-file-input" type="file" style={{ display: "none" }} onChange={onFileChange} />
                              <label htmlFor="practical-file-input">
                                <Stack spacing={2} alignItems="center">
                                  <Box
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      borderRadius: "50%",
                                      background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <UploadFileIcon sx={{ color: "white", fontSize: 30 }} />
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                      {file ? "Document Uploaded" : "Upload Document"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {file ? file.name : "Click to browse files"}
                                    </Typography>
                                  </Box>
                                  <Button component="span" variant="outlined" size="small" sx={{ borderRadius: 3, textTransform: "none" }}>
                                    {file ? "Change File" : "Browse"}
                                  </Button>
                                </Stack>
                              </label>
                            </Paper>
                          </Stack>
                        </Grid>

                        {/* Right Column ---> Steps */}
                        <Grid item xs={12} md={6}>
                          <Stack spacing={4}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="h6" fontWeight={600}>
                                Procedure Steps
                              </Typography>
                              <Chip label={`${steps.length} step${steps.length !== 1 ? "s" : ""}`} color="primary" size="small" />
                            </Box>

                            <Box sx={{ maxHeight: 500, overflowY: "auto", pr: 1 }}>
                              <Stack spacing={2}>
                                {steps.map((st, idx) => (
                                  <motion.div key={st.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                    <Card
                                      elevation={0}
                                      sx={{
                                        position: "relative",
                                        borderRadius: 3,
                                        border: "1px solid #e0e0e0",
                                        overflow: "visible",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": {
                                          transform: "translateY(-4px)",
                                          boxShadow: "0 12px 24px rgba(25, 118, 210, 0.15)",
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          position: "absolute",
                                          top: -12,
                                          left: 16,
                                          width: 40,
                                          height: 40,
                                          borderRadius: "50%",
                                          background: "linear-gradient(90deg, #4a93dcff 0%, #42a5f5 100%)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "white",
                                          fontWeight: 700,
                                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                                        }}
                                      >
                                        {idx + 1}
                                      </Box>
                                      <CardContent sx={{ pt: 3 }}>
                                        <Box display="flex" justifyContent="flex-end" mb={1}>
                                          <Tooltip title="Remove step">
                                            <span>
                                              <IconButton
                                                size="small"
                                                onClick={() => removeStep(st.id)}
                                                disabled={steps.length === 1}
                                                sx={{
                                                  color: "error.main",
                                                  "&:hover": { background: "rgba(211, 47, 47, 0.1)" },
                                                }}
                                              >
                                                <DeleteOutlineIcon fontSize="small" />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                        </Box>
                                        <TextField fullWidth label="Step Title" value={st.title} onChange={(e) => updateStep(st.id, "title", e.target.value)} size="small" sx={{ mb: 1.5 }} />
                                        <TextField fullWidth label="Step Details" value={st.details} onChange={(e) => updateStep(st.id, "details", e.target.value)} multiline rows={2} size="small" />
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </Stack>
                            </Box>

                            <Button
                              fullWidth
                              startIcon={<AddCircleOutlineIcon />}
                              variant="outlined"
                              onClick={addStep}
                              sx={{
                                borderRadius: 14,
                                py: 1.5,
                                textTransform: "none",
                                fontWeight: 600,
                                borderWidth: 2,
                                "&:hover": {
                                  borderWidth: 5,
                                  background: "rgba(25, 118, 210, 0.05)",
                                },
                              }}
                            >
                              Add Another Step
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>

                      {/* Action Buttons */}
                      <Box mt={5} display="flex" gap={2} justifyContent="center">
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handleAddPractical}
                          startIcon={<CheckCircleOutlineIcon />}
                          sx={{
                            borderRadius: 14,
                            px: 5,
                            py: 1.5,
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "1.05rem",
                            background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                            boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                            "&:hover": {
                              background: "linear-gradient(90deg, #1565c0, #1976d2)",
                              boxShadow: "0 6px 30px rgba(25, 118, 210, 0.5)",
                            },
                          }}
                        >
                          Save Practical
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => {
                            setPracticalName("");
                            setDescription("");
                            setSteps([{ id: Date.now(), title: "", details: "" }]);
                            setFile(null);
                          }}
                          sx={{
                            borderRadius: 14,
                            px: 4,
                            textTransform: "none",
                            fontWeight: 600,
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        >
                          Reset Form
                        </Button>
                      </Box>
                    </Paper>
                  </motion.div>
                )}

                {/* SHOW TAB */}
                {tabIndex === 1 && (
                  <motion.div key="show" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                    {practicals.length === 0 ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 8,
                          textAlign: "center",
                          borderRadius: 3,
                          background: "white",
                        }}
                      >
                        <ScienceIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                          No Practicals Yet
                        </Typography>
                        <Typography variant="body1" color="text.disabled" mb={3}>
                          Start by adding your first practical
                        </Typography>
                        <Button variant="contained" onClick={() => setTabIndex(0)} startIcon={<AddCircleOutlineIcon />} sx={{ borderRadius: 3, textTransform: "none", px: 4 }}>
                          Add Practical
                        </Button>
                      </Paper>
                    ) : (
                      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ background: "linear-gradient(90deg, #f5f5f5, #fafafa)" }}>
                              <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Description</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Steps</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Document</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Created</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {practicals.map((p, index) => (
                              <TableRow
                                key={p.id}
                                sx={{
                                  "&:hover": {
                                    background: "rgba(25, 118, 210, 0.04)",
                                  },
                                }}
                              >
                                <TableCell>
                                  <Typography fontWeight={600}>{p.name}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography noWrap sx={{ maxWidth: 300, color: "text.secondary" }}>
                                    {p.description || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={`${p.steps?.length ?? 0} steps`} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  {p.fileName ? <Chip icon={<AttachFileIcon />} label={p.fileName} size="small" sx={{ maxWidth: 150 }} /> : <Typography color="text.disabled">-</Typography>}
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {new Date(p.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Tooltip title="View details">
                                      <IconButton
                                        onClick={() => setViewing(p)}
                                        sx={{
                                          color: "primary.main",
                                          "&:hover": { background: "rgba(25, 118, 210, 0.1)" },
                                        }}
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton
                                        onClick={() => handleDelete(p.id)}
                                        sx={{
                                          color: "error.main",
                                          "&:hover": { background: "rgba(211, 47, 47, 0.1)" },
                                        }}
                                      >
                                        <DeleteOutlineIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Paper>
        </Box>
      </motion.div>

      {/* View Dialog */}
      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(90deg, #1976d2, #42a5f5)",
            color: "white",
            py: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <ScienceIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={700}>
              Practical Details
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          {viewing && (
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
                  {viewing.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {viewing.description || "No description provided"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ListAltIcon color="primary" />
                  Procedure Steps
                </Typography>
                {viewing.steps && viewing.steps.length > 0 ? (
                  <Stack spacing={2} mt={2}>
                    {viewing.steps.map((s) => (
                      <Card
                        key={s.order}
                        elevation={0}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          position: "relative",
                          overflow: "visible",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 12px 24px rgba(25, 118, 210, 0.15)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: 16,
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {s.order}
                        </Box>
                        <CardContent sx={{ pt: 3 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {s.title || "(No title)"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {s.details || "(No details)"}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.disabled">No steps added</Typography>
                )}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: "rgba(25, 118, 210, 0.05)",
                  border: "1px solid rgba(25, 118, 210, 0.2)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AttachFileIcon color="primary" />
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Related Document
                    </Typography>
                    {viewing.fileName ? (
                      <Typography variant="body2" color="text.secondary">
                        {viewing.fileName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        No document uploaded
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewing(null)} variant="contained" sx={{ borderRadius: 3, textTransform: "none", px: 4 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}