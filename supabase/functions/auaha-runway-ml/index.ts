// Auaha — Runway ML video editing & motion design bridge
// Returns generation job descriptors. Draft-only.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  action: "generate_video" | "edit_video" | "motion_design" | "job_status";
  prompt?: string;
  reference_image_url?: string;
  duration_seconds?: number;
  ratio?: "16:9" | "9:16" | "1:1";
  job_id?: string;
}

const FUNCTION_NAME = "auaha-runway-ml";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.action) return json({ error: "action required" }, 400);

    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    logRequest(body);

    if (body.action === "job_status") {
      if (!RUNWAY_API_KEY) {
        return json({
          source: FUNCTION_NAME,
          action: body.action,
          data: { configured: false, status: "unknown" },
          timestamp: new Date().toISOString(),
        });
      }
      const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${body.job_id}`, {
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      });
      const data = await r.json();
      return json({ source: FUNCTION_NAME, action: body.action, data, timestamp: new Date().toISOString() });
    }

    if (!RUNWAY_API_KEY) {
      return json({
        source: FUNCTION_NAME,
        action: body.action,
        data: {
          configured: false,
          draft: {
            prompt: body.prompt,
            ratio: body.ratio ?? "16:9",
            duration_seconds: body.duration_seconds ?? 5,
          },
          note: "RUNWAY_API_KEY not configured — returning draft brief.",
        },
        timestamp: new Date().toISOString(),
      });
    }

    const r = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        promptImage: body.reference_image_url,
        promptText: body.prompt,
        model: "gen3a_turbo",
        ratio: body.ratio ?? "16:9",
        duration: body.duration_seconds ?? 5,
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
