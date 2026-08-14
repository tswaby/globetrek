import React from "react";
import { Calendar, Plus } from "lucide-react";

export default function DaySelector({
  trip,
  activeDay,
  setActiveDay,
  handleAddNewDay,
}) {
  // Safely compute days even when trip is still null on first render
  const days = trip?.itinerary ? Object.keys(trip.itinerary) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Select Trip Day
        </span>

        <button
          onClick={handleAddNewDay}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Day
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeDay === day
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>
    </div>
  );
}
