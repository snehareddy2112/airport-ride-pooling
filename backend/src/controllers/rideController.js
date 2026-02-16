const RideRequest = require("../models/RideRequest");
const RideGroup = require("../models/RideGroup");

const { createRide, cancelRide } = require("../services/rideService");

// ------------------ CREATE RIDE ------------------

const createRideRequest = async (req, res) => {
  try {
    const {
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      seats_required,
      luggage_count,
      detour_tolerance_km,
      direction
    } = req.body;

    if (
      pickup_lat === undefined ||
      pickup_lng === undefined ||
      drop_lat === undefined ||
      drop_lng === undefined ||
      seats_required === undefined ||
      luggage_count === undefined ||
      detour_tolerance_km === undefined ||
      !direction
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await createRide(req.body);

    res.status(201).json({
      message: "Ride booked successfully",
      ride: result.ride,
      fare: result.fare
    });

  } catch (error) {
    res.status(500).json({
      message: "Ride booking failed",
      error: error.message
    });
  }
};

// ------------------ CANCEL RIDE ------------------

const cancelRideRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await cancelRide(id);

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({
      message: "Cancellation failed",
      error: error.message
    });
  }
};

// ------------------ GET RIDE REQUEST ------------------

const getRideRequestById = async (req, res) => {
  try {
    const ride = await RideRequest.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ GET RIDE GROUP ------------------

const getRideGroupById = async (req, res) => {
  try {
    const group = await RideGroup.findById(req.params.id).populate("cab_id");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const passengers = await RideRequest.find({
      ride_group_id: group._id
    });

    res.json({
      group,
      passengers
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ LIST ACTIVE GROUPS ------------------

const listActiveGroups = async (req, res) => {
  try {
    const groups = await RideGroup.find({ status: "FORMING" });

    res.json(groups);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRideRequest,
  cancelRideRequest,
  getRideRequestById,
  getRideGroupById,
  listActiveGroups
};
