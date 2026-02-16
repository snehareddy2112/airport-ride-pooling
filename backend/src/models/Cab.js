const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema({
  total_seats: {
    type: Number,
    required: true,
    default: 4
  },
  luggage_capacity: {
    type: Number,
    required: true,
    default: 4
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Cab", cabSchema);
