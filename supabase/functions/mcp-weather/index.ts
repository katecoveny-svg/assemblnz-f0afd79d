// MCP Weather edge function — wraps Open-Meteo (forecast/current/marine)
// and exposes a placeholder for NZ MetService alerts. Public (verify_jwt=false).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "forecast" | "current" | "marine" | "alerts";

interface RequestBody {
  action: Action;
  latitude: number;
  longitude: number;
  location_name?: string;
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

function validate(body: Partial<RequestBody>): string | null {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  if (!["forecast", "current", "marine", "alerts"].includes(body.action ?? "")) {
    return "action must be one of: forecast, current, marine, alerts";
  }
  if (typeof body.latitude !== "number" || body.latitude < -90 || body.latitude > 90) {
    return "latitude must be a number between -90 and 90";
  }
  if (typeof body.longitude !== "number" || body.longitude < -180 || body.longitude > 180) {
    return "longitude must be a number between -180 and 180";
  }
  return null;
}

async function fetchJson(url: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url);
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = { error: "upstream returned non-JSON response" };
  }
  return { status: res.status, body: parsed };
}

async function handleForecast(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,wind_speed_10m,precipitation,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
    `&timezone=Pacific/Auckland`;
  return await fetchJson(url);
}

async function handleCurrent(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,wind_speed_10m,precipitation,weather_code`;
  return await fetchJson(url);
}

async function handleMarine(lat: number, lon: number) {
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&current=wave_height,wave_direction,wave_period`;
  return await fetchJson(url);
}

function handleAlerts() {
  return {
    status: 200,
    body: {
      alerts: [],
      source: "metservice_nz",
      note: "MetService integration pending API key",
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let body: Partial<RequestBody>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const validationError = validate(body);
  if (validationError) {
    return json({ error: "validation_error", detail: validationError }, 400);
  }

  const { action, latitude, longitude, location_name } = body as RequestBody;

  // Fire-and-forget log insert
  sb.from("mcp_data_log").insert({
    function_name: "mcp-weather",
    action,
    request_params: { latitude, longitude, location_name: location_name ?? null },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "forecast":
        result = await handleForecast(latitude, longitude);
        break;
      case "current":
        result = await handleCurrent(latitude, longitude);
        break;
      case "marine":
        result = await handleMarine(latitude, longitude);
        break;
      case "alerts":
        result = handleAlerts();
        break;
    }
    return json(result.body, result.status);
  } catch (err) {
    console.error("mcp-weather error:", err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
