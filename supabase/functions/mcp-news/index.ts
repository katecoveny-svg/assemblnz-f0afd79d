// MCP News edge function — NewsAPI search, NZ headlines, NZ media RSS feeds.
// Public (verify_jwt=false). Logs every request to mcp_data_log fire-and-forget.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FUNCTION_NAME = "mcp-news";

type Action = "search_news" | "nz_headlines" | "rss_feed";

interface RequestBody {
  action: Action;
  query?: string;
  source?: "rnz" | "stuff" | "nzherald" | "all";
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
  const valid: Action[] = ["search_news", "nz_headlines", "rss_feed"];
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
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0)" },
  });
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

const RSS_FEEDS: Record<string, string> = {
  rnz: "https://www.rnz.co.nz/rss/national.xml",
  stuff: "https://www.stuff.co.nz/rss",
  nzherald:
    "https://www.nzherald.co.nz/arc/outboundfeeds/rss/curate/yJA2VyL1DEaQTc6fJDhHXkMuXYN/?outputType=xml",
};

async function handleSearchNews(query: string, limit: number) {
  const apiKey = Deno.env.get("NEWSAPI_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "NEWSAPI_KEY not configured",
        setup: "Free key at newsapi.org (100 req/day)",
      },
    };
  }
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}`;
  return await fetchJson(url, { headers: { "X-Api-Key": apiKey } });
}

async function handleNzHeadlines(query: string | undefined, limit: number) {
  const apiKey = Deno.env.get("NEWSAPI_KEY");
  if (!apiKey) {
    return {
      status: 200,
      body: {
        error: "NEWSAPI_KEY not configured",
        setup: "Free key at newsapi.org (100 req/day)",
      },
    };
  }
  let url = `https://newsapi.org/v2/top-headlines?country=nz&pageSize=${limit}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  return await fetchJson(url, { headers: { "X-Api-Key": apiKey } });
}

async function handleRssFeed(source: string, limit: number) {
  const sources = source === "all" ? ["rnz", "stuff", "nzherald"] : [source];
  const all: Array<Record<string, string> & { source: string }> = [];
  for (const s of sources) {
    const url = RSS_FEEDS[s];
    if (!url) continue;
    try {
      const { status, text } = await fetchText(url);
      if (status >= 400) continue;
      for (const item of parseRss(text, limit)) {
        all.push({ ...item, source: s });
      }
    } catch (err) {
      console.warn(`rss fetch failed for ${s}:`, (err as Error).message);
    }
  }
  // Sort by pubDate descending where parseable
  all.sort((a, b) => {
    const da = Date.parse(a.pubDate || "") || 0;
    const db = Date.parse(b.pubDate || "") || 0;
    return db - da;
  });
  return { status: 200, body: { items: all.slice(0, limit) } };
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

  const { action, query, source = "all" } = body as RequestBody;
  const limit = Math.max(1, Math.min(50, body.limit ?? 10));

  sb.from("mcp_data_log").insert({
    function_name: FUNCTION_NAME,
    action,
    request_params: { query: query ?? null, source, limit },
  }).then((res) => {
    if (res.error) console.error("mcp_data_log insert failed:", res.error.message);
  });

  try {
    let result: { status: number; body: unknown };
    switch (action) {
      case "search_news":
        if (!query) {
          return json({ error: "validation_error", detail: "query is required for search_news" }, 400);
        }
        result = await handleSearchNews(query, limit);
        break;
      case "nz_headlines":
        result = await handleNzHeadlines(query, limit);
        break;
      case "rss_feed":
        result = await handleRssFeed(source, limit);
        break;
    }
    return json(envelope(action, result.body), result.status >= 500 ? 502 : 200);
  } catch (err) {
    console.error(`${FUNCTION_NAME} error:`, err);
    return json({ error: "upstream_failure", detail: (err as Error).message }, 502);
  }
});
