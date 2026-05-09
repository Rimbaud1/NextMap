import { openDB, type IDBPDatabase } from "idb";

export interface Favorite {
  id?: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB("nextmap", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("favorites")) {
          const store = db.createObjectStore("favorites", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
};

export const getFavorites = async (): Promise<Favorite[]> => {
  const db = await getDb();
  return db.getAllFromIndex("favorites", "createdAt");
};

export const addFavorite = async (
  fav: Omit<Favorite, "id" | "createdAt">
): Promise<number> => {
  const db = await getDb();
  return db.add("favorites", { ...fav, createdAt: Date.now() }) as Promise<number>;
};

export const removeFavorite = async (id: number): Promise<void> => {
  const db = await getDb();
  return db.delete("favorites", id);
};

export const isFavorite = async (lat: number, lng: number): Promise<boolean> => {
  const db = await getDb();
  const all = await db.getAll("favorites");
  return all.some(
    (f) => Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lng - lng) < 0.0001
  );
};

export const getFavoriteByCoords = async (
  lat: number,
  lng: number
): Promise<Favorite | undefined> => {
  const db = await getDb();
  const all = await db.getAll("favorites");
  return all.find(
    (f) => Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lng - lng) < 0.0001
  );
};
