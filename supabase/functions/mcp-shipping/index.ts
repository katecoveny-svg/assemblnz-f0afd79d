// MCP Shipping edge function — vessel search, port arrivals, tariff, trade stats, freight index.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-shipping";

type Action =
  | "vessel_search"
  | "port_arrivals"
  | "tariff_lookup"
  | "trade_stats"
  | "freight_index";

interface RequestBody {
  action: Action;
  query?: string;
  port?: string;
  country?: string;
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
  const valid: Action[] = [
    "vessel_search",
    "port_arrivals",
    "tariff_lookup",
    "trade_stats",
    "freight_index",
  ];
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

async function handleVesselSearch(query: string) {
  const apiKey = Deno.env.get("VESSEL_API_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "VESSEL_API_KEY not configured",
        setup: "Register at vesselfinder.com for API access",
        query,
      },
    };
  }
  const url = `https://api.vesselfinder.com/vessels?userkey=${apiKey}&name=${encodeURIComponent(query)}`;
  return await fetchJson(url);
}

function handlePortArrivals(port: string) {
  return {
    status: 200,
    body: {
      port,
      arrivals: [],
      expected_schema: ["vessel_name", "imo", "eta", "origin", "cargo_type"],
      note: "Live AIS integration pending. Connect AISstream.io WebSocket for real-time data.",
    },
  };
}

function handleTariffLookup(query: string) {
  return {
    status: 200,
    body: {
      hs_code: query,
      lookup_url: `https://www.customs.govt.nz/business/tariff/tariff-search/?search=${encodeURIComponent(query)}`,
      note: "Direct tariff API not available. Use the lookup URL or contact NZ Customs for electronic access via TSW.",
    },
  };
}

async function handleTradeStats(query: string) {
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?cmdCode=${encodeURIComponent(query)}&reporterCode=554&period=2024&flowCode=M,X`;
  return await fetchJson(url);
}

function handleFreightIndex() {
  return {
    status: 200,
    body: {
      index: "FBX",
      note: "Freightos API requires commercial agreement. Current FBX rates available at https://fbx.freightos.com/",
      lanes: ["China-NZ", "SE Asia-NZ", "NZ-Australia", "Europe-NZ"],
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

  const { action, query = "", port = "auckland", country = "NZ" } = body as RequestBody;
  const limit = Math.max(1, Math.min(50, body.limit ?? 10));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { query, port, country, limit },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "vessel_search":
        result = await handleVesselSearch(query);
        break;
      case "port_arrivals":
        result = handlePortArrivals(port);
        break;
      case "tariff_lookup":
        result = handleTariffLookup(query);
        break;
      case "trade_stats":
        result = await handleTradeStats(query);
        break;
      case "freight_index":
        result = handleFreightIndex();
        break;
    }
    return json(envelope(action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
