const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema({
  pickup_lat: Number,
  pickup_lng: Number,
  drop_lat: Number,
  drop_lng: Number,
  seats_required: Number,
  luggage_count: Number,
  detour_tolerance_km: Number,
  direction: {
    type: String,
    enum: ["FROM_AIRPORT", "TO_AIRPORT"],
    required: true
  },
  ride_group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RideGroup",
    default: null
  },
  fare: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
    default: "PENDING"
  }
}, { timestamps: true });

rideRequestSchema.index({ ride_group_id: 1 });

module.exports = mongoose.model("RideRequest", rideRequestSchema);
