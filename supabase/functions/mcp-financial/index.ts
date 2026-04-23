// MCP Financial edge function — stock quotes, forex, market news, economic indicators.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-financial";

type Action = "stock_quote" | "forex_rate" | "market_news" | "economic_indicator";

interface RequestBody {
  action: Action;
  symbol?: string;
  indicator?: string;
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
  const valid: Action[] = ["stock_quote", "forex_rate", "market_news", "economic_indicator"];
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

async function handleStockQuote(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  return await fetchJson(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0)" },
  });
}

async function handleForexRate(symbol: string) {
  const base = symbol?.startsWith("NZD") ? "NZD" : (symbol?.slice(0, 3) || "NZD");
  const url = `https://open.er-api.com/v6/latest/${base}`;
  return await fetchJson(url);
}

async function handleMarketNews(symbol: string | undefined, limit: number) {
  const apiKey = Deno.env.get("FINNHUB_API_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "FINNHUB_API_KEY not configured",
        setup: "Free key at finnhub.io/register",
      },
    };
  }
  let url: string;
  if (symbol) {
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${today}&token=${apiKey}`;
  } else {
    url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
  }
  const result = await fetchJson(url);
  if (Array.isArray(result.body)) {
    result.body = (result.body as unknown[]).slice(0, limit);
  }
  return result;
}

async function handleEconomicIndicator(indicator: string) {
  const apiKey = Deno.env.get("ALPHA_VANTAGE_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "ALPHA_VANTAGE_KEY not configured",
        setup: "Free key at alphavantage.co",
      },
    };
  }
  const map: Record<string, string> = {
    GDP: "REAL_GDP",
    CPI: "CPI",
    UNEMPLOYMENT: "UNEMPLOYMENT",
  };
  const fn = map[indicator?.toUpperCase()] ?? indicator;
  const url = `https://www.alphavantage.co/query?function=${encodeURIComponent(fn)}&apikey=${apiKey}`;
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

  const { action, symbol = "", indicator = "" } = body as RequestBody;
  const limit = Math.max(1, Math.min(50, body.limit ?? 5));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { symbol, indicator, limit },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "stock_quote":
        result = await handleStockQuote(symbol);
        break;
      case "forex_rate":
        result = await handleForexRate(symbol);
        break;
      case "market_news":
        result = await handleMarketNews(symbol || undefined, limit);
        break;
      case "economic_indicator":
        result = await handleEconomicIndicator(indicator);
        break;
    }
    return json(envelope(action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
