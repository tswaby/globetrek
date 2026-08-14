import React from "react";
import { Plus } from "lucide-react";

export default function AddStopForm({
  customName,
  setCustomName,
  customTime,
  setCustomTime,
  customDesc,
  setCustomDesc,
  customType,
  setCustomType,
  selectedAddDay,
  setSelectedAddDay,
  trip,
  onSubmit,
}) {
  // Safely compute days even when trip is null on first render
  const days = trip?.itinerary ? Object.keys(trip.itinerary) : [];

  return (
    <form onSubmit={onSubmit} className="space-y-3.5 mt-3">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
          Destination Name
        </label>
        <input
          type="text"
          placeholder="Enter custom landmark name..."
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            Time Block
          </label>
          <input
            type="text"
            placeholder="e.g. 10:30 AM"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            Schedule Day
          </label>
          <select
            value={selectedAddDay}
            onChange={(e) => setSelectedAddDay(e.target.value)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
          Description / Notes
        </label>
        <textarea
          placeholder="Add travel notes, bookings or must-see info..."
          value={customDesc}
          onChange={(e) => setCustomDesc(e.target.value)}
          rows={2}
          className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 resize-none"
        />
      </div>

      <div className="flex gap-2">
        {["sightseeing", "culture", "nature", "food"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setCustomType(type)}
            className={`flex-1 text-[10px] font-bold py-1 px-1.5 rounded-md uppercase border transition ${
              customType === type
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Save Destination
      </button>
    </form>
  );
}
