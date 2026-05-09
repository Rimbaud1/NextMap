"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isFavorite,
  addFavorite,
  removeFavorite,
  getFavoriteByCoords,
} from "@/lib/storage/favorites";

interface FavoriteButtonProps {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  onToggle?: (saved: boolean) => void;
}

export default function FavoriteButton({
  name,
  lat,
  lng,
  address,
  onToggle,
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    isFavorite(lat, lng).then(setSaved);
  }, [lat, lng]);

  const handleToggle = useCallback(async () => {
    if (saved) {
      const fav = await getFavoriteByCoords(lat, lng);
      if (fav?.id) {
        await removeFavorite(fav.id);
        setSaved(false);
        onToggle?.(false);
      }
    } else {
      await addFavorite({ name, lat, lng, address });
      setSaved(true);
      onToggle?.(true);
    }
  }, [saved, lat, lng, name, address, onToggle]);

  return (
    <button
      onClick={handleToggle}
      className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors ${
        saved
          ? "bg-yellow-400 text-white"
          : "bg-white text-gray-400 hover:text-yellow-500"
      }`}
      aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}
