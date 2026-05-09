import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "8");
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
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
