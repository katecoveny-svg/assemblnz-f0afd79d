// MCP Construction edge function — building code, consent stats, WorkSafe guidance, property lookup.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-construction";

type Action = "building_code" | "consent_stats" | "worksafe_guidance" | "property_lookup";

interface RequestBody {
  action: Action;
  query?: string;
  region?: "auckland" | "wellington" | "christchurch" | "national";
  period?: "latest" | "2025" | "2024";
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
  const valid: Action[] = ["building_code", "consent_stats", "worksafe_guidance", "property_lookup"];
  if (!valid.includes(body.action as Action)) {
    return `action must be one of: ${valid.join(", ")}`;
  }
  return null;
}

function handleBuildingCode(query: string) {
  return {
    query,
    lookup_url: "https://www.building.govt.nz/building-code-compliance/",
    clauses: {
      B1: "Structure",
      B2: "Durability",
      "C1-C6": "Protection from Fire",
      E1: "Surface Water",
      E2: "External Moisture",
      E3: "Internal Moisture",
      F1: "Hazardous Substances",
      F2: "Hazardous Building Materials",
      G1: "Personal Hygiene",
      G4: "Ventilation",
      G5: "Interior Environment",
      G6: "Airborne and Impact Sound",
      G7: "Natural Light",
      G12: "Water Supplies",
      G13: "Foul Water",
      H1: "Energy Efficiency",
    },
    search_url: `https://www.building.govt.nz/search/?keyword=${encodeURIComponent(query)}`,
    note: "Full clause content requires parsing building.govt.nz. Structured data for common queries being built.",
  };
}

function handleConsentStats(region: string, period: string) {
  return {
    source: "Stats NZ - Building Consents Issued",
    region,
    period,
    lookup_url: "https://www.stats.govt.nz/topics/building",
    note: "Automated Stats NZ API integration pending. Latest data available at lookup URL.",
  };
}

function handleWorksafeGuidance(query: string) {
  return {
    query,
    guidance_areas: {
      height_safety: "https://www.worksafe.govt.nz/topic-and-industry/working-at-height/",
      scaffolding: "https://www.worksafe.govt.nz/topic-and-industry/scaffolding/",
      excavation: "https://www.worksafe.govt.nz/topic-and-industry/excavation/",
      asbestos: "https://www.worksafe.govt.nz/topic-and-industry/asbestos/",
      confined_spaces: "https://www.worksafe.govt.nz/topic-and-industry/confined-spaces/",
    },
    search_url: `https://www.worksafe.govt.nz/search/?query=${encodeURIComponent(query)}`,
  };
}

function handlePropertyLookup(query: string) {
  const enc = encodeURIComponent(query);
  return {
    query,
    free_sources: {
      qv: `https://www.qv.co.nz/property/${enc}`,
      homes: `https://homes.co.nz/address/${enc}`,
      realestate: `https://www.realestate.co.nz/search?keyword=${enc}`,
    },
    note: "Property valuation APIs (QV, CoreLogic) require commercial agreements. Free web lookups provided.",
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

  const { action, query = "", region = "national", period = "latest" } = body as RequestBody;

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { query, region, period },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let data: unknown;
    switch (action) {
      case "building_code":
        data = handleBuildingCode(query);
        break;
      case "consent_stats":
        data = handleConsentStats(region, period);
        break;
      case "worksafe_guidance":
        data = handleWorksafeGuidance(query);
        break;
      case "property_lookup":
        data = handlePropertyLookup(query);
        break;
    }
    return json(envelope(action, data));
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
