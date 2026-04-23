// MCP Security edge function — CVE search, NZ CERT alerts, IP reputation, Shodan lookups.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-security";

type Action =
  | "cve_search"
  | "cve_detail"
  | "cert_nz_alerts"
  | "ip_reputation"
  | "shodan_lookup";

interface RequestBody {
  action: Action;
  query: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
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
  return {
    source: FUNCTION_NAME,
    action,
    data,
    timestamp: new Date().toISOString(),
  };
}

function validate(body: Partial<RequestBody>): string | null {
  if (!body || typeof body !== "object") return "body must be a JSON object";
  const valid: Action[] = [
    "cve_search",
    "cve_detail",
    "cert_nz_alerts",
    "ip_reputation",
    "shodan_lookup",
  ];
  if (!valid.includes(body.action as Action)) {
    return `action must be one of: ${valid.join(", ")}`;
  }
  if (body.action !== "cert_nz_alerts" && (typeof body.query !== "string" || !body.query.trim())) {
    return "query must be a non-empty string";
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

// Lightweight RSS parser — extracts <item> blocks and pulls common fields.
function parseRss(xml: string, limit: number) {
  const items: Array<Record<string, string>> = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRegex) ?? [];
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

async function handleCveSearch(query: string, severity: string | undefined, limit: number) {
  let url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=${limit}`;
  if (severity) url += `&cvssV3Severity=${severity}`;
  const headers: Record<string, string> = {};
  const apiKey = Deno.env.get("NVD_API_KEY");
  if (apiKey) headers["apiKey"] = apiKey;
  return await fetchJson(url, { headers });
}

async function handleCveDetail(query: string) {
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(query)}`;
  const headers: Record<string, string> = {};
  const apiKey = Deno.env.get("NVD_API_KEY");
  if (apiKey) headers["apiKey"] = apiKey;
  return await fetchJson(url, { headers });
}

async function handleCertNzAlerts(limit: number) {
  const { status, text } = await fetchText("https://www.cert.govt.nz/rss/all/");
  if (status >= 400) {
    return { status, body: { error: "cert_nz_unreachable", status } };
  }
  const items = parseRss(text, limit);
  return { status: 200, body: { alerts: items, source: "cert.govt.nz" } };
}

async function handleIpReputation(query: string) {
  const apiKey = Deno.env.get("ABUSEIPDB_API_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "ABUSEIPDB_API_KEY not configured",
        setup: "Add key in Lovable Supabase settings",
      },
    };
  }
  const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(query)}&maxAgeInDays=90`;
  return await fetchJson(url, {
    headers: { Key: apiKey, Accept: "application/json" },
  });
}

async function handleShodanLookup(query: string) {
  const url = `https://internetdb.shodan.io/${encodeURIComponent(query)}`;
  return await fetchJson(url);
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

  const { action, query, severity } = body as RequestBody;
  const limit = Math.max(1, Math.min(50, body.limit ?? 10));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { query, severity: severity ?? null, limit },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "cve_search":
        result = await handleCveSearch(query, severity, limit);
        break;
      case "cve_detail":
        result = await handleCveDetail(query);
        break;
      case "cert_nz_alerts":
        result = await handleCertNzAlerts(limit);
        break;
      case "ip_reputation":
        result = await handleIpReputation(query);
        break;
      case "shodan_lookup":
        result = await handleShodanLookup(query);
        break;
    }
    return json(envelope(action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
