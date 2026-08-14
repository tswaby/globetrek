import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTrip, deleteTrip, loadTrips, saveTrips } from "./tripUtils";

export default function TripsDashboard() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState({});
  const [creating, setCreating] = useState(false);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loaded = loadTrips();
    setTrips(loaded);
  }, []);

  const handleCreateTrip = () => {
    if (!destination.trim() || !startDate || !endDate) return;

    const newTrip = createTrip(destination, startDate, endDate);
    const updated = { ...trips, [newTrip.id]: newTrip };

    setTrips(updated);
    saveTrips(updated);

    // Reset form
    setDestination("");
    setStartDate("");
    setEndDate("");
    setCreating(false);

    // Navigate to the new trip
    navigate(`/trip/${newTrip.id}`);
  };

  const handleDeleteTrip = (tripId) => {
    const updated = deleteTrip(trips, tripId);
    setTrips(updated);
    saveTrips(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        My Trips
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Trip Cards */}
        {Object.values(trips).map((trip) => (
          <div
            key={trip.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {trip.destination}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {trip.startDate} → {trip.endDate}
            </p>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold"
              >
                Open Trip
              </button>

              <button
                onClick={() => handleDeleteTrip(trip.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}

        {/* Create New Trip Card */}
        <div
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer"
          onClick={() => !creating && setCreating(true)}
        >
          {!creating ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Plus className="w-10 h-10 text-indigo-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Create New Trip
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                New Trip
              </h2>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                />

                <button
                  onClick={handleCreateTrip}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg"
                >
                  Create Trip
                </button>

                <button
                  onClick={() => setCreating(false)}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mt-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
