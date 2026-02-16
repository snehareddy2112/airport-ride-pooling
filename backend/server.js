require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const rideRoutes = require("./src/routes/rideRoutes");

const app = express();

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// API routes
app.use("/ride", rideRoutes);

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
