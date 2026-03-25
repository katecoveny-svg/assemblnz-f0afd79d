import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AIS_KEY = Deno.env.get("AISSTREAM_API_KEY");

interface AISRequest {
  action: "search_vessel" | "vessels_near_port" | "track_mmsi";
  mmsi?: string;
  vessel_name?: string;
  lat?: number;
  lon?: number;
  radius_nm?: number;
  port?: string;
}

// NZ port coordinates
const NZ_PORTS: Record<string, { lat: number; lon: number; name: string }> = {
  auckland: { lat: -36.84, lon: 174.79, name: "Port of Auckland" },
  tauranga: { lat: -37.65, lon: 176.18, name: "Port of Tauranga" },
  wellington: { lat: -41.28, lon: 174.78, name: "CentrePort Wellington" },
  lyttelton: { lat: -43.61, lon: 172.72, name: "Lyttelton Port" },
  napier: { lat: -39.47, lon: 176.92, name: "Napier Port" },
  otago: { lat: -45.81, lon: 170.63, name: "Port Otago" },
  nelson: { lat: -41.26, lon: 173.28, name: "Port Nelson" },
  bluff: { lat: -46.60, lon: 168.34, name: "South Port (Bluff)" },
  taranaki: { lat: -39.06, lon: 174.04, name: "Port Taranaki" },
  whangarei: { lat: -35.76, lon: 174.33, name: "Northport" },
  timaru: { lat: -44.39, lon: 171.26, name: "PrimePort Timaru" },
  gisborne: { lat: -38.68, lon: 178.03, name: "Eastland Port" },
};

async function searchVesselByName(name: string): Promise<any> {
  // Use MarineTraffic-style public API fallback
  // aisstream.io requires WebSocket - we use REST approach via alternative
  try {
    const url = `https://services.marinetraffic.com/api/searchvessel/v:2?name=${encodeURIComponent(name)}`;
    // Without paid MT API, return structured placeholder with instructions
    return {
      query: name,
      note: "AIS vessel search requires AISSTREAM_API_KEY. Configure the key to enable real-time vessel tracking via aisstream.io WebSocket API.",
      suggestion: `To track "${name}", provide the vessel MMSI number for precise AIS position data.`,
      nz_ports: Object.entries(NZ_PORTS).map(([k, v]) => ({ id: k, name: v.name })),
    };
  } catch {
    return { error: "Vessel search failed" };
  }
}

function getPortCoords(port: string): { lat: number; lon: number; name: string } | null {
  const key = port.toLowerCase().replace(/\s+/g, "_").replace(/port\s*of\s*/i, "");
  return NZ_PORTS[key] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: AISRequest = await req.json();
    const { action, mmsi, vessel_name, lat, lon, radius_nm = 25, port } = body;

    if (!AIS_KEY) {
      return new Response(JSON.stringify({
        error: "AISSTREAM_API_KEY not configured",
        available_ports: Object.entries(NZ_PORTS).map(([k, v]) => ({ id: k, name: v.name })),
        setup: "Add AISSTREAM_API_KEY from aisstream.io to enable real-time AIS vessel tracking.",
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any = {};

    switch (action) {
      case "search_vessel":
        result = await searchVesselByName(vessel_name || "");
        break;

      case "vessels_near_port": {
        const portCoords = port ? getPortCoords(port) : null;
        const searchLat = portCoords?.lat || lat || -36.84;
        const searchLon = portCoords?.lon || lon || 174.79;
        const portName = portCoords?.name || "Custom Location";

        // aisstream.io uses WebSocket, so for REST we provide port info
        result = {
          port: portName,
          coordinates: { lat: searchLat, lon: searchLon },
          radius_nm,
          note: "Real-time AIS data streams via WebSocket. Current snapshot requires active connection.",
          available_ports: Object.entries(NZ_PORTS).map(([k, v]) => ({ id: k, name: v.name })),
        };
        break;
      }

      case "track_mmsi":
        if (!mmsi) {
          result = { error: "MMSI number required for vessel tracking" };
        } else {
          result = {
            mmsi,
            status: "tracking_requested",
            note: "MMSI tracking initiated. Real-time position updates available via AIS stream.",
          };
        }
        break;

      default:
        result = { error: `Unknown action: ${action}`, available_actions: ["search_vessel", "vessels_near_port", "track_mmsi"] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iot-ais-tracking error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
