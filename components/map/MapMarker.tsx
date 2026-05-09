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
  category?: string;
  onClick?: () => void;
}

interface MapMarkerProps {
  map: Map | null;
  markers: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
}

const markerIcons: Record<string, string> = {
  me: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`,
  restaurant: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`,
  museum: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>`,
  hotel: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M3 21V3h18v18M3 9h18M3 15h18M9 9v12M15 9v12"/></svg>`,
  fuel: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M3 22V2h12v20M15 10h2a2 2 0 012 2v4a2 2 0 004 0v-5l-3-3"/><path d="M3 16h12"/></svg>`,
  parking: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>`,
  hospital: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>`,
  favorite: `<svg viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
};

const markerColors: Record<string, string> = {
  me: "#6366f1",
  restaurant: "#ef4444",
  museum: "#8b5cf6",
  hotel: "#f59e0b",
  fuel: "#10b981",
  parking: "#3b82f6",
  hospital: "#ec4899",
  favorite: "#f59e0b",
  search: "#ef4444",
  default: "#6366f1",
};

function getCategory(marker: MarkerData): string {
  if (marker.id === "me") return "me";
  if (marker.id.startsWith("fav-")) return "favorite";
  if (marker.id.startsWith("poi-")) return marker.category || "default";
  return "search";
}

export default function MapMarker({ map, markers, onMarkerClick }: MapMarkerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((marker) => {
      const cat = getCategory(marker);
      const color = marker.color || markerColors[cat] || markerColors.default;
      const isMe = cat === "me";
      const size = isMe ? 28 : 24;

      const el = document.createElement("div");
      el.className = "nextmap-marker";
      el.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        pointer-events: auto;
        position: relative;
        z-index: 10;
      `;
      el.innerHTML = markerIcons[cat] || markerIcons.search;
      const svg = el.querySelector("svg");
      if (svg) svg.style.pointerEvents = "none";
      el.title = marker.label;

      let downX = 0;
      let downY = 0;

      el.addEventListener("mousedown", (e) => {
        downX = e.clientX;
        downY = e.clientY;
      });

      el.addEventListener("mouseup", (e) => {
        const dx = Math.abs(e.clientX - downX);
        const dy = Math.abs(e.clientY - downY);
        if (dx < 5 && dy < 5) {
          onMarkerClick?.(marker);
          marker.onClick?.();
        }
      });

      el.addEventListener("touchstart", (e) => {
        const t = e.changedTouches[0];
        downX = t.clientX;
        downY = t.clientY;
      });

      el.addEventListener("touchend", (e) => {
        const t = e.changedTouches[0];
        const dx = Math.abs(t.clientX - downX);
        const dy = Math.abs(t.clientY - downY);
        if (dx < 10 && dy < 10) {
          e.preventDefault();
          onMarkerClick?.(marker);
          marker.onClick?.();
        }
      });

      const m = new maplibregl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);
      m.getElement().style.pointerEvents = "auto";

      markersRef.current.push(m);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [map, markers, onMarkerClick]);

  return null;
}
