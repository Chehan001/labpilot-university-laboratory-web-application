import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import reportRoutes from "./routes/generateReport.js";
app.use("/api/report", reportRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
