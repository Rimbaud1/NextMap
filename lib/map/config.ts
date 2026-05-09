import type { StyleSpecification } from "maplibre-gl";

export const MAP_DEFAULTS = {
  center: [2.3522, 48.8566] as [number, number],
  zoom: 12,
  minZoom: 2,
  maxZoom: 18,
  pitch: 0,
  bearing: 0,
};

export const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const POI_CATEGORIES = [
  { id: "restaurant", label: "Restaurants", color: "#ef4444" },
  { id: "museum", label: "Museums", color: "#8b5cf6" },
  { id: "hotel", label: "Hotels", color: "#f59e0b" },
  { id: "fuel", label: "Stations-service", color: "#10b981" },
  { id: "parking", label: "Parkings", color: "#3b82f6" },
  { id: "hospital", label: "Hôpitaux", color: "#ec4899" },
] as const;
