// health-check-cron — full-pipeline health probe, runs every 5 minutes.
//
// Verifies the services Assembl actually depends on to take and act on a signup:
//   1. Supabase DB      — connectivity + a real round-trip WRITE (test waitlist
//                          row inserted then deleted from developer_waitlist)
//   2. Brevo API        — transactional email provider (with an explicit
//                          IP-allowlist trap: Brevo silently blocks sends from
//                          un-authorised IPs, which has burned us before)
//   3. Stripe API       — payments
//   4. Vercel /api/ping — the Next.js app is up and serving routes
//
// On ANY failure (or the Brevo IP block) it alerts twice — a webhook POST to
// HEALTH_ALERT_WEBHOOK_URL and an email to assembl@assembl.co.nz — and writes a
// row to public.health_check_logs either way. The /admin/health dashboard reads
// the last 24h of those rows.
//
// Auth: invoked by pg_cron with the service-role bearer, or manually with the
// HEALTH_CHECK_API_KEY (x-api-key header or Bearer). Anything else → 401.
//
// Env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY  (auto-injected)
//   BREVO_API_KEY            — Brevo transactional API key
//   STRIPE_SECRET_KEY        — Stripe secret key
//   HEALTH_CHECK_API_KEY     — shared secret for manual invocation + dashboard
//   HEALTH_ALERT_WEBHOOK_URL — POST target for failure alerts (Slack/Discord/etc.)
//   HEALTH_PING_URL          — optional override for the Vercel ping URL

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const ALERT_EMAIL = "assembl@assembl.co.nz";
const DEFAULT_PING_URL = "https://www.assembl.co.nz/api/ping";

type Status = "ok" | "error";

interface CheckResult {
  name: string;
  status: Status;
  response_time_ms: number;
  error_message?: string;
  // 'critical' failures flip overall_status to 'down'; others to 'degraded'.
  category: "critical" | "high" | "medium";
}

