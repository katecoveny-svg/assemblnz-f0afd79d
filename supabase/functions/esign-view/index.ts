import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Public e-sign envelope viewer.
 * GET ?token=xxx  → returns envelope (without secrets) + records 'viewed' event
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || (await req.json().catch(() => ({})))?.token;
    if (!token) {
      return new Response(JSON.stringify({ error: "token required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: env } = await supabase.from("esign_envelopes")
      .select("id, tenant_id, document_name, document_url, signer_name, signer_email, message, status, sent_at, signed_at, expires_at")
      .eq("token", token).maybeSingle();

    if (!env) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(env.expires_at) < new Date() && env.status !== "signed") {
      await supabase.from("esign_envelopes").update({ status: "expired" }).eq("id", env.id);
      env.status = "expired";
    }

    // Fetch tenant brand
    const { data: tenant } = await supabase.from("tenants")
      .select("name, brand_color, logo_url").eq("id", env.tenant_id).single();

    // Record view (only on first view)
    if (env.status === "sent") {
      await supabase.from("esign_envelopes").update({
        status: "viewed", viewed_at: new Date().toISOString(),
      }).eq("id", env.id);
      await supabase.from("esign_audit_events").insert({
        envelope_id: env.id, event_type: "viewed",
        ip_address: req.headers.get("x-forwarded-for") || null,
        user_agent: req.headers.get("user-agent") || null,
      });
    }

    return new Response(JSON.stringify({
      envelope: {
        id: env.id,
        document_name: env.document_name,
        document_url: env.document_url,
        signer_name: env.signer_name,
        signer_email: env.signer_email,
        message: env.message,
        status: env.status,
        sent_at: env.sent_at,
        signed_at: env.signed_at,
        expires_at: env.expires_at,
      },
      tenant,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("esign-view error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
