const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

module.exports = app;