// Brevo blocks API calls from IPs that are not on the account's authorised list.
// The response is a 401 whose message names the IP / authorised-IPs list. We trap
// that signature specifically so we can alert "Brevo IP blocked" rather than the
// generic "bad key", because the fix is completely different (allowlist the IP).
function isBrevoIpBlock(status: number, body: string): boolean {
  if (status !== 401) return false;
  const b = body.toLowerCase();
  return (
    b.includes("unrecognised ip") ||
    b.includes("unrecognized ip") ||
    b.includes("unauthorized ip") ||
    b.includes("authorised ip") ||
    b.includes("authorized ip") ||
    (b.includes("ip address") && (b.includes("authoris") || b.includes("authoriz")))
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const runStart = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const healthKey = Deno.env.get("HEALTH_CHECK_API_KEY") || "";

  // ── Auth: cron (service-role bearer) OR the shared HEALTH_CHECK_API_KEY ──
  const authHeader = req.headers.get("authorization") || "";
  const xApiKey = req.headers.get("x-api-key") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const isCron = !!serviceRoleKey && bearer === serviceRoleKey;
  const isKeyed = !!healthKey && (xApiKey === healthKey || bearer === healthKey);
  if (!isCron && !isKeyed) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const checks: CheckResult[] = [];
  let brevoIpBlocked = false;

  // ── 1. Supabase DB — connectivity + real round-trip write ──
  {
    const start = Date.now();
    const probeEmail = `health-check+${runStart}@assembl.co.nz`;
    try {
      const { data: inserted, error: insErr } = await supabase
        .from("developer_waitlist")
        .insert({ email: probeEmail, source: "health-check", use_case: "automated pipeline probe" })
        .select("id")
        .single();
      if (insErr) throw insErr;
      // Clean up immediately so the probe never pollutes the real list.
      const { error: delErr } = await supabase
        .from("developer_waitlist")
        .delete()
        .eq("id", inserted!.id);
      if (delErr) throw delErr;
      checks.push({ name: "supabase_db_write", status: "ok", response_time_ms: Date.now() - start, category: "critical" });
    } catch (err) {
      checks.push({
        name: "supabase_db_write",
        status: "error",
        response_time_ms: Date.now() - start,
        error_message: (err as Error).message,
        category: "critical",
      });
    }
  }

  // ── 2. Brevo API + IP-allowlist trap ──
  {
    const start = Date.now();
    const brevoKey = Deno.env.get("BREVO_API_KEY") || "";
    try {
      if (!brevoKey) throw new Error("BREVO_API_KEY not set");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": brevoKey, accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      const body = await res.text();
      const elapsed = Date.now() - start;
      if (res.ok) {
        checks.push({ name: "brevo_api", status: "ok", response_time_ms: elapsed, category: "high" });
      } else if (isBrevoIpBlock(res.status, body)) {
        brevoIpBlocked = true;
        checks.push({
          name: "brevo_ip_allowlist",
          status: "error",
          response_time_ms: elapsed,
          error_message: "Brevo BLOCKED our IP — add this server's egress IP to Brevo → Authorised IPs. Email alerts are NOT sending.",
          category: "critical",
        });
      } else {
        checks.push({
          name: "brevo_api",
          status: "error",
          response_time_ms: elapsed,
          error_message: `HTTP ${res.status}: ${body.slice(0, 200)}`,
          category: "high",
        });
      }
    } catch (err) {
      checks.push({
        name: "brevo_api",
        status: "error",
        response_time_ms: Date.now() - start,
        error_message: (err as Error).message,
        category: "high",
      });
    }
  }

  // ── 3. Stripe API ──
  {
    const start = Date.now();
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    try {
      if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("https://api.stripe.com/v1/products?limit=1", {
        headers: { Authorization: `Bearer ${stripeKey}` },
        signal: controller.signal,
      });
      clearTimeout(timer);
      const body = await res.text();
      const elapsed = Date.now() - start;
      if (res.ok) {
        checks.push({ name: "stripe_api", status: "ok", response_time_ms: elapsed, category: "critical" });
      } else {
        checks.push({
          name: "stripe_api",
          status: "error",
          response_time_ms: elapsed,
          error_message: `HTTP ${res.status}: ${body.slice(0, 200)}`,
          category: "critical",
        });
      }
    } catch (err) {
      checks.push({
        name: "stripe_api",
        status: "error",
        response_time_ms: Date.now() - start,
        error_message: (err as Error).message,
        category: "critical",
      });
    }
  }

  // ── 4. Vercel /api/ping ──
  {
    const start = Date.now();
    const pingUrl = Deno.env.get("HEALTH_PING_URL") || DEFAULT_PING_URL;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(pingUrl, { headers: { accept: "application/json" }, signal: controller.signal });
      clearTimeout(timer);
      await res.text();
      const elapsed = Date.now() - start;
      if (res.status >= 200 && res.status < 400) {
        checks.push({ name: "vercel_ping", status: "ok", response_time_ms: elapsed, category: "critical" });
      } else {
        checks.push({
          name: "vercel_ping",
          status: "error",
          response_time_ms: elapsed,
          error_message: `HTTP ${res.status}`,
          category: "critical",
        });
      }
    } catch (err) {
      checks.push({
        name: "vercel_ping",
        status: "error",
        response_time_ms: Date.now() - start,
        error_message: (err as Error).message,
        category: "critical",
      });
    }
  }

  // ── Roll up ──
  const failures = checks.filter((c) => c.status === "error");
  const hasCritical = failures.some((f) => f.category === "critical");
  const overallStatus = hasCritical ? "down" : failures.length > 0 ? "degraded" : "ok";
  const durationMs = Date.now() - runStart;

  // ── Alert on failure (webhook + email) ──
  let webhookDelivered = false;
  let emailDelivered = false;

  if (failures.length > 0 || brevoIpBlocked) {
    const summary = failures.map((f) => `${f.category.toUpperCase()} · ${f.name}: ${f.error_message}`);

    // Webhook — the IP-block-resilient channel (does not depend on Brevo).
    const webhookUrl = Deno.env.get("HEALTH_ALERT_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text:
              `🚨 Assembl health ${overallStatus.toUpperCase()} — ${failures.length} failure(s)` +
              (brevoIpBlocked ? " · ⛔ BREVO IP BLOCKED (email alerts down)" : ""),
            status: overallStatus,
            brevo_ip_blocked: brevoIpBlocked,
            failures: summary,
            timestamp: new Date().toISOString(),
          }),
        });
        webhookDelivered = res.ok;
      } catch (err) {
        console.error("health alert webhook failed:", (err as Error).message);
      }
    }

    // Email via Brevo — pointless (and would re-trigger the block) if Brevo's IP
    // is the thing that's down, so skip the send in that case.
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (brevoKey && !brevoIpBlocked) {
      const rows = failures
        .map(
          (f) =>
            `<tr><td style="padding:8px;border-bottom:1px solid #1a1a2e">${f.category.toUpperCase()}</td><td style="padding:8px;border-bottom:1px solid #1a1a2e;font-weight:bold">${f.name}</td><td style="padding:8px;border-bottom:1px solid #1a1a2e;color:#ef4444">${f.error_message}</td><td style="padding:8px;border-bottom:1px solid #1a1a2e">${f.response_time_ms}ms</td></tr>`,
        )
        .join("");
      try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Assembl Health Monitor", email: "noreply@assembl.co.nz" },
            to: [{ email: ALERT_EMAIL, name: "Assembl Team" }],
            subject:
              overallStatus === "down"
                ? `🚨 CRITICAL: pipeline ${overallStatus} — ${failures.length} failure(s)`
                : `⚠️ DEGRADED: ${failures.length} health check(s) failing`,
            htmlContent: `
              <div style="font-family:Arial,sans-serif;background:#09090F;color:#E4E4EC;padding:24px;border-radius:12px">
                <h2 style="color:#D4A843;margin-bottom:4px">Assembl Pipeline Health</h2>
                <p style="color:#71717A;font-size:13px;margin-bottom:16px">${failures.length} check(s) failed at ${new Date().toISOString()}</p>
                <table style="width:100%;border-collapse:collapse;font-size:13px">
                  <thead><tr style="color:#71717A;border-bottom:2px solid #1a1a2e">
                    <th style="text-align:left;padding:8px">Severity</th>
                    <th style="text-align:left;padding:8px">Check</th>
                    <th style="text-align:left;padding:8px">Error</th>
                    <th style="text-align:left;padding:8px">Latency</th>
                  </tr></thead>
                  <tbody>${rows}</tbody>
                </table>
                <p style="margin-top:16px;font-size:11px;color:#52525B">See the <a href="https://www.assembl.co.nz/admin/health" style="color:#D4A843">health dashboard</a> for the last 24h.</p>
              </div>`,
          }),
        });
        // If the alert send itself trips the IP block, record it.
        if (!res.ok) {
          const body = await res.text();
          if (isBrevoIpBlock(res.status, body)) brevoIpBlocked = true;
        }
        emailDelivered = res.ok;
      } catch (err) {
        console.error("health alert email failed:", (err as Error).message);
      }
    }
  }

  // ── Persist ──
  const { error: logErr } = await supabase.from("health_check_logs").insert({
    overall_status: overallStatus,
    checks,
    failures: failures.length,
    brevo_ip_blocked: brevoIpBlocked,
    alerted: failures.length > 0 || brevoIpBlocked,
    webhook_delivered: webhookDelivered,
    email_delivered: emailDelivered,
    duration_ms: durationMs,
    run_source: isCron ? "cron" : "manual",
  });
  if (logErr) console.error("failed to write health_check_logs:", logErr.message);

  return new Response(
    JSON.stringify({
      overall_status: overallStatus,
      failures: failures.length,
      brevo_ip_blocked: brevoIpBlocked,
      checks,
      duration_ms: durationMs,
      timestamp: new Date().toISOString(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
