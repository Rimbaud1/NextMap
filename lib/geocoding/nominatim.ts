export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  importance: number;
}

export const searchPlaces = async (
  query: string,
  signal?: AbortSignal
): Promise<NominatimResult[]> => {
  const url = new URL("/api/search", window.location.origin);
  url.searchParams.set("q", query);
  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error("Search failed");
  return resp.json();
};

export const reverseGeocode = async (
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<NominatimResult | null> => {
  const url = new URL("/api/reverse", window.location.origin);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  const resp = await fetch(url, { signal });
  if (!resp.ok) return null;
  return resp.json();
};
