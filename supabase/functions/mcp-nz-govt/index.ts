// MCP NZ Government edge function — legislation, companies, NZBN, employment rates, WorkSafe.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-nz-govt";

type Action =
  | "legislation_search"
  | "company_lookup"
  | "nzbn_search"
  | "employment_rates"
  | "worksafe_alerts";

interface RequestBody {
  action: Action;
  query?: string;
  type?: "act" | "regulation" | "bill";
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
    "legislation_search",
    "company_lookup",
    "nzbn_search",
    "employment_rates",
    "worksafe_alerts",
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

async function fetchText(url: string) {
  const res = await fetch(url);
  return { status: res.status, text: await res.text() };
}

function parseRss(xml: string, limit: number) {
  const items: Array<Record<string, string>> = [];
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of matches.slice(0, limit)) {
    const get = (tag: string) => {
      const m = block.match(
        new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"),
      );
      return (m?.[1] ?? "").trim();
    };
    items.push({
      title: get("title"),
      link: get("link"),
      pubDate: get("pubDate"),
      description: get("description"),
    });
  }
  return items;
}

async function handleLegislationSearch(query: string, type: string | undefined) {
  // Try the API; fall back to lookup URL if it doesn't return JSON.
  const apiUrl = `https://legislation.govt.nz/api/search?search=${encodeURIComponent(query)}${type ? `&type=${type}` : ""}`;
  try {
    const result = await fetchJson(apiUrl);
    if (result.status < 400 && result.body && typeof result.body === "object") {
      return result;
    }
  } catch {
    // fall through to fallback
  }
  return {
    status: 200,
    body: {
      query,
      search_url: `https://www.legislation.govt.nz/search?search=${encodeURIComponent(query)}`,
      note: "Direct legislation API being configured. Use search URL for now.",
    },
  };
}

async function handleCompanyLookup(query: string) {
  const url = `https://api.companiesoffice.govt.nz/companies/v2/companies?searchTerm=${encodeURIComponent(query)}`;
  const result = await fetchJson(url);
  if (result.status >= 400) {
    return {
      status: 200,
      body: {
        query,
        lookup_url: "https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search",
        note: "Companies Register API requires authentication. Use lookup URL for manual search.",
      },
    };
  }
  return result;
}

async function handleNzbnSearch(query: string) {
  const apiKey = Deno.env.get("NZBN_API_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "NZBN_API_KEY not configured",
        setup: "Register at api.business.govt.nz",
      },
    };
  }
  const url = `https://api.business.govt.nz/gateway/nzbn/v5/entities?search-term=${encodeURIComponent(query)}`;
  return await fetchJson(url, { headers: { Authorization: apiKey } });
}

function handleEmploymentRates() {
  return {
    status: 200,
    body: {
      minimum_wage: {
        adult: 23.65,
        starting_out: 18.92,
        training: 18.92,
        effective_from: "2026-04-01",
      },
      kiwisaver: {
        minimum_employee: "3%",
        maximum_employee: "10%",
        employer_contribution: "3%",
        employer_superannuation_contribution_tax_rates: "10.5% to 39%",
      },
      acc_levy: {
        earner_levy: 1.6,
        per: "$100 liable earnings",
        year: "2025-26",
      },
      sick_leave: { minimum_days: 10, per: "12 month period" },
      public_holidays: 11,
      source: "employment.govt.nz",
      last_updated: "2026-04-01",
    },
  };
}

async function handleWorksafeAlerts(limit: number) {
  // WorkSafe NZ doesn't expose a stable RSS, so attempt and fall back.
  try {
    const { status, text } = await fetchText("https://www.worksafe.govt.nz/rss/news/");
    if (status < 400 && text.includes("<item")) {
      return { status: 200, body: { alerts: parseRss(text, limit), source: "worksafe.govt.nz" } };
    }
  } catch {
    // ignore — fall through
  }
  return {
    status: 200,
    body: {
      alerts_url: "https://www.worksafe.govt.nz/about-us/news-and-media/",
      note: "WorkSafe feed being configured",
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

  const { action, query = "", type } = body as RequestBody;
  const limit = Math.max(1, Math.min(50, body.limit ?? 10));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { query, type: type ?? null, limit },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "legislation_search":
        result = await handleLegislationSearch(query, type);
        break;
      case "company_lookup":
        result = await handleCompanyLookup(query);
        break;
      case "nzbn_search":
        result = await handleNzbnSearch(query);
        break;
      case "employment_rates":
        result = handleEmploymentRates();
        break;
      case "worksafe_alerts":
        result = await handleWorksafeAlerts(limit);
        break;
    }
    return json(envelope(action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
