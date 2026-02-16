// backend/src/engines/pricingEngine.js

const { haversineDistance, AIRPORT_LOCATION } = require("./matchingEngine");

const RATE_PER_KM = 20;        // base rate
const DETOUR_RATE = 5;         // penalty per extra km

const calculateFare = ({
  drop_lat,
  drop_lng,
  extraDistance,
  passengerCount,
  activeFormingGroups,
  totalActiveCabs
}) => {

  // 1️⃣ Base distance (airport to drop)
  const baseDistance = haversineDistance(
    AIRPORT_LOCATION.lat,
    AIRPORT_LOCATION.lng,
    drop_lat,
    drop_lng
  );

  const baseFare = baseDistance * RATE_PER_KM;

  // 2️⃣ Surge factor
  let surgeFactor = 1;

  if (totalActiveCabs > 0) {
    surgeFactor = 1 + (activeFormingGroups / totalActiveCabs);
  }

  // 3️⃣ Shared split
  const sharedFare = baseFare / passengerCount;

  // 4️⃣ Detour penalty
  const detourCost = extraDistance * DETOUR_RATE;

  // 5️⃣ Final fare
  const finalFare = (sharedFare * surgeFactor) + detourCost;

  return Math.round(finalFare);
};

module.exports = {
  calculateFare
};
