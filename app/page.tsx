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

export default function HomePage() {
  const mapRef = useRef<Map | null>(null);
  const [locating, setLocating] = useState(false);
  const [showPOIs, setShowPOIs] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    lat: number;
    lng: number;
    displayName: string;
  } | null>(null);

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
            color: "#6366f1",
          },
        ]);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Impossible d'obtenir votre position.");
      },
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
            color: p.color,
          })),
        ]);
      } catch {
        setShowPOIs(false);
      }
    } else {
      setMarkers((prev) => prev.filter((m) => !m.id.startsWith("poi-")));
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
        color: "#ef4444",
      },
    ]);
    setSelectedPlace({
      name: result.display_name.split(",")[0],
      lat,
      lng,
      displayName: result.display_name,
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
        color: "#f59e0b",
      },
    ]);
    setSelectedPlace({
      name: fav.name,
      lat: fav.lat,
      lng: fav.lng,
      displayName: fav.address || fav.name,
    });
  }, []);

  return (
    <div className="h-full flex flex-col">
      <TopBar
        onSearchSelect={handleSearchSelect}
        onFavoritesClick={() => setFavoritesOpen(true)}
        favoritesCount={favoritesCount}
      />

      <div className="flex-1 relative">
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

        <MapMarker map={mapRef.current} markers={markers} />

        {selectedPlace && (
          <div className="absolute bottom-[80px] md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm bg-white rounded-2xl shadow-xl p-3 z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-gray-800 truncate">
                  {selectedPlace.name}
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {selectedPlace.displayName}
                </div>
              </div>
              <FavoriteButton
                name={selectedPlace.name}
                lat={selectedPlace.lat}
                lng={selectedPlace.lng}
                address={selectedPlace.displayName}
                onToggle={(saved) => setFavoritesCount((c) => c + (saved ? 1 : -1))}
              />
            </div>
          </div>
        )}
      </div>

      <BottomNav
        onSearchFocus={() => {
          const input = document.querySelector<HTMLInputElement>(
            '[placeholder*="Rechercher"]'
          );
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
