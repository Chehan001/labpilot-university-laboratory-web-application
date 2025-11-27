import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  LinearProgress,
} from "@mui/material";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import InventoryIcon from "@mui/icons-material/Inventory";
import SendIcon from "@mui/icons-material/Send";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScienceIcon from "@mui/icons-material/Science";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function AdminHome() {
  const [loading, setLoading] = useState(true);

  // Equipment Warning Stock
  const [inventory, setInventory] = useState({});
  const MIN_STOCK = 10;

  // Chemical Warning Stock
  const [chemicalInventory, setChemicalInventory] = useState({});
  const MIN_CHEM_STOCK = 50;

  const groupByName = (array) => {
    const map = {};
    array.forEach((item) => {
      const name = item.name;
      const count = Number(item.count);
      map[name] = (map[name] || 0) + count;
    });
    return map;
  };

  const fetchSummary = async () => {
    try {
      // Equipment Summary
      const addSnap = await getDocs(collection(db, "addEquipment"));
      const distributeSnap = await getDocs(collection(db, "distributeEquipment"));
      const receiveSnap = await getDocs(collection(db, "receiveEquipment"));
      const damageSnap = await getDocs(collection(db, "damageEquipment"));

      const addList = addSnap.docs.map((doc) => ({
        name: doc.data().equipmentName,
        count: doc.data().count,
      }));

      const distributeList = distributeSnap.docs.map((doc) => ({
        name: doc.data().equipmentName,
        count: doc.data().count,
      }));

      const receiveList = receiveSnap.docs.map((doc) => ({
        name: doc.data().equipmentName,
        count: doc.data().count,
      }));

      const damageList = damageSnap.docs.map((doc) => ({
        name: doc.data().equipmentName,
        count: doc.data().count,
      }));

      const groupedAdd = groupByName(addList);
      const groupedDistribute = groupByName(distributeList);
      const groupedReceive = groupByName(receiveList);
      const groupedDamage = groupByName(damageList);

      const allNames = new Set([
        ...Object.keys(groupedAdd),
        ...Object.keys(groupedDistribute),
        ...Object.keys(groupedReceive),
        ...Object.keys(groupedDamage),
      ]);

      const inventoryCalc = {};
      allNames.forEach((name) => {
        const totalAdd = groupedAdd[name] || 0;
        const totalDistribute = groupedDistribute[name] || 0;
        const totalReceive = groupedReceive[name] || 0;
        const totalDamage = groupedDamage[name] || 0;

        const available = totalAdd - totalDistribute - totalDamage + totalReceive;

        inventoryCalc[name] = {
          available,
          distributed: totalDistribute,
          damaged: totalDamage,
        };
      });

      setInventory(inventoryCalc);

      // CHEMICAL
      const chemAddSnap = await getDocs(collection(db, "addChemical"));
      const chemDistSnap = await getDocs(collection(db, "distributeChemical"));
      const chemReceiveSnap = await getDocs(collection(db, "receiveChemical"));

      const chemAddList = chemAddSnap.docs.map((doc) => ({
        name: doc.data().chemicalName,
        count: doc.data().quantity,
      }));

      const chemDistributeList = chemDistSnap.docs.map((doc) => ({
        name: doc.data().chemicalName,
        count: doc.data().quantity,
      }));

      const chemReceiveList = chemReceiveSnap.docs.map((doc) => ({
        name: doc.data().chemicalName,
        count: doc.data().quantity,
      }));

      const chemGroupedAdd = groupByName(chemAddList);
      const chemGroupedDist = groupByName(chemDistributeList);
      const chemGroupedReceive = groupByName(chemReceiveList);

      const allChem = new Set([
        ...Object.keys(chemGroupedAdd),
        ...Object.keys(chemGroupedDist),
        ...Object.keys(chemGroupedReceive),
      ]);

      const chemInventoryCalc = {};
      allChem.forEach((name) => {
        const totalAdd = chemGroupedAdd[name] || 0;
        const totalDist = chemGroupedDist[name] || 0;
        const totalRec = chemGroupedReceive[name] || 0;

        chemInventoryCalc[name] = {
          available: totalAdd - totalDist + totalRec,
          distributed: totalDist,
        };
      });

      setChemicalInventory(chemInventoryCalc);

      setLoading(false);
    } catch (err) {
      console.error("Error loading summary:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const lowStockEquipment = Object.entries(inventory).filter(
    ([_, data]) => data.available <= MIN_STOCK
  ).length;

  const lowStockChemicals = Object.entries(chemicalInventory).filter(
    ([_, data]) => data.available <= MIN_CHEM_STOCK
  ).length;

  const StatCard = ({ title, value, icon, gradient, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: gradient,
          color: "white",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
          },
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
        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
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
          </Stack>
          <Typography variant="h3" fontWeight={700} mb={0.5}>
            {value}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StockTable = ({ title, data, minStock, isChemical = false }) => {
    const sortedData = Object.entries(data).sort((a, b) => a[1].available - b[1].available);

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #e0e0e0",
          }}
        >
          <Box
            sx={{
              p: 3,
              background: isChemical
                ? "linear-gradient(135deg, #4364f6ff 0%, #3a29d6ff 100%)"
                : "linear-gradient(135deg, #4364f6ff 0%, #3a29d6ff 100%)",
              color: "white",
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
                }}
              >
                {isChemical ? (
                  <ScienceIcon sx={{ fontSize: 28 }} />
                ) : (
                  <InventoryIcon sx={{ fontSize: 28 }} />
                )}
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {title}
              </Typography>
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#fafafa" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    {isChemical ? "Chemical Name" : "Equipment Name"}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    Available
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    Distributed
                  </TableCell>
                  {!isChemical && (
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Damaged
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedData.map(([name, data], index) => {
                  const isLowStock = data.available <= minStock;
                  const stockPercentage = Math.min((data.available / (minStock * 3)) * 100, 100);

                  return (
                    <TableRow
                      key={name}
                      sx={{
                        "&:hover": {
                          background: isLowStock
                            ? "rgba(244, 67, 54, 0.05)"
                            : "rgba(25, 118, 210, 0.04)",
                        },
                        background: isLowStock ? "rgba(244, 67, 54, 0.03)" : "inherit",
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography fontWeight={600}>{name}</Typography>
                          {isLowStock && (
                            <Chip
                              icon={<WarningAmberIcon />}
                              label="Low Stock"
                              size="small"
                              color="error"
                              sx={{ height: 24 }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Stack spacing={0.5} alignItems="center">
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: isLowStock ? "error.main" : "success.main",
                            }}
                          >
                            {data.available}
                          </Typography>
                          <Box sx={{ width: 60 }}>
                            <LinearProgress
                              variant="determinate"
                              value={stockPercentage}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: "rgba(0,0,0,0.1)",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 3,
                                  background: isLowStock
                                    ? "linear-gradient(90deg, #f44336, #e53935)"
                                    : "linear-gradient(90deg, #4caf50, #66bb6a)",
                                },
                              }}
                            />
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          icon={<SendIcon />}
                          label={data.distributed}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>

                      {!isChemical && (
                        <TableCell align="center">
                          <Chip
                            icon={<WarningAmberIcon />}
                            label={data.damaged}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </TableCell>
                      )}

                      <TableCell align="center">
                        {isLowStock ? (
                          <Chip
                            icon={<ErrorOutlineIcon />}
                            label="Reorder"
                            color="error"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Healthy"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
              <InventoryIcon sx={{ fontSize: 48 }} />
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(94, 92, 92, 0.9)" }}>
              Real-time inventory monitoring and analytics
            </Typography>
          </Box>
        </motion.div>

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 4,
              textAlign: "center",
              background: "white",
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" mt={3} color="text.secondary">
              Loading inventory data...
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={4}>
            {/* Alert Section */}
            {(lowStockEquipment > 0 || lowStockChemicals > 0) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Alert
                  severity="warning"
                  icon={<WarningAmberIcon />}
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Low Stock Alert
                  </Typography>
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    {lowStockEquipment > 0 && (
                      <Typography>
                        <strong>{lowStockEquipment}</strong> equipment items need reordering
                      </Typography>
                    )}
                    {lowStockChemicals > 0 && (
                      <Typography>
                        <strong>{lowStockChemicals}</strong> chemicals need reordering
                      </Typography>
                    )}
                  </Stack>
                </Alert>
              </motion.div>
            )}

            {/* Equipment Stats Cards */}
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                mb={3}
                sx={{ color: "rgba(94, 92, 92, 0.9)", display: "flex", alignItems: "center", gap: 1 }}
              >
                <InventoryIcon /> Equipment Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Stock Available"
                    value={Object.values(inventory).reduce((acc, i) => acc + i.available, 0)}
                    icon={<InventoryIcon sx={{ fontSize: 32 }} />}
                    gradient="linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
                    delay={0}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Distributed"
                    value={Object.values(inventory).reduce((acc, i) => acc + i.distributed, 0)}
                    icon={<SendIcon sx={{ fontSize: 32 }} />}
                    gradient="linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)"
                    delay={0.1}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Damaged"
                    value={Object.values(inventory).reduce((acc, i) => acc + i.damaged, 0)}
                    icon={<WarningAmberIcon sx={{ fontSize: 32 }} />}
                    gradient="linear-gradient(135deg, #f44336 0%, #ef5350 100%)"
                    delay={0.2}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Equipment Table */}
            <StockTable
              title="Equipment Stock Analysis"
              data={inventory}
              minStock={MIN_STOCK}
              isChemical={false}
            />

            {/* Chemical Stats Cards */}
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                mb={3}
                sx={{ color: "rgba(94, 92, 92, 0.9)", display: "flex", alignItems: "center", gap: 1 }}
              >
                <ScienceIcon /> Chemical Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StatCard
                    title="Total Chemical Stock"
                    value={Object.values(chemicalInventory).reduce((acc, i) => acc + i.available, 0)}
                    icon={<ScienceIcon sx={{ fontSize: 32 }} />}
                    gradient="linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)"
                    delay={0}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StatCard
                    title="Total Distributed"
                    value={Object.values(chemicalInventory).reduce((acc, i) => acc + i.distributed, 0)}
                    icon={<SendIcon sx={{ fontSize: 32 }} />}
                    gradient="linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)"
                    delay={0.1}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Chemical Table */}
            <StockTable
              title="Chemical Stock Analysis"
              data={chemicalInventory}
              minStock={MIN_CHEM_STOCK}
              isChemical={true}
            />
          </Stack>
        )}
      </Box>
    </Box>
  );
}