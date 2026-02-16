const express = require("express");
const router = express.Router();

const {
  createRideRequest,
  cancelRideRequest,
  getRideRequestById,
  getRideGroupById,
  listActiveGroups
} = require("../controllers/rideController");

router.post("/request", createRideRequest);
router.post("/cancel/:id", cancelRideRequest);

router.get("/request/:id", getRideRequestById);
router.get("/group/:id", getRideGroupById);
router.get("/groups", listActiveGroups);

module.exports = router;
