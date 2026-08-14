export function loadTrips() {
  try {
    const saved = localStorage.getItem("globetrek_trips");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveTrips(trips) {
  localStorage.setItem("globetrek_trips", JSON.stringify(trips));
}

export function createTrip(destination, startDate, endDate) {
  const id = `trip-${Date.now()}`;

  return {
    id,
    destination,
    startDate,
    endDate,
    itinerary: {
      "1": [] // Start with Day 1 empty
    }
  };
}

export function deleteTrip(trips, tripId) {
  const updated = { ...trips };
  delete updated[tripId];
  return updated;
}
