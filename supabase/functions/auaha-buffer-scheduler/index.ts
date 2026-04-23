// Auaha + Echo — Buffer / Later social scheduling automation
// Draft-only: never auto-publishes. Returns scheduled draft IDs that require human approval.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  action: "list_profiles" | "create_draft" | "list_drafts" | "schedule_draft";
  profile_ids?: string[];
  text?: string;
  media_url?: string;
  scheduled_at?: string; // ISO
  draft_id?: string;
}

const FUNCTION_NAME = "auaha-buffer-scheduler";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.action) return json({ error: "action required" }, 400);
    logRequest(body);

    const TOKEN = Deno.env.get("BUFFER_ACCESS_TOKEN");
    if (!TOKEN) {
      return json({
        source: FUNCTION_NAME,
        action: body.action,
        data: {
          configured: false,
          note: "BUFFER_ACCESS_TOKEN not configured. Connect Buffer in tenant settings.",
          draft: body,
        },
        timestamp: new Date().toISOString(),
      });
    }

    let url = "";
    let init: RequestInit = { headers: { Authorization: `Bearer ${TOKEN}` } };

    switch (body.action) {
      case "list_profiles":
        url = "https://api.bufferapp.com/1/profiles.json";
        break;
      case "list_drafts":
        url = `https://api.bufferapp.com/1/profiles/${body.profile_ids?.[0]}/updates/pending.json`;
        break;
      case "create_draft":
      case "schedule_draft": {
        url = "https://api.bufferapp.com/1/updates/create.json";
        const form = new URLSearchParams();
        (body.profile_ids ?? []).forEach((id) => form.append("profile_ids[]", id));
        if (body.text) form.set("text", body.text);
        if (body.media_url) form.set("media[photo]", body.media_url);
        if (body.scheduled_at) form.set("scheduled_at", String(Math.floor(new Date(body.scheduled_at).getTime() / 1000)));
        // Always treat as draft — never auto-publish
        form.set("now", "false");
        form.set("top", "false");
        init = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
        };
        break;
      }
    }

    const r = await fetch(url, init);
    const data = await r.json();
    return json({
      source: FUNCTION_NAME,
      action: body.action,
      data: { ...data, posture: "draft_only" },
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
