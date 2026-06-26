import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * NZ Routes edge function
 *
 * Wraps MapBox Directions API for NZ road routing.
 * Secret: MAPBOX_ACCESS_TOKEN (same token used by Helm bus tracker via VITE_MAPBOX_TOKEN)
 * Returns: distanceKm, durationMins, geometry (GeoJSON coords)
 *
 * Fallback: haversine straight-line × 1.35 NZ road factor when MapBox unavailable.
 *
 * Env secrets needed:
 *   MAPBOX_ACCESS_TOKEN — MapBox public token (free tier: 100k requests/month)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LatLon { lat: number; lon: number }

function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c = 2 * Math.asin(
    Math.sqrt(
      sinDLat * sinDLat +
        Math.cos((a.lat * Math.PI) / 180) *
          Math.cos((b.lat * Math.PI) / 180) *
          sinDLon * sinDLon,
    ),
  );
  return R * c;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination } = await req.json() as { origin: LatLon; destination: LatLon };

    if (!origin?.lat || !destination?.lat) {
      return new Response(
        JSON.stringify({ error: "origin and destination (lat/lon) required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN") || Deno.env.get("VITE_MAPBOX_TOKEN");

    if (MAPBOX_TOKEN) {
      try {
        // MapBox Directions API — driving profile
        const coords = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(coords)}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = await res.json();
          const route = data.routes?.[0];
          if (route) {
            return new Response(
              JSON.stringify({
                distanceKm: Math.round((route.distance / 1000) * 10) / 10,
                durationMins: Math.round(route.duration / 60),
                geometry: route.geometry?.coordinates ?? [],
                source: "mapbox",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } catch (mapboxErr) {
        console.error("[nz-routes] MapBox error:", mapboxErr);
      }
    }

    // Fallback: haversine × 1.35 road factor, ~80 km/h average NZ speed
    const straight = haversineKm(origin, destination);
    const distanceKm = Math.round(straight * 1.35 * 10) / 10;
    const durationMins = Math.round((distanceKm / 80) * 60);

    return new Response(
      JSON.stringify({
        distanceKm,
        durationMins,
        geometry: [],
        source: MAPBOX_TOKEN ? "fallback_after_error" : "fallback_no_key",
        note: MAPBOX_TOKEN
          ? "MapBox call failed — using straight-line estimate"
          : "Add MAPBOX_ACCESS_TOKEN secret for live routing",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[nz-routes] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Route fetch failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
