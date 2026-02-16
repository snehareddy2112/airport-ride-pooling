require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const rideRoutes = require("./src/routes/rideRoutes");

const app = express();

app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// IMPORTANT: Mount routes BEFORE listen
app.use("/ride", rideRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Ride Pooling Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
