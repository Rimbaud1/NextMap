export interface POIResult {
  id: number;
  lat: number;
  lng: number;
  name: string;
  category: string;
  color: string;
}

export const fetchPOIs = async (
  lat: number,
  lng: number,
  radiusM: number = 3000
): Promise<POIResult[]> => {
  const tags = [
    '["amenity"="restaurant"]',
    '["tourism"="museum"]',
    '["tourism"="hotel"]',
    '["amenity"="fuel"]',
    '["amenity"="parking"]',
    '["amenity"="hospital"]',
  ].join("");

  const query = `[out:json];(${tags});out body ${Math.min(radiusM, 5000)};`;

  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  if (!resp.ok) return [];

  const data = await resp.json();
  return (data.elements || []).map((el: any) => ({
    id: el.id,
    lat: el.lat,
    lng: el.lon,
    name: el.tags?.name || categoryToName(el.tags),
    category: elementToCategory(el.tags),
    color: elementToColor(el.tags),
  }));
};

const elementToCategory = (tags: Record<string, string>): string => {
  if (tags?.amenity === "restaurant") return "restaurant";
  if (tags?.amenity === "fuel") return "fuel";
  if (tags?.amenity === "parking") return "parking";
  if (tags?.amenity === "hospital") return "hospital";
  if (tags?.tourism === "museum") return "museum";
  if (tags?.tourism === "hotel") return "hotel";
  return "other";
};

const categoryToName = (tags: Record<string, string>): string => {
  const map: Record<string, string> = {
    restaurant: "Restaurant",
    museum: "Musée",
    hotel: "Hôtel",
    fuel: "Station-service",
    parking: "Parking",
    hospital: "Hôpital",
  };
  return map[elementToCategory(tags)] || "Lieu";
};

const elementToColor = (tags: Record<string, string>): string => {
  const colors: Record<string, string> = {
    restaurant: "#ef4444",
    museum: "#8b5cf6",
    hotel: "#f59e0b",
    fuel: "#10b981",
    parking: "#3b82f6",
    hospital: "#ec4899",
  };
  return colors[elementToCategory(tags)] || "#999999";
};
