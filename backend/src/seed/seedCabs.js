require("dotenv").config();
const mongoose = require("mongoose");
const Cab = require("../models/Cab");

const seedCabs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await Cab.deleteMany({});

    const cabs = [];

    for (let i = 0; i < 5; i++) {
      cabs.push({
        total_seats: 4,
        luggage_capacity: 4,
        is_active: true
      });
    }

    await Cab.insertMany(cabs);

    console.log("5 Cabs Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedCabs();
