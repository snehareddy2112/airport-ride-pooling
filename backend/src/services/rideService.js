const RideGroup = require("../models/RideGroup");
const RideRequest = require("../models/RideRequest");
const Cab = require("../models/Cab");

const { findBestGroup, calculateRouteDistance } = require("../engines/matchingEngine");
const { calculateFare } = require("../engines/pricingEngine");

const createRide = async (newRequestData) => {
  const session = await RideGroup.startSession();
  session.startTransaction();

  try {

    const candidateGroups = await RideGroup.find({
      status: "FORMING",
      direction: newRequestData.direction
    }).session(session);

    const groupPassengersMap = {};

    for (const group of candidateGroups) {
      const passengers = await RideRequest.find({
        ride_group_id: group._id,
        status: "CONFIRMED"
      }).session(session);

      groupPassengersMap[group._id] = passengers;
    }

    const bestGroup = findBestGroup(
      newRequestData,
      candidateGroups,
      groupPassengersMap
    );

    let rideGroup;
    let extraDistance = 0;

    if (bestGroup) {

      const passengers = groupPassengersMap[bestGroup._id] || [];

      const existingDrops = passengers.map(p => ({
        lat: p.drop_lat,
        lng: p.drop_lng
      }));

      const oldDistance = calculateRouteDistance(existingDrops);

      const newDrops = [
        ...existingDrops,
        { lat: newRequestData.drop_lat, lng: newRequestData.drop_lng }
      ];

      const newDistance = calculateRouteDistance(newDrops);

      extraDistance = newDistance - oldDistance;

      rideGroup = await RideGroup.findOneAndUpdate(
        {
          _id: bestGroup._id,
          seats_used: { $lte: 4 - newRequestData.seats_required },
          luggage_used: { $lte: 4 - newRequestData.luggage_count }
        },
        {
          $inc: {
            seats_used: newRequestData.seats_required,
            luggage_used: newRequestData.luggage_count
          }
        },
        {
          returnDocument: "after",
          session
        }
      );

      if (!rideGroup) {
        throw new Error("Seat conflict occurred");
      }

    } else {

      const cab = await Cab.findOne({ is_active: true }).session(session);

      if (!cab) {
        throw new Error("No available cabs");
      }

      const newGroup = await RideGroup.create([{
        cab_id: cab._id,
        direction: newRequestData.direction,
        seats_used: newRequestData.seats_required,
        luggage_used: newRequestData.luggage_count
      }], { session });

      rideGroup = newGroup[0];
    }

    const activeFormingGroups = await RideGroup.countDocuments({ status: "FORMING" }).session(session);
    const totalActiveCabs = await Cab.countDocuments({ is_active: true }).session(session);

    const fare = calculateFare({
      drop_lat: newRequestData.drop_lat,
      drop_lng: newRequestData.drop_lng,
      extraDistance,
      passengerCount: rideGroup.seats_used,
      activeFormingGroups,
      totalActiveCabs
    });

    const rideRequest = await RideRequest.create([{
      ...newRequestData,
      ride_group_id: rideGroup._id,
      fare: fare,
      status: "CONFIRMED"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return {
      ride: rideRequest[0],
      fare
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelRide = async (rideRequestId) => {
  const session = await RideGroup.startSession();
  session.startTransaction();

  try {
    const rideRequest = await RideRequest.findById(rideRequestId).session(session);

    if (!rideRequest) {
      throw new Error("Ride request not found");
    }

    if (rideRequest.status !== "CONFIRMED") {
      throw new Error("Ride cannot be cancelled");
    }

    const rideGroup = await RideGroup.findById(rideRequest.ride_group_id).session(session);

    rideGroup.seats_used -= rideRequest.seats_required;
    rideGroup.luggage_used -= rideRequest.luggage_count;

    await rideGroup.save({ session });

    rideRequest.status = "CANCELLED";
    await rideRequest.save({ session });

    if (rideGroup.seats_used === 0) {
      rideGroup.status = "CANCELLED";
      await rideGroup.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return { message: "Ride cancelled successfully" };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createRide,
  cancelRide
};
