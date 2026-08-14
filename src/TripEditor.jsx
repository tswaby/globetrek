import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapPin,
  Calendar,
  Wifi,
  WifiOff,
  Download,
  Plus,
  Trash2,
  Search,
  Compass,
  Info,
  Clock,
  Navigation,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

import DirectLiveMap from "./DirectLiveMap";
import DaySelector from "./DaySelector";
import ItineraryList from "./ItineraryList";
import SearchBar from "./SearchBar";
import AddStopForm from "./AddStopForm";

import { useParams, useNavigate } from "react-router-dom";
import { loadTrips, saveTrips } from "./tripUtils";

export default function TripEditor() {

async function geocodeLocation(name) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    name
  )}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en",
      },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

async function searchGeocode(query) {
  if (!query.trim()) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "GlobeTrek Travel Planner (student project)"
      }
    });

    // If rate-limited, Nominatim returns empty array
    const data = await response.json();

    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || "location",
      description:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.state ||
        "Location"
    }));
  } catch (err) {
    console.error("Search geocoding failed:", err);
    return [];
  }
}


const { tripId } = useParams();
const navigate = useNavigate();

const [trip, setTrip] = useState(null);
const [trips, setTrips] = useState({});

const [showToast, setShowToast] = useState(false);

const directSnapshotRef = useRef(null);

const triggerMapSnapshot = () => {
  // This calls DirectLiveMap’s snapshot function
  if (directSnapshotRef.current) {
    directSnapshotRef.current();
  }
};


const handleSnapshotFromHeader = (dataURL) => {
  localStorage.setItem(`mapSnapshot-${activeDay}`, dataURL);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2500);
};



useEffect(() => {
  const loaded = loadTrips();
  setTrips(loaded);

  if (loaded[tripId]) {
    setTrip(loaded[tripId]);
  }
}, [tripId]);

