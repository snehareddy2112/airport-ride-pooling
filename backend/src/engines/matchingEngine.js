// backend/src/engines/matchingEngine.js

const AIRPORT_LOCATION = {
  lat: 17.2403,
  lng: 78.4294
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const calculateRouteDistance = (dropPoints) => {
  if (!dropPoints || dropPoints.length === 0) return 0;

  const sortedDrops = [...dropPoints].sort((a, b) => {
    const distA = haversineDistance(
      AIRPORT_LOCATION.lat,
      AIRPORT_LOCATION.lng,
      a.lat,
      a.lng
    );

    const distB = haversineDistance(
      AIRPORT_LOCATION.lat,
      AIRPORT_LOCATION.lng,
      b.lat,
      b.lng
    );

    return distA - distB;
  });

  let totalDistance = 0;

  totalDistance += haversineDistance(
    AIRPORT_LOCATION.lat,
    AIRPORT_LOCATION.lng,
    sortedDrops[0].lat,
    sortedDrops[0].lng
  );

  for (let i = 1; i < sortedDrops.length; i++) {
    totalDistance += haversineDistance(
      sortedDrops[i - 1].lat,
      sortedDrops[i - 1].lng,
      sortedDrops[i].lat,
      sortedDrops[i].lng
    );
  }

  return totalDistance;
};

// -------------------- MATCHING LOGIC --------------------

const PICKUP_RADIUS_THRESHOLD = 5; // km

const findBestGroup = (newRequest, candidateGroups, groupPassengersMap) => {
  let bestGroup = null;
  let minExtraDistance = Infinity;

  for (const group of candidateGroups) {
    // 1. Seat constraint
    const totalSeats = 4; // since cab is fixed at 4
    if (group.seats_used + newRequest.seats_required > totalSeats) {
      continue;
    }

    // 2. Luggage constraint
    const totalLuggage = 4;
    if (group.luggage_used + newRequest.luggage_count > totalLuggage) {
      continue;
    }

    // 3. Pickup proximity check
    const pickupDistance = haversineDistance(
      newRequest.pickup_lat,
      newRequest.pickup_lng,
      AIRPORT_LOCATION.lat,
      AIRPORT_LOCATION.lng
    );

    if (pickupDistance > PICKUP_RADIUS_THRESHOLD) {
      continue;
    }

    // 4. Get existing drop points
    const passengers = groupPassengersMap[group._id] || [];

    const existingDrops = passengers.map(p => ({
      lat: p.drop_lat,
      lng: p.drop_lng
    }));

    const oldRouteDistance = calculateRouteDistance(existingDrops);

    // 5. Add new passenger drop
    const newDrops = [
      ...existingDrops,
      {
        lat: newRequest.drop_lat,
        lng: newRequest.drop_lng
      }
    ];

    const newRouteDistance = calculateRouteDistance(newDrops);

    const extraDistance = newRouteDistance - oldRouteDistance;

    // 6. Check detour tolerance for all passengers
    let isValid = true;

    for (const passenger of passengers) {
      if (extraDistance > passenger.detour_tolerance_km) {
        isValid = false;
        break;
      }
    }

    if (extraDistance > newRequest.detour_tolerance_km) {
      isValid = false;
    }

    if (!isValid) continue;

    // 7. Minimize extra distance
    if (extraDistance < minExtraDistance) {
      minExtraDistance = extraDistance;
      bestGroup = group;
    }
  }

  return bestGroup;
};

module.exports = {
  AIRPORT_LOCATION,
  haversineDistance,
  calculateRouteDistance,
  findBestGroup
};
