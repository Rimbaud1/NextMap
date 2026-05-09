"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Map } from "maplibre-gl";

interface MapPopupProps {
  map: Map | null;
  lng: number;
  lat: number;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MapPopup({
  map,
  lng,
  lat,
  visible,
  onClose,
  children,
}: MapPopupProps) {
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (visible) {
      popupRef.current?.remove();

      const container = document.createElement("div");
      container.appendChild(document.createElement("div"));
      popupRef.current = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      })
        .setLngLat([lng, lat])
        .setDOMContent(container)
        .addTo(map);

      popupRef.current.on("close", onClose);

      return () => {
        popupRef.current?.remove();
      };
    } else {
      popupRef.current?.remove();
      popupRef.current = null;
    }
  }, [map, lng, lat, visible, onClose]);

  if (!visible) return null;

  return <div className="hidden">{children}</div>;
}
