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
}

async function checkService(name: string, url: string, timeout = 10000): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const elapsed = Date.now() - start;
    if (res.status >= 200 && res.status < 400) {
      return { service_name: name, status: "ok", response_time_ms: elapsed };
    }
    return { service_name: name, status: "error", response_time_ms: elapsed, error_message: `HTTP ${res.status}` };
  } catch (err) {
    return { service_name: name, status: "error", response_time_ms: Date.now() - start, error_message: err.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Run all checks in parallel
    const checks = await Promise.all([
      checkService("assembl_website", "https://assemblnz.lovable.app"),
      checkService("supabase_api", `${supabaseUrl}/rest/v1/?apikey=${Deno.env.get("SUPABASE_ANON_KEY")}`),
      checkService("chat_function", `${supabaseUrl}/functions/v1/chat`, 8000),
      checkService("elevenlabs_api", "https://api.elevenlabs.io/v1/models"),
    ]);

    // Store results
    const rows = checks.map((c) => ({
      service_name: c.service_name,
      status: c.status,
      response_time_ms: c.response_time_ms,
      error_message: c.error_message || null,
    }));
    await supabase.from("health_checks").insert(rows);

    // Check for failures and alert
    const failures = checks.filter((c) => c.status === "error");
    if (failures.length > 0) {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) {
        const failDetails = failures.map((f) => `- ${f.service_name}: ${f.error_message} (${f.response_time_ms}ms)`).join("\n");
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Assembl Health Monitor", email: "noreply@assembl.co.nz" },
            to: [{ email: "assembl@assembl.co.nz", name: "Assembl Team" }],
            subject: `ALERT: ${failures.length} service(s) down`,
            htmlContent: `<h2>Assembl Health Alert</h2><p>${failures.length} service(s) failed at ${new Date().toISOString()}:</p><pre>${failDetails}</pre><p>Check the admin health dashboard for details.</p>`,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ checks, failures: failures.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Health check error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
