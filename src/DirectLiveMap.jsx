import React, { useEffect, useRef } from "react";

export default function DirectLiveMap({
  stops,
  activeDay,
  offlineMode,
  onSnapshot,
  snapshotRef,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const mapReadyRef = useRef(false); // ⭐ NEW: track tile readiness

  // Initialize map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current || offlineMode) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
      });

      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      });

      tileLayer.addTo(mapInstanceRef.current);

      // ⭐ Mark map as ready only when tiles finish loading
      mapInstanceRef.current.on("load", () => {
        mapReadyRef.current = true;
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapReadyRef.current = false;
      }
    };
  }, [offlineMode]);

  // Update markers + polyline
  useEffect(() => {
    if (!window.L || !mapInstanceRef.current || offlineMode) return;
    const L = window.L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!stops || stops.length === 0) {
      const center =
        activeDay === "2" ? [35.0116, 135.7681] : [35.6762, 139.6503];
      mapInstanceRef.current.setView(center, 12);
      return;
    }

    stops.forEach((stop, idx) => {
      const customIcon = L.divIcon({
        html: `<div class="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full border-2 border-white shadow-xl w-7 h-7 text-xs transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150">${idx + 1}</div>`,
        className: "custom-div-icon",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popupContent = `
        <div class="p-1 min-w-[120px]">
          <span class="inline-block text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded mb-1">
            ${stop.time}
          </span>
          <h4 class="font-bold text-xs text-slate-900 m-0">${stop.name}</h4>
          <p class="text-[10px] text-slate-600 mt-1 leading-normal m-0">${stop.description}</p>
        </div>
      `;

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(mapInstanceRef.current);

      markersRef.current.push(marker);
    });

    if (stops.length > 1) {
      const positions = stops.map((s) => [s.lat, s.lng]);
      polylineRef.current = L.polyline(positions, {
        color: "#4f46e5",
        weight: 3,
        dashArray: "5,10",
      }).addTo(mapInstanceRef.current);
    }

    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [stops, activeDay, offlineMode]);

  // ⭐ Snapshot function
  const handleSnapshot = () => {
    const map = mapInstanceRef.current;

    // ⭐ Prevent snapshot until tiles are ready
    if (!mapReadyRef.current) {
      console.warn("Map not ready yet — delaying snapshot...");
      return;
    }

    if (!map || !window.leafletImage) return;

    window.leafletImage(map, (err, canvas) => {
      if (err) {
        console.error("Snapshot error:", err);
        return;
      }

      const dataURL = canvas.toDataURL("image/jpeg", 0.92);

      if (onSnapshot) onSnapshot(dataURL);

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `trip-map-day-${activeDay}.jpg`;
      link.click();
    });
  };

  // ⭐ Expose snapshot function to parent
  useEffect(() => {
    if (snapshotRef) {
      snapshotRef.current = handleSnapshot;
    }
  }, [snapshotRef]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
    </div>
  );
}
