import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGRO_KEY = Deno.env.get("AGROMONITORING_API_KEY");
const BASE = "https://api.agromonitoring.com/agro/1.0";

interface AgriRequest {
  action: "ndvi" | "soil" | "weather" | "satellite_images" | "create_polygon";
  polygon_id?: string;
  coordinates?: number[][];  // [[lon, lat], ...]
  name?: string;
  start?: number; // unix timestamp
  end?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: AgriRequest = await req.json();
    const { action, polygon_id, coordinates, name, start, end } = body;

    if (!AGRO_KEY) {
      // Demo data for NZ farming
      const demoNDVI = {
        demo: true,
        setup: "Add AGROMONITORING_API_KEY from agromonitoring.com to enable satellite crop monitoring",
        ndvi_data: [
          { date: "2026-03-20", ndvi: 0.72, description: "Healthy vegetation - good pasture condition" },
          { date: "2026-03-13", ndvi: 0.68, description: "Moderate vegetation health" },
          { date: "2026-03-06", ndvi: 0.75, description: "Strong vegetation - peak growth" },
          { date: "2026-02-27", ndvi: 0.61, description: "Below average - possible stress" },
        ],
        soil: {
          moisture: 42, temp_10cm: 14.2, temp_surface: 16.8,
          description: "Adequate soil moisture for autumn pasture growth",
        },
        nz_context: "Autumn conditions in NZ - expect declining NDVI as growth slows. Monitor for facial eczema risk in warm humid conditions.",
      };
      return new Response(JSON.stringify(demoNDVI), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any;

    switch (action) {
      case "create_polygon":
        if (!coordinates || coordinates.length < 3) {
          result = { error: "At least 3 coordinate pairs required: [[lon, lat], ...]" };
        } else {
          const resp = await fetch(`${BASE}/polygons?appid=${AGRO_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name || "Farm Paddock",
              geo_json: {
                type: "Feature",
                properties: {},
                geometry: { type: "Polygon", coordinates: [coordinates] },
              },
            }),
          });
          result = await resp.json();
        }
        break;

      case "ndvi":
        if (!polygon_id) {
          result = { error: "polygon_id required. Create a polygon first." };
        } else {
          const s = start || Math.floor(Date.now() / 1000) - 30 * 86400;
          const e = end || Math.floor(Date.now() / 1000);
          const resp = await fetch(`${BASE}/ndvi/history?polyid=${polygon_id}&start=${s}&end=${e}&appid=${AGRO_KEY}`);
          result = await resp.json();
        }
        break;

      case "soil":
        if (!polygon_id) {
          result = { error: "polygon_id required" };
        } else {
          const resp = await fetch(`${BASE}/soil?polyid=${polygon_id}&appid=${AGRO_KEY}`);
          result = await resp.json();
        }
        break;

      case "weather":
        if (!polygon_id) {
          result = { error: "polygon_id required" };
        } else {
          const resp = await fetch(`${BASE}/weather?polyid=${polygon_id}&appid=${AGRO_KEY}`);
          result = await resp.json();
        }
        break;

      case "satellite_images":
        if (!polygon_id) {
          result = { error: "polygon_id required" };
        } else {
          const s = start || Math.floor(Date.now() / 1000) - 30 * 86400;
          const e = end || Math.floor(Date.now() / 1000);
          const resp = await fetch(`${BASE}/image/search?polyid=${polygon_id}&start=${s}&end=${e}&appid=${AGRO_KEY}`);
          result = await resp.json();
        }
        break;

      default:
        result = { error: `Unknown action: ${action}`, available: ["ndvi", "soil", "weather", "satellite_images", "create_polygon"] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iot-agri-satellite error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
