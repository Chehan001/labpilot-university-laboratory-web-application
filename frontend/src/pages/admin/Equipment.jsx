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
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Equipment() {
  const [tabIndex, setTabIndex] = useState(0);

  // FORM STATES
  const [addData, setAddData] = useState({
    equipmentName: "",
    count: "",
    labName: "",
  });

  const [distributeData, setDistributeData] = useState({
    badgeNumber: "",
    equipmentName: "",
    count: "",
    labName: "",
  });

  const [receiveData, setReceiveData] = useState({
    badgeNumber: "",
    equipmentName: "",
    count: "",
    labName: "",
  });

  const [damageData, setDamageData] = useState({
    badgeNumber: "",
    studentRegNumber: "",
    equipmentName: "",
    count: "",
    labName: "",
  });

  // FIREBASE SUBMISSION
  const handleSubmit = async (collectionName, data, resetFunc) => {
    if (!auth.currentUser && !localStorage.getItem("admin")) {
      alert("You must be logged in as Admin to add equipment.");
      return;
    }

    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });

      alert("Saved successfully!");
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
  };

  const renderCard = (children) => (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card
        sx={{
          maxWidth: 500,
          mx: "auto",
          p: 2,
          borderRadius: "18px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        }}
      >
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );

  const renderButton = (onClick) => (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Button fullWidth variant="contained" onClick={onClick} sx={{ py: 1.3,borderRadius: "20px",  }}>
        Submit
      </Button>
    </motion.div>
  );

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Add Equipment" />
        <Tab label="Distribute Equipment" />
        <Tab label="Receive Equipment" />
        <Tab label="Damage Equipment" />
      </Tabs>

      <AnimatePresence mode="wait">
        {/* ADD EQUIPMENT */}
        {tabIndex === 0 &&
          renderCard(
            <>
              <Typography variant="h6" mb={2} fontWeight="bold">  </Typography>
              <TextField
                label="Equipment Name"
                fullWidth
                value={addData.equipmentName}
                onChange={(e) =>
                  setAddData({ ...addData, equipmentName: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Count"
                type="number"
                fullWidth
                value={addData.count}
                onChange={(e) =>
                  setAddData({ ...addData, count: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Lab Name"
                fullWidth
                value={addData.labName}
                onChange={(e) =>
                  setAddData({ ...addData, labName: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              {renderButton(() =>
                handleSubmit("addEquipment", addData, () =>
                  setAddData({ equipmentName: "", count: "", labName: "" })
                )
              )}
            </>
          )}

        {/* DISTRIBUTE EQUIPMENT */}
        {tabIndex === 1 &&
          renderCard(
            <>
              <Typography variant="h6" mb={2} fontWeight="bold">  </Typography>
              <TextField
                label="Badge Number"
                fullWidth
                value={distributeData.badgeNumber}
                onChange={(e) =>
                  setDistributeData({
                    ...distributeData,
                    badgeNumber: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Equipment Name"
                fullWidth
                value={distributeData.equipmentName}
                onChange={(e) =>
                  setDistributeData({
                    ...distributeData,
                    equipmentName: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Count"
                type="number"
                fullWidth
                value={distributeData.count}
                onChange={(e) =>
                  setDistributeData({ ...distributeData, count: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Lab Name"
                fullWidth
                value={distributeData.labName}
                onChange={(e) =>
                  setDistributeData({
                    ...distributeData,
                    labName: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              {renderButton(() =>
                handleSubmit("distributeEquipment", distributeData, () =>
                  setDistributeData({
                    badgeNumber: "",
                    equipmentName: "",
                    count: "",
                    labName: "",
                  })
                )
              )}
            </>
          )}

        {/* RECEIVE EQUIPMENT */}
        {tabIndex === 2 &&
          renderCard(
            <>
               <Typography variant="h6" mb={2} fontWeight="bold">  </Typography>

              <TextField
                label="Badge Number"
                fullWidth
                value={receiveData.badgeNumber}
                onChange={(e) =>
                  setReceiveData({
                    ...receiveData,
                    badgeNumber: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Equipment Name"
                fullWidth
                value={receiveData.equipmentName}
                onChange={(e) =>
                  setReceiveData({
                    ...receiveData,
                    equipmentName: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Count"
                type="number"
                fullWidth
                value={receiveData.count}
                onChange={(e) =>
                  setReceiveData({ ...receiveData, count: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Lab Name"
                fullWidth
                value={receiveData.labName}
                onChange={(e) =>
                  setReceiveData({
                    ...receiveData,
                    labName: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              {renderButton(() =>
                handleSubmit("receiveEquipment", receiveData, () =>
                  setReceiveData({
                    badgeNumber: "",
                    equipmentName: "",
                    count: "",
                    labName: "",
                  })
                )
              )}
            </>
          )}

        {/* DAMAGE EQUIPMENT */}
        {tabIndex === 3 &&
          renderCard(
            <>
                <Typography variant="h6" mb={2} fontWeight="bold">  </Typography>

              <TextField
                label="Badge Number"
                fullWidth
                value={damageData.badgeNumber}
                onChange={(e) =>
                  setDamageData({ ...damageData, badgeNumber: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Student Register Number"
                fullWidth
                value={damageData.studentRegNumber}
                onChange={(e) =>
                  setDamageData({
                    ...damageData,
                    studentRegNumber: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Equipment Name"
                fullWidth
                value={damageData.equipmentName}
                onChange={(e) =>
                  setDamageData({
                    ...damageData,
                    equipmentName: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Count"
                type="number"
                fullWidth
                value={damageData.count}
                onChange={(e) =>
                  setDamageData({ ...damageData, count: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                label="Lab Name"
                fullWidth
                value={damageData.labName}
                onChange={(e) =>
                  setDamageData({ ...damageData, labName: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              {renderButton(() =>
                handleSubmit("damageEquipment", damageData, () =>
                  setDamageData({
                    badgeNumber: "",
                    studentRegNumber: "",
                    equipmentName: "",
                    count: "",
                    labName: "",
                  })
                )
              )}
            </>
          )}
      </AnimatePresence>
    </Box>
  );
}
