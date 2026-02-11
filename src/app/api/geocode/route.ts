import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "MCRRCRunFinder/1.0 (community running group finder)";
const MAX_RESULTS = 5;

let lastRequestTime = 0;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestTime = Date.now();

  const params = new URLSearchParams({
    q: q.trim(),
    format: "json",
    limit: MAX_RESULTS.toString(),
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Geocoding service error" },
      { status: 502 }
    );
  }

  const results: Array<{
    display_name: string;
    lat: string;
    lon: string;
  }> = await response.json();

  const data = results.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));

  return NextResponse.json({ data });
}
