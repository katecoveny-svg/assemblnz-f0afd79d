// Auaha — Unsplash + Pexels stock photo automation

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  action: "search" | "random" | "track_download";
  query?: string;
  source?: "unsplash" | "pexels" | "both";
  per_page?: number;
  orientation?: "landscape" | "portrait" | "squarish";
  download_url?: string;
}

const FUNCTION_NAME = "auaha-stock-photos";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.action) return json({ error: "action required" }, 400);
    logRequest(body);

    const UNSPLASH = Deno.env.get("UNSPLASH_ACCESS_KEY");
    const PEXELS = Deno.env.get("PEXELS_API_KEY");
    const source = body.source ?? "both";
    const perPage = body.per_page ?? 10;

    if (body.action === "track_download" && body.download_url) {
      if (UNSPLASH) {
        await fetch(body.download_url, {
          headers: { Authorization: `Client-ID ${UNSPLASH}` },
        }).catch(() => {});
      }
      return json({ source: FUNCTION_NAME, action: body.action, data: { tracked: true }, timestamp: new Date().toISOString() });
    }

    const tasks: Promise<unknown>[] = [];

    if ((source === "unsplash" || source === "both") && UNSPLASH) {
      const url = body.action === "random"
        ? `https://api.unsplash.com/photos/random?count=${perPage}&query=${encodeURIComponent(body.query ?? "")}&orientation=${body.orientation ?? "landscape"}`
        : `https://api.unsplash.com/search/photos?query=${encodeURIComponent(body.query ?? "")}&per_page=${perPage}&orientation=${body.orientation ?? "landscape"}`;
      tasks.push(
        fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH}` } })
          .then((r) => r.json())
          .then((d) => ({ provider: "unsplash", results: d }))
          .catch((e) => ({ provider: "unsplash", error: (e as Error).message })),
      );
    }

    if ((source === "pexels" || source === "both") && PEXELS) {
      const url = body.action === "random"
        ? `https://api.pexels.com/v1/curated?per_page=${perPage}`
        : `https://api.pexels.com/v1/search?query=${encodeURIComponent(body.query ?? "")}&per_page=${perPage}&orientation=${body.orientation ?? "landscape"}`;
      tasks.push(
        fetch(url, { headers: { Authorization: PEXELS } })
          .then((r) => r.json())
          .then((d) => ({ provider: "pexels", results: d }))
          .catch((e) => ({ provider: "pexels", error: (e as Error).message })),
      );
    }

    if (tasks.length === 0) {
      return json({
        source: FUNCTION_NAME,
        action: body.action,
        data: { configured: false, note: "Add UNSPLASH_ACCESS_KEY and/or PEXELS_API_KEY." },
        timestamp: new Date().toISOString(),
      });
    }

    const results = await Promise.all(tasks);
    return json({
      source: FUNCTION_NAME,
      action: body.action,
      data: { results },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function logRequest(body: Body) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !KEY) return;
  fetch(`${SUPABASE_URL}/rest/v1/mcp_data_log`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      function_name: FUNCTION_NAME,
      action: body.action,
      request_params: body,
    }),
  }).catch(() => {});
}
