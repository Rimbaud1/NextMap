"use client";

import SearchBar from "@/components/search/SearchBar";
import type { NominatimResult } from "@/lib/geocoding/nominatim";

interface TopBarProps {
  onSearchSelect: (result: NominatimResult) => void;
  onFavoritesClick: () => void;
  favoritesCount: number;
}

export default function TopBar({
  onSearchSelect,
  onFavoritesClick,
  favoritesCount,
}: TopBarProps) {
  return (
    <header className="hidden md:flex items-center gap-4 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm z-30">
      <h1 className="text-lg font-bold text-gray-900 tracking-tight shrink-0">
        NextMap
      </h1>
      <div className="flex-1 max-w-xl">
        <SearchBar onSelect={onSearchSelect} />
      </div>
      <button
        onClick={onFavoritesClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Favoris
        {favoritesCount > 0 && (
          <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {favoritesCount}
          </span>
        )}
      </button>
    </header>
  );
}
