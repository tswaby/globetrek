import React from "react";
import { MapPin, Trash2 } from "lucide-react";

export default function ItineraryList({
  activeDay,
  activeDayStops,
  handleDeleteStop,
}) {
  if (!activeDayStops || activeDayStops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-900/40">
        <MapPin className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-xs font-semibold text-slate-500">
          No scheduled items for this day.
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Search for a location below to build your schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-indigo-150 dark:border-indigo-900 ml-3.5 pl-5 space-y-5">
      {activeDayStops.map((stop) => (
        <div key={stop.id} className="relative group">
          <span className="absolute -left-[27px] top-1 bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <span className="bg-indigo-600 rounded-full w-1.5 h-1.5" />
          </span>
          <div className="bg-slate-50 dark:bg-slate-850/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 tracking-wider">
                  {stop.time}
                </span>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mt-1">
                  {stop.name}
                </h4>
              </div>
              <button
                onClick={() => handleDeleteStop(activeDay, stop.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Delete stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {stop.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
