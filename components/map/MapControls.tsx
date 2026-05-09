"use client";

import { useCallback } from "react";
import type { Map } from "maplibre-gl";

interface MapControlsProps {
  map: Map | null;
  onLocate: () => void;
  locating: boolean;
  showPOIs: boolean;
  onTogglePOIs: () => void;
}

export default function MapControls({
  map,
  onLocate,
  locating,
  showPOIs,
  onTogglePOIs,
}: MapControlsProps) {
  const zoomIn = useCallback(() => map?.zoomIn({ duration: 300 }), [map]);
  const zoomOut = useCallback(() => map?.zoomOut({ duration: 300 }), [map]);
  const resetBearing = useCallback(
    () => map?.resetNorth({ duration: 300 }),
    [map]
  );

  return (
    <>
      <div className="absolute bottom-[80px] md:bottom-6 left-3 flex flex-col gap-2 z-10">
        <button
          onClick={onLocate}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors ${
            locating
              ? "bg-accent text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Ma position"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
        <button
          onClick={onTogglePOIs}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors ${
            showPOIs
              ? "bg-accent text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Afficher les POIs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-[80px] md:bottom-6 right-3 flex flex-col gap-2 z-10">
        <button onClick={zoomIn} className="w-10 h-10 rounded-xl shadow-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center" aria-label="Zoom avant">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
        </button>
        <button onClick={zoomOut} className="w-10 h-10 rounded-xl shadow-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center" aria-label="Zoom arrière">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
          </svg>
        </button>
        <button onClick={resetBearing} className="w-10 h-10 rounded-xl shadow-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center" aria-label="Nord">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </>
  );
}
