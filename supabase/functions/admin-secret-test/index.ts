// Admin Secret Test — pings third-party APIs to verify a stored secret actually works.
// Admin-only. Returns { ok, latency_ms, message } — never returns the secret value.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface TestResult {
  ok: boolean;
  latency_ms: number;
  status_code?: number;
  message: string;
  detail?: unknown;
}

async function timed<T>(fn: () => Promise<T>): Promise<{ result?: T; error?: unknown; ms: number }> {
  const t0 = performance.now();
  try {
    const result = await fn();
    return { result, ms: Math.round(performance.now() - t0) };
  } catch (error) {
    return { error, ms: Math.round(performance.now() - t0) };
  }
}

async function testSecret(name: string): Promise<TestResult> {
  const v = Deno.env.get(name);
  if (!v) return { ok: false, latency_ms: 0, message: "Secret not set" };

  switch (name) {
    case "ANTHROPIC_API_KEY": {
      const t = await timed(() =>
        fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": v,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 8,
            messages: [{ role: "user", content: "ping" }],
          }),
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return {
        ok: r.ok,
        latency_ms: t.ms,
        status_code: r.status,
        message: r.ok ? "Authenticated · model responded" : `HTTP ${r.status}`,
        detail: r.ok ? undefined : await r.text().catch(() => null),
      };
    }

    case "OPENROUTER_API_KEY": {
      const t = await timed(() =>
        fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { Authorization: `Bearer ${v}` },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return {
        ok: r.ok,
        latency_ms: t.ms,
        status_code: r.status,
        message: r.ok ? "Authenticated · key valid" : `HTTP ${r.status}`,
      };
    }

    case "GEMINI_API_KEY": {
      const t = await timed(() =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${v}`)
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · models listed" : `HTTP ${r.status}` };
    }

    case "RUNWAY_API_KEY": {
      const t = await timed(() =>
        fetch("https://api.dev.runwayml.com/v1/organization", {
          headers: { Authorization: `Bearer ${v}`, "X-Runway-Version": "2024-11-06" },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · org accessible" : `HTTP ${r.status}` };
    }

    case "FAL_API_KEY": {
      const t = await timed(() =>
        fetch("https://queue.fal.run/fal-ai/flux/schnell/status", {
          headers: { Authorization: `Key ${v}` },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      // fal returns 422 for missing payload but 401 for bad auth — treat non-401 as OK
      const ok = r.status !== 401 && r.status !== 403;
      return { ok, latency_ms: t.ms, status_code: r.status, message: ok ? "Authenticated · queue reachable" : `HTTP ${r.status}` };
    }

    case "UNSPLASH_ACCESS_KEY": {
      const t = await timed(() =>
        fetch("https://api.unsplash.com/photos/random?count=1", {
          headers: { Authorization: `Client-ID ${v}` },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · random photo OK" : `HTTP ${r.status}` };
    }

    case "PEXELS_API_KEY": {
      const t = await timed(() =>
        fetch("https://api.pexels.com/v1/curated?per_page=1", {
          headers: { Authorization: v },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · curated OK" : `HTTP ${r.status}` };
    }

    case "BUFFER_ACCESS_TOKEN": {
      const t = await timed(() =>
        fetch("https://api.bufferapp.com/1/user.json", {
          headers: { Authorization: `Bearer ${v}` },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · user fetched" : `HTTP ${r.status}` };
    }

    case "ADOBE_CLIENT_SECRET": {
      const id = Deno.env.get("ADOBE_CLIENT_ID");
      if (!id) return { ok: false, latency_ms: 0, message: "Requires ADOBE_CLIENT_ID alongside" };
      const t = await timed(() =>
        fetch("https://ims-na1.adobelogin.com/ims/token/v3", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: id,
            client_secret: v,
            scope: "openid,AdobeID",
          }).toString(),
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "OAuth token issued" : `HTTP ${r.status}` };
    }

    case "TWILIO_AUTH_TOKEN": {
      const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
      if (!sid) return { ok: false, latency_ms: 0, message: "Requires TWILIO_ACCOUNT_SID" };
      const t = await timed(() =>
        fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
          headers: { Authorization: `Basic ${btoa(`${sid}:${v}`)}` },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · account fetched" : `HTTP ${r.status}` };
    }

    case "BREVO_API_KEY": {
      const t = await timed(() =>
        fetch("https://api.brevo.com/v3/account", { headers: { "api-key": v } })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · account fetched" : `HTTP ${r.status}` };
    }

    case "ELEVENLABS_API_KEY": {
      const t = await timed(() =>
        fetch("https://api.elevenlabs.io/v1/user", { headers: { "xi-api-key": v } })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · user fetched" : `HTTP ${r.status}` };
    }

    case "OPENWEATHERMAP_API_KEY": {
      const t = await timed(() =>
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=Auckland&appid=${v}`)
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · Auckland weather OK" : `HTTP ${r.status}` };
    }

    case "STRIPE_SECRET_KEY": {
      const t = await timed(() =>
        fetch("https://api.stripe.com/v1/balance", {
          headers: { Authorization: `Bearer ${v}` },
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      return { ok: r.ok, latency_ms: t.ms, status_code: r.status, message: r.ok ? "Authenticated · balance fetched" : `HTTP ${r.status}` };
    }

    case "FIRECRAWL_API_KEY": {
      const t = await timed(() =>
        fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${v}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: "https://example.com", formats: ["markdown"] }),
        })
      );
      if (t.error) return { ok: false, latency_ms: t.ms, message: String(t.error) };
      const r = t.result!;
      const ok = r.status !== 401 && r.status !== 403;
      return { ok, latency_ms: t.ms, status_code: r.status, message: ok ? "Authenticated · scrape reachable" : `HTTP ${r.status}` };
    }

    default:
      return { ok: false, latency_ms: 0, message: `No live test implemented for ${name}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "forbidden — admin role required" }, 403);

    const body = await req.json().catch(() => ({}));
    const secret_name = String(body?.secret_name || "");
    if (!secret_name) return json({ error: "secret_name required" }, 400);

    const result = await testSecret(secret_name);
    return json({
      secret_name,
      tested_at: new Date().toISOString(),
      ...result,
    });
  } catch (e) {
    console.error("admin-secret-test error:", e);
    return json({ error: e instanceof Error ? e.message : "internal" }, 500);
  }
});
