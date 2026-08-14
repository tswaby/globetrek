import React from "react";
import { Search, X, MapPin } from "lucide-react";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  showSuggestions,
  setShowSuggestions,
  liveResults,
  onSelectSuggestion,
}) {
  return (
    <div className="mb-3.5 relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search landmarks (e.g. Tokyo Tower, Seiko store)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full text-xs px-3 py-2.5 pl-9 rounded-xl border border-slate-300 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
        />

        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ⭐ FIX: show dropdown even when results are empty */}
      {showSuggestions && searchQuery.trim() && (
        <div className="absolute top-11 left-0 w-full bg-white dark:bg-slate-800 
                        border border-slate-200 dark:border-slate-700 rounded-xl 
                        shadow-xl overflow-hidden z-20 max-h-56 overflow-y-auto">

          {/* ⭐ Show “No results found” when list is empty */}
          {liveResults.length === 0 && (
            <div className="p-3 text-xs text-slate-500 dark:text-slate-400">
              No results found. Try a more specific search or wait a moment.
            </div>
          )}

          {/* ⭐ Show actual results when they exist */}
          {liveResults.map((loc, idx) => (
            <button
              key={`live-${idx}`}
              type="button"
              onClick={() => onSelectSuggestion(loc)}
              className="flex items-start gap-2.5 w-full text-left p-3 
                         hover:bg-slate-100 dark:hover:bg-slate-700 
                         border-b border-slate-100 dark:border-slate-700/50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {loc.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {loc.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
