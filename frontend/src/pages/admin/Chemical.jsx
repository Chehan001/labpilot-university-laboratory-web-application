import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import ScienceIcon from "@mui/icons-material/Science";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SendIcon from "@mui/icons-material/Send";
import GetAppIcon from "@mui/icons-material/GetApp";
import BadgeIcon from "@mui/icons-material/Badge";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import ScaleIcon from "@mui/icons-material/Scale";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function Chemical() {
  const [tabIndex, setTabIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form States
  const [addData, setAddData] = useState({
    chemicalName: "",
    quantity: "",
    unit: "ml",
    labName: "",
  });

  const [distributeData, setDistributeData] = useState({
    badgeNumber: "",
    chemicalName: "",
    quantity: "",
    unit: "ml",
    labName: "",
  });

  const [receiveData, setReceiveData] = useState({
    badgeNumber: "",
    chemicalName: "",
    quantity: "",
    unit: "ml",
    labName: "",
  });

  // Firebase Submission
  const handleSubmit = async (collectionName, data, resetFunc) => {
    if (!auth.currentUser && !localStorage.getItem("admin")) {
      alert("You must be logged in as Admin to continue.");
      return;
    }

    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      resetFunc();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data: " + error.message);
    }
  };

  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
  };

  const tabConfig = [
    {
      label: "Add Chemical",
      icon: <AddCircleOutlineIcon />,
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #3ea0efff 0%, #42a5f5 100%)",
    },
    {
      label: "Distribute",
      icon: <SendIcon />,
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #3ea0efff 0%, #42a5f5 100%)",
    },
    {
      label: "Receive",
      icon: <GetAppIcon />,
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #3ea0efff 0%, #42a5f5 100%)",
    },
  ];

  const renderCard = (title, icon, gradient, children) => (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" exit="exit">
      <Card
        elevation={0}
        sx={{
          maxWidth: 600,
          mx: "auto",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          overflow: "visible",
          position: "relative",
        }}
      >
        {/* Header with Icon */}
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

  const renderTextField = (label, value, onChange, icon, type = "text", placeholder = "") => (
    <TextField
      label={label}
      fullWidth
      type={type}
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
            boxShadow: "0 4px 20px rgba(156, 39, 176, 0.2)",
          },
        },
      }}
    />
  );

  const renderQuantityField = (value, onChange, unit, onUnitChange) => (
    <Stack direction="row" spacing={2} mb={2.5}>
      <TextField
        label="Quantity"
        type="number"
        value={value}
        onChange={onChange}
        placeholder="Enter amount"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <ScaleIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            transition: "all 0.3s",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            "&.Mui-focused": {
              boxShadow: "0 4px 20px rgba(156, 39, 176, 0.2)",
            },
          },
        }}
      />
      <FormControl sx={{ minWidth: 100 }}>
        <InputLabel>Unit</InputLabel>
        <Select
          value={unit}
          onChange={onUnitChange}
          label="Unit"
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <MenuItem value="ml">ml</MenuItem>
          <MenuItem value="g">g</MenuItem>
          <MenuItem value="L">L</MenuItem>
          <MenuItem value="kg">kg</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );

  const renderButton = (onClick, label, gradient) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        fullWidth
        variant="contained"
        onClick={onClick}
        startIcon={<CheckCircleOutlineIcon />}
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
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              Chemical Management
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(94, 92, 92, 0.9)" }}>
              Safely manage and track laboratory chemicals
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
                    maxWidth: 600,
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
              onChange={handleTabChange}
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
                {/* ADD CHEMICAL */}
                {tabIndex === 0 &&
                  renderCard(
                    "Add New Chemical",
                    <AddCircleOutlineIcon sx={{ fontSize: 28 }} />,
                    tabConfig[0].gradient,
                    <>
                      {renderTextField(
                        "Chemical Name",
                        addData.chemicalName,
                        (e) => setAddData({ ...addData, chemicalName: e.target.value }),
                        <ScienceIcon color="action" />,
                        "text",
                        "e.g., Hydrochloric Acid, Sodium Chloride"
                      )}

                      {renderQuantityField(
                        addData.quantity,
                        (e) => setAddData({ ...addData, quantity: e.target.value }),
                        addData.unit,
                        (e) => setAddData({ ...addData, unit: e.target.value })
                      )}

                      {renderTextField(
                        "Laboratory Name",
                        addData.labName,
                        (e) => setAddData({ ...addData, labName: e.target.value }),
                        <LocalDrinkIcon color="action" />,
                        "text",
                        "e.g., Chemistry Lab A, Organic Lab"
                      )}

                      {renderButton(
                        () =>
                          handleSubmit("addChemical", addData, () =>
                            setAddData({ chemicalName: "", quantity: "", unit: "ml", labName: "" })
                          ),
                        "Add Chemical",
                        tabConfig[0].gradient
                      )}
                    </>
                  )}

                {/* DISTRIBUTE CHEMICAL */}
                {tabIndex === 1 &&
                  renderCard(
                    "Distribute Chemical",
                    <SendIcon sx={{ fontSize: 28 }} />,
                    tabConfig[1].gradient,
                    <>
                      {renderTextField(
                        "Badge Number",
                        distributeData.badgeNumber,
                        (e) => setDistributeData({ ...distributeData, badgeNumber: e.target.value }),
                        <BadgeIcon color="action" />,
                        "text",
                        "Enter staff badge number"
                      )}

                      {renderTextField(
                        "Chemical Name",
                        distributeData.chemicalName,
                        (e) => setDistributeData({ ...distributeData, chemicalName: e.target.value }),
                        <ScienceIcon color="action" />,
                        "text",
                        "Chemical being distributed"
                      )}

                      {renderQuantityField(
                        distributeData.quantity,
                        (e) => setDistributeData({ ...distributeData, quantity: e.target.value }),
                        distributeData.unit,
                        (e) => setDistributeData({ ...distributeData, unit: e.target.value })
                      )}

                      {renderTextField(
                        "Laboratory Name",
                        distributeData.labName,
                        (e) => setDistributeData({ ...distributeData, labName: e.target.value }),
                        <LocalDrinkIcon color="action" />,
                        "text",
                        "Destination lab"
                      )}

                      {renderButton(
                        () =>
                          handleSubmit("distributeChemical", distributeData, () =>
                            setDistributeData({
                              badgeNumber: "",
                              chemicalName: "",
                              quantity: "",
                              unit: "ml",
                              labName: "",
                            })
                          ),
                        "Distribute Chemical",
                        tabConfig[1].gradient
                      )}
                    </>
                  )}

                {/* RECEIVE CHEMICAL */}
                {tabIndex === 2 &&
                  renderCard(
                    "Receive Chemical",
                    <GetAppIcon sx={{ fontSize: 28 }} />,
                    tabConfig[2].gradient,
                    <>
                      {renderTextField(
                        "Badge Number",
                        receiveData.badgeNumber,
                        (e) => setReceiveData({ ...receiveData, badgeNumber: e.target.value }),
                        <BadgeIcon color="action" />,
                        "text",
                        "Enter staff badge number"
                      )}

                      {renderTextField(
                        "Chemical Name",
                        receiveData.chemicalName,
                        (e) => setReceiveData({ ...receiveData, chemicalName: e.target.value }),
                        <ScienceIcon color="action" />,
                        "text",
                        "Chemical being returned"
                      )}

                      {renderQuantityField(
                        receiveData.quantity,
                        (e) => setReceiveData({ ...receiveData, quantity: e.target.value }),
                        receiveData.unit,
                        (e) => setReceiveData({ ...receiveData, unit: e.target.value })
                      )}

                      {renderTextField(
                        "Laboratory Name",
                        receiveData.labName,
                        (e) => setReceiveData({ ...receiveData, labName: e.target.value }),
                        <LocalDrinkIcon color="action" />,
                        "text",
                        "Source lab"
                      )}

                      {renderButton(
                        () =>
                          handleSubmit("receiveChemical", receiveData, () =>
                            setReceiveData({
                              badgeNumber: "",
                              chemicalName: "",
                              quantity: "",
                              unit: "ml",
                              labName: "",
                            })
                          ),
                        "Confirm Receipt",
                        tabConfig[2].gradient
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