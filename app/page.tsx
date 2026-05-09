"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Map } from "maplibre-gl";
import MapView from "@/components/map/MapView";
import MapControls from "@/components/map/MapControls";
import MapMarker, { type MarkerData } from "@/components/map/MapMarker";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import FavoritesPanel from "@/components/favorites/FavoritesPanel";
import TopBar from "@/components/ui/TopBar";
import BottomNav from "@/components/ui/BottomNav";
import SearchBar from "@/components/search/SearchBar";
import { fetchPOIs } from "@/lib/geocoding/pois";
import type { NominatimResult } from "@/lib/geocoding/nominatim";
import { getFavorites, type Favorite } from "@/lib/storage/favorites";

interface PlaceInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  displayName: string;
  category?: string;
  distance?: string;
}

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  museum: "Musée",
  hotel: "Hôtel",
  fuel: "Station-service",
  parking: "Parking",
  hospital: "Hôpital",
  favorite: "Favori",
  me: "Ma position",
};

const categoryIcons: Record<string, string> = {
  restaurant: "🍽️",
  museum: "🏛️",
  hotel: "🏨",
  fuel: "⛽",
  parking: "🅿️",
  hospital: "🏥",
  favorite: "⭐",
  me: "📍",
};

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  if (d < 1000) return `${Math.round(d)} m`;
  return `${(d / 1000).toFixed(1)} km`;
}

export default function HomePage() {
  const mapRef = useRef<Map | null>(null);
  const [locating, setLocating] = useState(false);
  const [showPOIs, setShowPOIs] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceInfo | null>(null);

  const handleMapReady = useCallback((map: Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    getFavorites().then((favs) => setFavoritesCount(favs.length));
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1500,
        });
        setMarkers([
          {
            id: "me",
            lng: longitude,
            lat: latitude,
            label: "Ma position",
          },
        ]);
        setSelectedPlace({
          id: "me",
          name: "Ma position",
          lat: latitude,
          lng: longitude,
          displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          category: "me",
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleTogglePOIs = useCallback(async () => {
    const next = !showPOIs;
    setShowPOIs(next);
    if (next && mapRef.current) {
      const center = mapRef.current.getCenter();
      try {
        const pois = await fetchPOIs(center.lat, center.lng);
        setMarkers((prev) => [
          ...prev.filter((m) => !m.id.startsWith("poi-")),
          ...pois.map((p) => ({
            id: `poi-${p.id}`,
            lng: p.lng,
            lat: p.lat,
            label: p.name,
            category: p.category,
          })),
        ]);
      } catch {
        setShowPOIs(false);
      }
    } else {
      setMarkers((prev) => prev.filter((m) => !m.id.startsWith("poi-")));
      setSelectedPlace((prev) => (prev?.id.startsWith("poi-") ? null : prev));
    }
  }, [showPOIs]);

  const handleSearchSelect = useCallback((result: NominatimResult) => {
    const lng = parseFloat(result.lon);
    const lat = parseFloat(result.lat);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
    setMarkers([
      {
        id: String(result.place_id),
        lng,
        lat,
        label: result.display_name.split(",")[0],
        category: result.type || "search",
      },
    ]);
    setSelectedPlace({
      id: String(result.place_id),
      name: result.display_name.split(",")[0],
      lat,
      lng,
      displayName: result.display_name,
      category: result.type || "search",
    });
  }, []);

  const handleMarkerClick = useCallback((marker: MarkerData) => {
    if (marker.id === "me") {
      setSelectedPlace({
        id: "me",
        name: "Ma position",
        lat: marker.lat,
        lng: marker.lng,
        displayName: `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`,
        category: "me",
      });
      return;
    }

    if (marker.id.startsWith("fav-")) {
      setSelectedPlace({
        id: marker.id,
        name: marker.label,
        lat: marker.lat,
        lng: marker.lng,
        displayName: marker.label,
        category: "favorite",
      });
      return;
    }

    const cat = marker.category || "search";
    setSelectedPlace({
      id: marker.id,
      name: marker.label,
      lat: marker.lat,
      lng: marker.lng,
      displayName: marker.label,
      category: cat,
    });

    mapRef.current?.flyTo({
      center: [marker.lng, marker.lat],
      zoom: 16,
      duration: 800,
    });
  }, []);

  const handleFavoriteSelect = useCallback((fav: Favorite) => {
    mapRef.current?.flyTo({
      center: [fav.lng, fav.lat],
      zoom: 15,
      duration: 1500,
    });
    setMarkers([
      {
        id: `fav-${fav.id}`,
        lng: fav.lng,
        lat: fav.lat,
        label: fav.name,
        category: "favorite",
      },
    ]);
    setSelectedPlace({
      id: `fav-${fav.id}`,
      name: fav.name,
      lat: fav.lat,
      lng: fav.lng,
      displayName: fav.address || fav.name,
      category: "favorite",
    });
  }, []);

  const userLat = markers.find((m) => m.id === "me")?.lat;
  const userLng = markers.find((m) => m.id === "me")?.lat;

  return (
    <div className="h-full flex flex-col">
      <TopBar
        onSearchSelect={handleSearchSelect}
        onFavoritesClick={() => setFavoritesOpen(true)}
        favoritesCount={favoritesCount}
      />

      <div className="flex-1 relative overflow-hidden">
        <div className="md:hidden absolute top-3 left-3 right-20 z-10">
          <SearchBar onSelect={handleSearchSelect} />
        </div>

        <MapView onMapReady={handleMapReady} />

        <MapControls
          map={mapRef.current}
          onLocate={handleLocate}
          locating={locating}
          showPOIs={showPOIs}
          onTogglePOIs={handleTogglePOIs}
        />

        <MapMarker
          map={mapRef.current}
          markers={markers}
          onMarkerClick={handleMarkerClick}
        />

        {selectedPlace && (
          <div className="absolute bottom-[88px] md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm z-20 animate-slide-up">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-4 border border-white/50">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  selectedPlace.id === "me" ? "bg-indigo-100" : selectedPlace.category === "favorite" ? "bg-amber-100" : "bg-gray-100"
                }`}>
                  {categoryIcons[selectedPlace.category || ""] || "📍"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {selectedPlace.name}
                      </h3>
                      {selectedPlace.category && selectedPlace.category !== "me" && selectedPlace.category !== "favorite" && (
                        <span className="inline-block mt-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {categoryLabels[selectedPlace.category] || selectedPlace.category}
                        </span>
                      )}
                    </div>
                    <FavoriteButton
                      name={selectedPlace.name}
                      lat={selectedPlace.lat}
                      lng={selectedPlace.lng}
                      address={selectedPlace.displayName}
                      onToggle={(saved) => setFavoritesCount((c) => c + (saved ? 1 : -1))}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {selectedPlace.displayName}
                  </p>

                  <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-100">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-indigo-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M3 17l3-5 3 5M9 7h6M9 11h6M9 15h3" /><circle cx="18" cy="17" r="3" />
                      </svg>
                      Y aller
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <circle cx="12" cy="12" r="10" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                      </svg>
                      Partager
                    </button>
                    {userLat && userLng && selectedPlace.id !== "me" && (
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {getDistance(userLat, selectedPlace.lat, userLng, selectedPlace.lng)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav
        onSearchFocus={() => {
          const input = document.querySelector<HTMLInputElement>('[placeholder*="Rechercher"]');
          input?.focus();
        }}
        onFavoritesClick={() => setFavoritesOpen(true)}
        favoritesCount={favoritesCount}
      />

      <FavoritesPanel
        open={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        onSelect={handleFavoriteSelect}
      />
    </div>
  );
}
