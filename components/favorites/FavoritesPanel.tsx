"use client";

import { useState, useEffect, useCallback } from "react";
import { getFavorites, removeFavorite, type Favorite } from "@/lib/storage/favorites";

interface FavoritesPanelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (fav: Favorite) => void;
}

export default function FavoritesPanel({
  open,
  onClose,
  onSelect,
}: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const load = useCallback(async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleDelete = async (id: number) => {
    await removeFavorite(id);
    load();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Favoris</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {favorites.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-12 h-12 mx-auto mb-3"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <p>Aucun favori</p>
              <p className="text-xs mt-1">
                Cherchez un lieu et ajoutez-le aux favoris
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {favorites.map((fav) => (
                <li key={fav.id}>
                  <button
                    onClick={() => {
                      onSelect(fav);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-start justify-between group"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">
                        {fav.name}
                      </div>
                      {fav.address && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {fav.address}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fav.id !== undefined && handleDelete(fav.id);
                      }}
                      className="ml-2 w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-red-400"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
