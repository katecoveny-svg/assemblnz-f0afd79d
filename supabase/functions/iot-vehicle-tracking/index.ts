import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAMOOV_KEY = Deno.env.get("DAMOOV_API_KEY");
const BASE_URL = "https://api.telematicssdk.com/api";

interface VehicleRequest {
  action: "fleet_status" | "driver_scores" | "vehicle_diagnostics" | "trip_history" | "alerts";
  device_token?: string;
  start_date?: string;
  end_date?: string;
}

async function damoovFetch(path: string): Promise<any> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Authorization": `Bearer ${DAMOOV_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return resp.ok ? resp.json() : { error: `API returned ${resp.status}` };
}

function generateDemoFleet(): any {
  const vehicles = [
    { id: "V001", plate: "ABC123", make: "Toyota", model: "Hilux", status: "moving", speed: 67, lat: -36.85, lon: 174.76, driver: "J. Smith", fuel: 72 },
    { id: "V002", plate: "DEF456", make: "Ford", model: "Ranger", status: "idle", speed: 0, lat: -36.88, lon: 174.74, driver: "M. Brown", fuel: 45 },
    { id: "V003", plate: "GHI789", make: "Mazda", model: "BT-50", status: "moving", speed: 52, lat: -37.79, lon: 175.28, driver: "S. Wilson", fuel: 88 },
    { id: "V004", plate: "JKL012", make: "Nissan", model: "Navara", status: "parked", speed: 0, lat: -41.29, lon: 174.78, driver: "A. Taylor", fuel: 31 },
    { id: "V005", plate: "MNO345", make: "Isuzu", model: "D-Max", status: "moving", speed: 89, lat: -43.53, lon: 172.64, driver: "K. Anderson", fuel: 56 },
  ];
  return { fleet: vehicles, total: vehicles.length, moving: 3, idle: 1, parked: 1, timestamp: new Date().toISOString() };
}

function generateDemoScores(): any {
  return {
    drivers: [
      { name: "J. Smith", overall: 87, acceleration: 82, braking: 91, cornering: 85, speeding: 90, distraction: 88, trips: 34 },
      { name: "M. Brown", overall: 72, acceleration: 68, braking: 75, cornering: 70, speeding: 74, distraction: 73, trips: 28 },
      { name: "S. Wilson", overall: 94, acceleration: 92, braking: 96, cornering: 93, speeding: 95, distraction: 94, trips: 41 },
      { name: "A. Taylor", overall: 65, acceleration: 60, braking: 70, cornering: 62, speeding: 68, distraction: 60, trips: 22 },
      { name: "K. Anderson", overall: 81, acceleration: 78, braking: 84, cornering: 80, speeding: 82, distraction: 79, trips: 37 },
    ],
    period: "Last 30 days",
    fleet_average: 79.8,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, device_token, start_date, end_date }: VehicleRequest = await req.json();

    if (!DAMOOV_KEY) {
      // Return demo data when no key
      let result: any;
      switch (action) {
        case "fleet_status": result = { ...generateDemoFleet(), demo: true, setup: "Add DAMOOV_API_KEY to enable live fleet tracking" }; break;
        case "driver_scores": result = { ...generateDemoScores(), demo: true, setup: "Add DAMOOV_API_KEY for real driver scores" }; break;
        case "vehicle_diagnostics": result = { demo: true, diagnostics: { dtc_codes: [], battery: "12.4V", oil_life: "68%", tire_pressure: { fl: 34, fr: 33, rl: 35, rr: 34 } } }; break;
        case "trip_history": result = { demo: true, trips: [{ date: new Date().toISOString().split("T")[0], distance_km: 47.2, duration_min: 62, score: 85 }] }; break;
        case "alerts": result = { demo: true, alerts: [{ type: "harsh_braking", vehicle: "V002", time: new Date().toISOString(), severity: "medium" }] }; break;
        default: result = { error: `Unknown action: ${action}` };
      }
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any;
    switch (action) {
      case "fleet_status":
        result = await damoovFetch("/v1/vehicles/status");
        break;
      case "driver_scores":
        result = await damoovFetch(`/v1/scoring/drivers?start=${start_date || ""}&end=${end_date || ""}`);
        break;
      case "vehicle_diagnostics":
        result = await damoovFetch(`/v1/vehicles/${device_token || "all"}/diagnostics`);
        break;
      case "trip_history":
        result = await damoovFetch(`/v1/trips?device=${device_token || ""}&start=${start_date || ""}&end=${end_date || ""}`);
        break;
      case "alerts":
        result = await damoovFetch("/v1/alerts/recent");
        break;
      default:
        result = { error: `Unknown action: ${action}` };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iot-vehicle-tracking error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
