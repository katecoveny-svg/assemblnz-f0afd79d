// Auaha — fal.ai image generation (Flux + Midjourney-style models)
// Uses existing FAL_API_KEY secret.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  action: "generate" | "edit" | "list_models";
  prompt?: string;
  model?: string; // default flux-pro
  image_url?: string;
  width?: number;
  height?: number;
  num_images?: number;
}

const FUNCTION_NAME = "auaha-falai-image";

const MODELS: Record<string, string> = {
  "flux-pro": "fal-ai/flux-pro",
  "flux-dev": "fal-ai/flux/dev",
  "flux-schnell": "fal-ai/flux/schnell",
  "midjourney-v6": "fal-ai/imagen3", // closest legal alternative
  "ideogram-v2": "fal-ai/ideogram/v2",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.action) return json({ error: "action required" }, 400);
    logRequest(body);

    if (body.action === "list_models") {
      return json({
        source: FUNCTION_NAME,
        action: body.action,
        data: { models: Object.keys(MODELS) },
        timestamp: new Date().toISOString(),
      });
    }

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) {
      return json({
        source: FUNCTION_NAME,
        action: body.action,
        data: {
          configured: false,
          note: "FAL_API_KEY not configured.",
          draft: { prompt: body.prompt, model: body.model ?? "flux-pro" },
        },
        timestamp: new Date().toISOString(),
      });
    }

    const modelPath = MODELS[body.model ?? "flux-pro"] ?? MODELS["flux-pro"];
    const r = await fetch(`https://fal.run/${modelPath}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: body.prompt,
        image_url: body.image_url,
        image_size: { width: body.width ?? 1024, height: body.height ?? 1024 },
        num_images: body.num_images ?? 1,
      }),
    });
    const data = await r.json();
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
