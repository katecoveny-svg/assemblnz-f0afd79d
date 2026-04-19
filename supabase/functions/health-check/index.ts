import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckResult {
  service_name: string;
  status: "ok" | "error";
  response_time_ms: number;
  error_message?: string;
  category?: string;
}

async function checkService(
  name: string,
  url: string,
  options: { timeout?: number; method?: string; headers?: Record<string, string>; treatAuthAsOk?: boolean; category?: string } = {}
): Promise<CheckResult> {
  const { timeout = 10000, method = "GET", headers = {}, treatAuthAsOk = false, category = "core" } = options;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { method, signal: controller.signal, headers });
    clearTimeout(timer);
    const elapsed = Date.now() - start;
    await res.text();

    if (res.status >= 200 && res.status < 400) {
      return { service_name: name, status: "ok", response_time_ms: elapsed, category };
    }
    if (treatAuthAsOk && (res.status === 401 || res.status === 403 || res.status === 405)) {
      return { service_name: name, status: "ok", response_time_ms: elapsed, category };
    }
    return { service_name: name, status: "error", response_time_ms: elapsed, error_message: `HTTP ${res.status}`, category };
  } catch (err) {
    return { service_name: name, status: "error", response_time_ms: Date.now() - start, error_message: (err as Error).message, category };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Core services
    const checks = await Promise.all([
      checkService("assembl_website", "https://assemblnz.lovable.app", { category: "frontend" }),
      checkService("supabase_api", `${supabaseUrl}/rest/v1/`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        treatAuthAsOk: true,
        category: "core",
      }),
      checkService("chat_function", `${supabaseUrl}/functions/v1/chat`, {
        method: "OPTIONS",
        timeout: 8000,
        treatAuthAsOk: true,
        category: "ai",
      }),
      checkService("stitch_generate", `${supabaseUrl}/functions/v1/stitch-generate`, {
        method: "OPTIONS",
        timeout: 8000,
        treatAuthAsOk: true,
        category: "ai",
      }),
      checkService("elevenlabs_api", "https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY") || "" },
        treatAuthAsOk: true,
        category: "voice",
      }),
      // Payment
      checkService("stripe_api", "https://api.stripe.com/v1/products", {
        headers: { Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY") || ""}` },
        treatAuthAsOk: true,
        category: "payment",
      }),
      // TNZ API removed from health checks — endpoint returns errors and floods alert emails
      // AI Gateway (Lovable AI)
      checkService("lovable_ai_gateway", "https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "OPTIONS",
        treatAuthAsOk: true,
        category: "ai",
      }),
      // Data sources
      checkService("open_meteo_weather", "https://api.open-meteo.com/v1/forecast?latitude=-36.86&longitude=174.77&current=temperature_2m", {
        timeout: 8000,
        category: "data",
      }),
      checkService("nz_fuel_prices", `${supabaseUrl}/functions/v1/nz-fuel-prices`, {
        method: "OPTIONS",
        treatAuthAsOk: true,
        category: "data",
      }),
      checkService("mapbox_routes", `${supabaseUrl}/functions/v1/nz-routes`, {
        method: "OPTIONS",
        treatAuthAsOk: true,
        category: "data",
      }),
    ]);

    // Store results
    const rows = checks.map((c) => ({
      service_name: c.service_name,
      status: c.status,
      response_time_ms: c.response_time_ms,
      error_message: c.error_message || null,
    }));
    await supabase.from("health_checks").insert(rows);

    // ═══ SENTINEL — Knowledge Brain stale-source detection ═══
    // Scan kb_sources where last_checked_at is older than 3× cadence.
    // Open one alert per stale source (idempotent on resolved_at IS NULL).
    const sentinelAlerts: { source_id: string; name: string; reason: string }[] = [];
    try {
      const { data: sources } = await supabase
        .from("kb_sources")
        .select("id, name, cadence_minutes, last_checked_at, active")
        .eq("active", true);

      const nowMs = Date.now();
      for (const s of sources ?? []) {
        const lastMs = s.last_checked_at ? new Date(s.last_checked_at).getTime() : 0;
        const staleThreshold = (s.cadence_minutes ?? 60) * 60_000 * 3;
        const ageMs = lastMs ? nowMs - lastMs : Infinity;
        const isStale = !lastMs || ageMs > staleThreshold;
        if (!isStale) continue;

        // Check existing open alert
        const { data: existing } = await supabase
          .from("kb_sentinel_alerts")
          .select("id")
          .eq("source_id", s.id)
          .is("resolved_at", null)
          .limit(1);
        if (existing && existing.length > 0) continue;

        const reason = lastMs
          ? `No fetch in ${Math.round(ageMs / 60000)} min (cadence ${s.cadence_minutes}m)`
          : "Never fetched";

        await supabase.from("kb_sentinel_alerts").insert({
          source_id: s.id,
          severity: "warning",
          reason,
        });
        sentinelAlerts.push({ source_id: s.id, name: s.name, reason });
      }

      // Auto-resolve alerts whose source has been fetched recently
      if (sources?.length) {
        const freshIds = sources
          .filter((s) => {
            const lastMs = s.last_checked_at ? new Date(s.last_checked_at).getTime() : 0;
            const staleThreshold = (s.cadence_minutes ?? 60) * 60_000 * 3;
            return lastMs && nowMs - lastMs <= staleThreshold;
          })
          .map((s) => s.id);
        if (freshIds.length) {
          await supabase
            .from("kb_sentinel_alerts")
            .update({ resolved_at: new Date().toISOString() })
            .in("source_id", freshIds)
            .is("resolved_at", null);
        }
      }
    } catch (err) {
      console.error("SENTINEL scan failed:", err);
    }

    // Identify failures
    const failures = checks.filter((c) => c.status === "error");

    // Send email alert for ANY failures
    if (failures.length > 0) {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) {
        const severityMap: Record<string, string> = {
          payment: "🔴 CRITICAL",
          ai: "🟠 HIGH",
          core: "🔴 CRITICAL",
          frontend: "🟡 MEDIUM",
          voice: "🟡 MEDIUM",
          comms: "🟠 HIGH",
          data: "🟡 MEDIUM",
        };

        const failDetails = failures.map((f) => {
          const sev = severityMap[f.category || "core"] || "⚪ INFO";
          return `<tr><td style="padding:8px;border-bottom:1px solid #1a1a2e">${sev}</td><td style="padding:8px;border-bottom:1px solid #1a1a2e;font-weight:bold">${f.service_name}</td><td style="padding:8px;border-bottom:1px solid #1a1a2e;color:#ef4444">${f.error_message}</td><td style="padding:8px;border-bottom:1px solid #1a1a2e">${f.response_time_ms}ms</td></tr>`;
        }).join("");

        const criticalCount = failures.filter(f => ["payment", "core"].includes(f.category || "")).length;
        const subject = criticalCount > 0
          ? `🚨 CRITICAL: ${criticalCount} critical service(s) down — ${failures.length} total failures`
          : `⚠️ ALERT: ${failures.length} service(s) degraded`;

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Assembl Health Monitor", email: "noreply@assembl.co.nz" },
            to: [{ email: "assembl@assembl.co.nz", name: "Assembl Team" }],
            subject,
            htmlContent: `
              <div style="font-family:Arial,sans-serif;background:#09090F;color:#E4E4EC;padding:24px;border-radius:12px">
                <h2 style="color:#D4A843;margin-bottom:4px">Assembl Health Alert</h2>
                <p style="color:#71717A;font-size:13px;margin-bottom:16px">${failures.length} service(s) failed at ${new Date().toISOString()}</p>
                <table style="width:100%;border-collapse:collapse;font-size:13px">
                  <thead><tr style="color:#71717A;border-bottom:2px solid #1a1a2e">
                    <th style="text-align:left;padding:8px">Severity</th>
                    <th style="text-align:left;padding:8px">Service</th>
                    <th style="text-align:left;padding:8px">Error</th>
                    <th style="text-align:left;padding:8px">Latency</th>
                  </tr></thead>
                  <tbody>${failDetails}</tbody>
                </table>
                <div style="margin-top:16px;padding:12px;background:#1a1a2e;border-radius:8px;font-size:12px">
                  <p style="margin:0;color:#71717A"><strong style="color:#D4A843">Healthy services:</strong> ${checks.filter(c => c.status === "ok").map(c => c.service_name).join(", ") || "None"}</p>
                </div>
                <p style="margin-top:16px;font-size:11px;color:#52525B">Check the <a href="https://assemblnz.lovable.app/admin/health" style="color:#D4A843">admin health dashboard</a> for details.</p>
              </div>`,
          }),
        });
      }
    }

    return new Response(JSON.stringify({
      checks,
      failures: failures.length,
      sentinel_alerts: sentinelAlerts,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Health check error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