useEffect(() => {
  if (!trip) return;
  const updated = { ...trips, [trip.id]: trip };
  setTrips(updated);
  saveTrips(updated);
}, [trip]);


  const [activeDay, setActiveDay] = useState("1");
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlinePanelExpanded, setOfflinePanelExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customTime, setCustomTime] = useState("12:00 PM");
  const [customDesc, setCustomDesc] = useState("");
  const [customType, setCustomType] = useState("sightseeing");
  const [selectedAddDay, setSelectedAddDay] = useState("1");
  const [notification, setNotification] = useState(null);
  const [liveResults, setLiveResults] = useState([]);
  const [selectedSuggestionCoords, setSelectedSuggestionCoords] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);

    // ⭐ Add Leaflet-Image here
    const imgScript = document.createElement("script");
    imgScript.src = "https://unpkg.com/leaflet-image/leaflet-image.js";
    imgScript.async = true;
    document.head.appendChild(imgScript);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(imgScript)) document.head.removeChild(imgScript);
    };
  }, []);


  const activeDayStops = useMemo(() => {
    return trip?.itinerary?.[activeDay] || [];
  }, [trip, activeDay]);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    let active = true;
    let debounceTimer;

    if (!searchQuery.trim()) {
      setLiveResults([]);
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await searchGeocode(searchQuery);
      if (active) setLiveResults(results);
    }, 1000); // 1 second debounce

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  const savedSnapshot = localStorage.getItem(`mapSnapshot-${activeDay}`);

  const tripStats = useMemo(() => {
    if (!trip) return { daysCount: 0, totalStops: 0 };

    let totalStops = 0;
    const days = Object.keys(trip.itinerary);

    days.forEach((d) => {
      totalStops += (trip.itinerary[d] || []).length;
    });

    return { daysCount: days.length, totalStops };
  }, [trip]);

  const stopsByDay = trip?.itinerary || {};


  const handleSelectSuggestion = (suggestion) => {
    setCustomName(suggestion.name);
    setCustomDesc(suggestion.description);
    setCustomType(suggestion.type || "location");
    setSelectedSuggestionCoords({
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setNotification({
      type: "info",
      message: `Selected "${suggestion.name}". Choose your time and click Add!`,
    });
  };

  const handleAddStop = async (e) => {
    e.preventDefault();

    if (!customName.trim()) {
      setNotification({
        type: "error",
        message: "Destination name is required!",
      });
      return;
    }

    const dayKey = String(selectedAddDay);

    let geo = selectedSuggestionCoords;
    if (!geo) {
      geo = await geocodeLocation(customName.trim());
    }

    if (!geo) {
      setNotification({
        type: "error",
        message: `Could not find coordinates for "${customName}". Try a more specific name.`,
      });
      return;
    }

    const newStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: customName.trim(),
      time: customTime,
      description: customDesc.trim() || "Custom scheduled stop.",
      type: customType,
      lat: geo.lat,
      lng: geo.lng,
    };

    // ⭐ THIS WAS MISSING — and caused the syntax error
    setTrip(prev => {
      const updatedItinerary = { ...prev.itinerary };

      if (!updatedItinerary[dayKey]) {
        updatedItinerary[dayKey] = [];
      }

      updatedItinerary[dayKey] = [...updatedItinerary[dayKey], newStop];

      return {
        ...prev,
        itinerary: updatedItinerary
      };
    });

    setCustomName("");
    setCustomDesc("");
    setCustomTime("12:00 PM");
    setSelectedSuggestionCoords(null);
    setActiveDay(dayKey);

    setNotification({
      type: "success",
      message: `Added "${newStop.name}" to Day ${dayKey} with real coordinates!`,
    });
  };


  const handleDeleteStop = (dayKey, stopId) => {
    setTrip((prev) => {
      const updatedItinerary = { ...prev.itinerary };
      if (updatedItinerary[dayKey]) {
        updatedItinerary[dayKey] = updatedItinerary[dayKey].filter(
          (stop) => stop.id !== stopId
        );
      }
      return {
        ...prev,
        itinerary: updatedItinerary,
      };
    });

    setNotification({
      type: "success",
      message: "Stop removed from schedule.",
    });
  };

  const handleAddNewDay = () => {
    const existingDays = Object.keys(trip.itinerary).map(Number);
    const nextDayNum =
      existingDays.length > 0 ? Math.max(...existingDays) + 1 : 1;
    const nextDayStr = String(nextDayNum);

    setTrip((prev) => ({
      ...prev,
      itinerary: {
        ...prev.itinerary,
        [nextDayStr]: [],
      },
    }));

    setActiveDay(nextDayStr);
    setSelectedAddDay(nextDayStr);

    setNotification({
      type: "success",
      message: `Day ${nextDayStr} added to your plan!`,
    });
  };

  const handleResetTrip = () => {
    if (
      window.confirm(
        "Are you sure you want to reset back to the Tokyo/Kyoto default itinerary?"
      )
    ) {
      setTrip({
        ...trip,
        itinerary: { "1": [] }
        });
        setActiveDay("1");
        setSelectedAddDay("1");

    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">

        {/* Back Button */}
        <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
            <span className="text-lg">←</span>
            Back to Dashboard
        </button>

        {/* Title */}
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            GlobeTrek Trip Editor
            </h1>

            {trip && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
                {trip && (
                  <>
                    {trip.destination} ({trip.startDate} - {trip.endDate})
                  </>
                )}
            </p>
            )}
        </div>

        {/* Offline Toggle */}
        <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            offlineMode
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
        >
            {offlineMode ? "Offline Mode" : "Online Mode"}
        </button>

        </header>


      {notification && (
        <div className="absolute top-20 right-6 flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-700 z-50">
          {notification.type === "error" && (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          {notification.type === "success" && (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          {notification.type === "info" && (
            <Info className="w-4 h-4 text-indigo-300" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden w-full">
        {/* LEFT PANEL */}
        <div className="w-full md:w-[420px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <DaySelector
              trip={trip}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              handleAddNewDay={handleAddNewDay}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Day {activeDay} Itinerary stops
                </h3>
                <span className="text-xs text-slate-400">
                  {activeDayStops.length} stops scheduled
                </span>
              </div>

              <ItineraryList
                activeDay={activeDay}
                activeDayStops={activeDayStops}
                handleDeleteStop={handleDeleteStop}
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-500" />
                Add Stops to Schedule
              </h3>

              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                liveResults={liveResults}
                onSelectSuggestion={handleSelectSuggestion}
              />

              <AddStopForm
                customName={customName}
                setCustomName={setCustomName}
                customTime={customTime}
                setCustomTime={setCustomTime}
                customDesc={customDesc}
                setCustomDesc={setCustomDesc}
                customType={customType}
                setCustomType={setCustomType}
                selectedAddDay={selectedAddDay}
                setSelectedAddDay={setSelectedAddDay}
                trip={trip}
                onSubmit={handleAddStop}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 rounded-xl p-3 shadow-sm">
              <button
                onClick={() =>
                  setOfflinePanelExpanded(!offlinePanelExpanded)
                }
                className="flex items-center justify-between w-full font-bold text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-500" />
                  Offline Trip Snapshot
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] rounded font-mono font-bold text-slate-500">
                    {tripStats.totalStops} Stops
                  </span>
                  {offlinePanelExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {offlinePanelExpanded && (
                <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-3 max-h-40 overflow-y-auto">
                  <div className="bg-amber-50 dark:bg-amber-950/35 border border-amber-200/50 dark:border-amber-900/40 p-2 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      This data is cached locally on your device. You can safely
                      view all of these stops when fully offline!
                    </span>
                  </div>
                  {savedSnapshot && (
                    <img
                      src={savedSnapshot}
                      alt="Offline Map Snapshot"
                      className="rounded-xl border border-slate-300 dark:border-slate-700 shadow-md w-full mt-2"
                    />
                  )}

                  <div className="space-y-2">
                    {Object.keys(trip.itinerary).map((day) => {
                      const stops = trip.itinerary[day] || [];
                      return (
                        <div
                          key={day}
                          className="border-b border-slate-100 dark:border-slate-800 pb-1.5 last:border-0 last:pb-0"
                        >
                          <p className="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                            <span>Day {day} Schedule:</span>
                            <span className="text-slate-400 text-[10px]">
                              {stops.length} stops
                            </span>
                          </p>
                          {stops.length > 0 ? (
                            <p className="text-slate-400 dark:text-slate-500 mt-0.5 italic truncate">
                              {stops.map((s) => s.name).join(" • ")}
                            </p>
                          ) : (
                            <p className="text-slate-300 dark:text-slate-600 italic">
                              No scheduled stops.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 flex flex-col h-full overflow-hidden relative">
          {showToast && (
            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-[30000]">
              Map snapshot saved!
            </div>
          )}

          <div className="absolute top-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-lg z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Active Trip
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Oct 15 - Oct 20
                </span>
              </div>
              {trip && (
                <h2 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                  {trip.destination} - Day {activeDay} Route Plan
                </h2>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase">
                  Total Stops
                </p>
                <p className="text-slate-700 dark:text-slate-200 text-sm font-bold">
                  {tripStats.totalStops} visited
                </p>
              </div>
              <button
                onClick={() => {
                  if (directSnapshotRef.current) {
                    directSnapshotRef.current();   // ⭐ triggers DirectLiveMap snapshot
                  }
                }}

                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-[10px] shadow"
              >
                Save Map
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase">
                  Trip Days
                </p>
                <p className="text-slate-700 dark:text-slate-200 text-sm font-bold">
                  {tripStats.daysCount} active
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full h-full flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-950/20 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            {offlineMode ? (
              savedSnapshot ? (
                // ⭐ SHOW SNAPSHOT WHEN OFFLINE
                <div className="w-full h-full max-w-2xl max-h-[500px] bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col z-0 p-4">
                  <img
                    src={savedSnapshot}
                    alt="Offline Map Snapshot"
                    className="rounded-xl w-full h-auto border border-slate-300 dark:border-slate-700 shadow-md"
                  />

                  <button
                    onClick={() => setOfflineMode(false)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition self-center"
                  >
                    Reconnect Map
                  </button>
                </div>
              ) : (
                // ⭐ FALLBACK: NO SNAPSHOT SAVED YET
                <div className="z-10 flex flex-col items-center justify-center p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800 max-w-sm rounded-2xl text-center shadow-2xl">
                  <div className="bg-amber-100 text-amber-800 p-4 rounded-full mb-4 dark:bg-amber-950 dark:text-amber-400 shadow-md">
                    <WifiOff className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Map View Unavailable Offline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Active tile loading has been paused during simulated offline
                    performance mode. Your itinerary updates will automatically
                    sync when network access is restored.
                  </p>
                  <button
                    onClick={() => setOfflineMode(false)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                  >
                    Reconnect Map
                  </button>
                </div>
              )
            ): !leafletLoaded ? (
              <div className="z-10 flex flex-col items-center justify-center p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800 max-w-sm rounded-2xl text-center shadow-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Loading Map Assets...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Integrating global positioning framework.
                </p>
              </div>
            ) : (
              <div className="w-full h-full max-w-2xl max-h-[500px] bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col z-0">
                <div className="flex-1 w-full h-full min-h-[350px]">
                  <DirectLiveMap
                    stops={stopsByDay[activeDay]}
                    activeDay={activeDay}
                    offlineMode={offlineMode}
                    onSnapshot={(dataURL) => handleSnapshotFromHeader(dataURL)}
                    snapshotRef={directSnapshotRef}
                  />


                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 text-white border border-slate-800 p-3 rounded-xl flex items-center justify-between text-[11px] backdrop-blur z-[1000] shadow-lg">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    Map dynamic: showing {activeDayStops.length} live
                    interactive markers.
                  </span>
                  <span className="text-slate-400">Powered by Leaflet CDN</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
