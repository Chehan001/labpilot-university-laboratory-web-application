import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Autocomplete,
  Divider,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ScienceIcon from "@mui/icons-material/Science";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function UserPracticals() {
  const [practicals, setPracticals] = useState([]);
  const [filteredPracticals, setFilteredPracticals] = useState([]);
  const [selectedPractical, setSelectedPractical] = useState(null);
  const [viewingPractical, setViewingPractical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const practicalsCollectionRef = useMemo(() => collection(db, "practicals"), []);

  // Fetch  -->  all practicals 
  useEffect(() => {
    async function fetchPracticals() {
      try {
        setLoading(true);
        const snapshot = await getDocs(practicalsCollectionRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPracticals(data);
        setFilteredPracticals(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching practicals:", err);
        setError("Failed to load practicals. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchPracticals();
  }, [practicalsCollectionRef]);

  // Extract --> unique practical names
  const practicalNames = useMemo(() => {
    return [...new Set(practicals.map((p) => p.name).filter(Boolean))];
  }, [practicals]);

  const handlePracticalSelect = (event, value) => {
    if (value) {
      const filtered = practicals.filter((p) => p.name === value);
      setFilteredPracticals(filtered);
      setSelectedPractical(value);
    } else {
      setFilteredPracticals(practicals);
      setSelectedPractical(null);
    }
  };

  const handleViewDetails = (practical) => {
    setViewingPractical(practical);
  };

  const handleCloseDialog = () => {
    setViewingPractical(null);
  };

  const handleDownloadPDF = async (practical) => {
    if (practical.fileUrl) {
      try {
        const response = await fetch(practical.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = practical.fileName || "practical.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading file:", error);
        alert("Failed to download file. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        marginLeft: { xs: 0, lg: "60px" }, // Space --> navbar
        transition: "margin-left 0.35s ease",
        background: "linear-gradient(135deg, #b6cdefff 0%, #044abcff 100%)",
      }}
    >
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <Box sx={{ mb: 4, mt: { xs: 6, lg: 0 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "linear-gradient(135deg, #1b1fabff 0%, #1843b9ff 40%, #1e3ca1ff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                position: "relative",
                textShadow: "0 0 10px rgba(90,110,255,0.4), 0 0 20px rgba(90,110,255,0.3)",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                animation: "fadeSlide 1.1s ease",
                "@keyframes fadeSlide": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              Laboratory Practicals
            </Typography>

          </Box>

          {/* Search Section */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 5,
              mb: 4,
              background: "#ffffff",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600} color="primary">
                <SearchIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Search Practicals
              </Typography>

              <Autocomplete
                options={practicalNames}
                value={selectedPractical}
                onChange={handlePracticalSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Practical Name"
                    placeholder="Start typing to search..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {selectedPractical && (
                <Alert severity="info" icon={<SearchIcon />} sx={{ borderRadius: 2 }}>
                  Showing results for: <strong>{selectedPractical}</strong>
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Paper elevation={2} sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Loading practicals...
              </Typography>
            </Paper>
          )}

          {/* No Results */}
          {!loading && filteredPracticals.length === 0 && (
            <Paper elevation={2} sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
              <ScienceIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Practicals Found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {selectedPractical
                  ? "Try selecting a different practical name"
                  : "No practicals available at this time"}
              </Typography>
            </Paper>
          )}

          {/* Practicals Grid --> Only Name and Description --> Data must be enterd by Admin */}
          {!loading && filteredPracticals.length > 0 && (
            <Grid container spacing={3}>
              {filteredPracticals.map((practical, index) => (
                <Grid item xs={12} sm={6} md={4} key={practical.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card
                      elevation={2}
                      sx={{
                        borderRadius: 3,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: "2px solid transparent",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: 4,
                          borderColor: "#667eea",
                        },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={() => handleViewDetails(practical)}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          background: "linear-gradient(135deg, #4f94eeff 0%, #0c1f87ff 100%)",
                          color: "white",
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ScienceIcon sx={{ fontSize: 28 }} />
                          <Typography variant="h6" fontWeight={600}>
                            {practical.name}
                          </Typography>
                        </Stack>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            minHeight: 80,
                            lineHeight: 1.6,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {practical.description || "No description provided"}
                        </Typography>

                        <Box sx={{ mt: 3, textAlign: "center" }}>
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(practical);
                            }}
                            sx={{
                              borderRadius: 15,
                              textTransform: "none",
                              fontWeight: 600,
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </Box>

      {/* Details card --> Pop up */}
      <Dialog
        open={!!viewingPractical}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #4f94eeff 0%, #0c1f87ff 100%)",
            color: "white",
            p: 3,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <ScienceIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                {viewingPractical?.name}
              </Typography>
            </Stack>
            <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        {viewingPractical && (
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Description Section */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {viewingPractical.description || "No description provided"}
                </Typography>
              </Box>

              <Divider />

              {/*  Information  --> Step count & Update date  */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  Information
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      icon={<ListAltIcon />}
                      label={`${viewingPractical.steps?.length || 0} Steps`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CalendarTodayIcon />}
                      label={formatDate(viewingPractical.createdAt)}
                      color="default"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Procedure Steps */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  Procedure Steps
                </Typography>

                {viewingPractical.steps && viewingPractical.steps.length > 0 ? (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {viewingPractical.steps.map((step, idx) => (
                      <motion.div
                        key={step.order}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            borderLeft: 4,
                            borderColor: "primary.main",
                            background: "#f8f9fa",
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Box
                              sx={{
                                minWidth: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #4f94eeff 0%, #0c1f87ff 100%)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                              }}
                            >
                              {step.order}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {step.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                {step.details}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No steps available for this practical.
                  </Alert>
                )}
              </Box>

              {/* PDF Download */}
              {viewingPractical.fileName && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                      Attached Files
                    </Typography>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2.5,
                        borderRadius: 8,
                        background: "#f8f9fa",
                        mt: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <AttachFileIcon color="primary" sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {viewingPractical.fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              PDF Document
                            </Typography>
                          </Box>
                        </Stack>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadPDF(viewingPractical)}
                          disabled={!viewingPractical.fileUrl}
                          sx={{
                            borderRadius: 15,
                            textTransform: "none",
                            fontWeight: 600,
                            background: "linear-gradient(135deg, #9ec5f9ff 0%, #b3bbe8ff 100%)",
                          }}
                        >
                          Download PDF
                        </Button>
                      </Stack>
                    </Paper>
                  </Box>
                </>
              )}
            </Stack>
          </DialogContent>
        )}

        <DialogActions sx={{ p: 3, background: "#f8f9fa" }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{
              borderRadius: 15,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}