import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("format", "json");
  url.searchParams.set("accept-language", "fr");

  const resp = await fetch(url, {
    headers: { "User-Agent": "NextMap/1.0 (demo app)" },
  });

  if (!resp.ok) {
    return NextResponse.json(
      { error: "Nominatim unavailable" },
      { status: 502 }
    );
  }

  const data = await resp.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
