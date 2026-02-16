const mongoose = require("mongoose");

const rideGroupSchema = new mongoose.Schema({
  cab_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cab",
    required: true
  },
  direction: {
    type: String,
    enum: ["FROM_AIRPORT", "TO_AIRPORT"],
    required: true
  },
  seats_used: {
    type: Number,
    default: 0
  },
  luggage_used: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["FORMING", "ACTIVE", "COMPLETED", "CANCELLED"],
    default: "FORMING"
  }
}, { timestamps: true });

// IMPORTANT INDEX
rideGroupSchema.index({
  status: 1,
  direction: 1,
  seats_used: 1,
  luggage_used: 1
});

module.exports = mongoose.model("RideGroup", rideGroupSchema);
