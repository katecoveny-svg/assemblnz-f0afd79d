// MCP IoT edge function — air quality, community sensor data, combined environmental snapshot.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-iot";

type Action = "air_quality" | "sensor_data" | "environmental";

interface RequestBody {
  action: Action;
  latitude: number;
  longitude: number;
  device_id?: string;
  radius?: number;
  limit?: number;
}

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function envelope(action: Action, data: unknown) {
  return { source: FUNCTION_NAME, action, data, timestamp: new Date().toISOString() };
}

function validate(body: Partial<RequestBody>): string | null {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  const valid: Action[] = ["air_quality", "sensor_data", "environmental"];
  if (!valid.includes(body.action as Action)) {
    return `action must be one of: ${valid.join(", ")}`;
  }
  if (typeof body.latitude !== "number" || body.latitude < -90 || body.latitude > 90) {
    return "latitude must be a number between -90 and 90";
  }
  if (typeof body.longitude !== "number" || body.longitude < -180 || body.longitude > 180) {
    return "longitude must be a number between -180 and 180";
  }
  return null;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = { error: "upstream returned non-JSON response" };
  }
  return { status: res.status, body: parsed };
}

function classifyPm25(v: number | null | undefined) {
  if (v == null) return "unknown";
  if (v < 15) return "good";
  if (v <= 30) return "moderate";
  return "poor";
}

function classifyPm10(v: number | null | undefined) {
  if (v == null) return "unknown";
  if (v < 45) return "good";
  if (v <= 100) return "moderate";
  return "poor";
}

async function handleAirQuality(lat: number, lon: number) {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,uv_index` +
    `&timezone=Pacific/Auckland`;
  const { status, body } = await fetchJson(url);
  if (status >= 400 || !body || typeof body !== "object") {
    return { status, body };
  }
  const current = (body as { current?: { pm2_5?: number; pm10?: number } }).current ?? {};
  const enriched = {
    ...body as Record<string, unknown>,
    who_classification: {
      pm2_5: classifyPm25(current.pm2_5),
      pm10: classifyPm10(current.pm10),
    },
  };
  return { status, body: enriched };
}

async function handleSensorData(lat: number, lon: number, radiusKm: number) {
  const url = `https://data.sensor.community/airrohr/v1/filter/area=${lat},${lon},${radiusKm}`;
  return await fetchJson(url);
}

async function handleEnvironmental(lat: number, lon: number) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
    `&timezone=Pacific/Auckland`;
  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=pm10,pm2_5,uv_index&timezone=Pacific/Auckland`;
  const [weather, air] = await Promise.all([fetchJson(weatherUrl), fetchJson(airUrl)]);
  return {
    status: 200,
    body: {
      weather: weather.body,
      air_quality: air.body,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Partial<RequestBody>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const validationError = validate(body);
  if (validationError) return json({ error: "validation_error", detail: validationError }, 400);

  const { action, latitude, longitude, device_id } = body as RequestBody;
  const radius = Math.max(1, Math.min(100, body.radius ?? 10));
  const limit = Math.max(1, Math.min(50, body.limit ?? 10));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { latitude, longitude, device_id: device_id ?? null, radius, limit },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "air_quality":
        result = await handleAirQuality(latitude, longitude);
        break;
      case "sensor_data":
        result = await handleSensorData(latitude, longitude, radius);
        break;
      case "environmental":
        result = await handleEnvironmental(latitude, longitude);
        break;
    }
    return json(envelope(action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
