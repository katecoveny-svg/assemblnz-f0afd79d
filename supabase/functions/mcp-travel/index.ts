// MCP Travel edge function — flights, events, places, accommodation.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-travel";

type Action = "flight_search" | "events_search" | "places_nearby" | "accommodation";

interface RequestBody {
  action: Action;
  origin?: string;
  destination?: string;
  date_from?: string;
  date_to?: string;
  query?: string;
  latitude?: number;
  longitude?: number;
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
  const valid: Action[] = ["flight_search", "events_search", "places_nearby", "accommodation"];
  if (!valid.includes(body.action as Action)) {
    return `action must be one of: ${valid.join(", ")}`;
  }
  return null;
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = { error: "upstream returned non-JSON response" };
  }
  return { status: res.status, body: parsed };
}

async function handleFlightSearch(b: RequestBody, limit: number) {
  const apiKey = Deno.env.get("KIWI_API_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "KIWI_API_KEY not configured",
        setup: "Register at tequila.kiwi.com (free affiliate)",
      },
    };
  }
  const params = new URLSearchParams({
    fly_from: b.origin ?? "",
    fly_to: b.destination ?? "",
    date_from: b.date_from ?? "",
    date_to: b.date_to ?? "",
    curr: "NZD",
    limit: String(limit),
  });
  const url = `https://api.tequila.kiwi.com/v2/search?${params.toString()}`;
  return await fetchJson(url, { headers: { apikey: apiKey } });
}

async function handleEventsSearch(query: string, limit: number) {
  const user = Deno.env.get("EVENTFINDA_USER");
  const pass = Deno.env.get("EVENTFINDA_PASS");
  if (!user || !pass) {
    return {
      status: 200,
      body: {
        error: "EVENTFINDA credentials not configured",
        setup: "Register at eventfinda.co.nz/api",
      },
    };
  }
  const auth = btoa(`${user}:${pass}`);
  const url = `https://api.eventfinda.co.nz/v2/events.json?q=${encodeURIComponent(query)}&rows=${limit}`;
  return await fetchJson(url, { headers: { Authorization: `Basic ${auth}` } });
}

async function handlePlacesNearby(b: RequestBody) {
  const apiKey = Deno.env.get("GOOGLE_PLACES_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "GOOGLE_PLACES_KEY not configured",
        setup: "Google Cloud Console — $200/mo free credit",
      },
    };
  }
  if (typeof b.latitude !== "number" || typeof b.longitude !== "number") {
    return {
      status: 400,
      body: { error: "latitude and longitude required for places_nearby" },
    };
  }
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${b.latitude},${b.longitude}` +
    `&radius=5000&keyword=${encodeURIComponent(b.query ?? "")}&key=${apiKey}`;
  return await fetchJson(url);
}

function handleAccommodation(b: RequestBody) {
  const q = encodeURIComponent(b.query ?? "");
  return {
    status: 200,
    body: {
      query: b.query,
      search_urls: {
        booking: `https://www.booking.com/searchresults.html?ss=${q}&checkin=${b.date_from ?? ""}&checkout=${b.date_to ?? ""}`,
        airbnb: `https://www.airbnb.co.nz/s/${q}/homes`,
        bach: `https://www.bachcare.co.nz/search?location=${q}`,
      },
      note: "Booking.com affiliate API pending approval. Direct search links provided.",
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

  const b = body as RequestBody;
  const limit = Math.max(1, Math.min(50, b.limit ?? 10));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action: b.action,
    request_params: {
      origin: b.origin ?? null,
      destination: b.destination ?? null,
      date_from: b.date_from ?? null,
      date_to: b.date_to ?? null,
      query: b.query ?? null,
      latitude: b.latitude ?? null,
      longitude: b.longitude ?? null,
      limit,
    },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (b.action) {
      case "flight_search":
        result = await handleFlightSearch(b, limit);
        break;
      case "events_search":
        result = await handleEventsSearch(b.query ?? "", limit);
        break;
      case "places_nearby":
        result = await handlePlacesNearby(b);
        break;
      case "accommodation":
        result = handleAccommodation(b);
        break;
    }
    return json(envelope(b.action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
