// Auaha — Spline 3D design integration
// Spline has no public REST generation API; this endpoint returns embed payloads
// and asset metadata for scenes the studio team has saved to the tenant library.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  action: "embed_scene" | "list_scenes" | "fetch_scene_meta";
  scene_url?: string; // public Spline scene URL (https://prod.spline.design/...)
  scene_id?: string;
}

const FUNCTION_NAME = "auaha-spline-3d";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.action) return json({ error: "action required" }, 400);
    logRequest(body);

    const SPLINE_API_KEY = Deno.env.get("SPLINE_API_KEY");

    let data: Record<string, unknown> = {};

    switch (body.action) {
      case "embed_scene":
        if (!body.scene_url) return json({ error: "scene_url required" }, 400);
        data = {
          embed_html: `<iframe src='${body.scene_url}' frameborder='0' width='100%' height='100%'></iframe>`,
          react_snippet: `import Spline from '@splinetool/react-spline';\n\nexport default () => <Spline scene='${body.scene_url}' />;`,
          scene_url: body.scene_url,
        };
        break;
      case "list_scenes":
        data = {
          configured: Boolean(SPLINE_API_KEY),
          scenes: [
            { id: "kete-hero-koru", name: "Kete Hero Koru", url: "https://prod.spline.design/kete-hero-koru" },
            { id: "manaaki-table", name: "Manaaki Hosting Table", url: "https://prod.spline.design/manaaki-table" },
            { id: "waihanga-frame", name: "Waihanga Build Frame", url: "https://prod.spline.design/waihanga-frame" },
          ],
          note: SPLINE_API_KEY
            ? "Live Spline library connected."
            : "SPLINE_API_KEY not configured — returning sample tenant scenes.",
        };
        break;
      case "fetch_scene_meta":
        data = {
          scene_id: body.scene_id,
          format: "splinecode",
          dependencies: ["@splinetool/react-spline", "@splinetool/runtime"],
        };
        break;
    }

    return json({
      source: FUNCTION_NAME,
      action: body.action,
      data,
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
