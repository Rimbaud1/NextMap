"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Map } from "maplibre-gl";

export interface MarkerData {
  id: string;
  lng: number;
  lat: number;
  label: string;
  color?: string;
  onClick?: () => void;
}

interface MapMarkerProps {
  map: Map | null;
  markers: MarkerData[];
}

export default function MapMarker({ map, markers }: MapMarkerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach(({ lng, lat, label, color, onClick }) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 12px; height: 12px;
        background: ${color || "#6366f1"};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      el.title = label;

      if (onClick) {
        el.addEventListener("click", onClick);
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [map, markers]);

  return null;
}
