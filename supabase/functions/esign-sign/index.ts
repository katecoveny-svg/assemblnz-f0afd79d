import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Sign envelope. Body: { token, typed_name }
 * Captures: typed name, IP, UA, timestamp. Records audit + emails confirmation.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token, typed_name, action } = await req.json();
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
      .select("*").eq("token", token).maybeSingle();
    if (!env) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (env.status === "signed") {
      return new Response(JSON.stringify({ error: "already_signed" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(env.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "expired" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";

    if (action === "decline") {
      await supabase.from("esign_envelopes").update({ status: "declined" }).eq("id", env.id);
      await supabase.from("esign_audit_events").insert({
        envelope_id: env.id, event_type: "declined", ip_address: ip, user_agent: ua,
      });
      return new Response(JSON.stringify({ ok: true, status: "declined" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!typed_name || typed_name.trim().length < 2) {
      return new Response(JSON.stringify({ error: "typed_name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signedAt = new Date().toISOString();

    await supabase.from("esign_envelopes").update({
      status: "signed",
      signed_at: signedAt,
      signed_ip: ip,
      signed_typed_name: typed_name.trim(),
      signed_user_agent: ua,
    }).eq("id", env.id);

    await supabase.from("esign_audit_events").insert({
      envelope_id: env.id, event_type: "signed",
      ip_address: ip, user_agent: ua,
      metadata: { typed_name: typed_name.trim() },
    });

    // Email both parties
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (brevoKey) {
      const { data: tenant } = await supabase.from("tenants").select("name, billing_email").eq("id", env.tenant_id).single();
      const senderName = tenant?.name || "Assembl";

      const certHtml = `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #3D4250; font-weight: 400;">Signature confirmed</h2>
          <p style="color: #3D4250; line-height: 1.6;">
            <strong>${env.document_name}</strong> was signed on ${new Date(signedAt).toUTCString()}.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #999;">Signed by</td><td style="padding: 6px 0; color: #3D4250;">${typed_name.trim()}</td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Email</td><td style="padding: 6px 0; color: #3D4250;">${env.signer_email}</td></tr>
            <tr><td style="padding: 6px 0; color: #999;">IP address</td><td style="padding: 6px 0; color: #3D4250;">${ip}</td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Timestamp (UTC)</td><td style="padding: 6px 0; color: #3D4250;">${signedAt}</td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Envelope ID</td><td style="padding: 6px 0; color: #3D4250; font-family: monospace; font-size: 11px;">${env.id}</td></tr>
          </table>
          <p style="color: #999; font-size: 11px; margin-top: 32px;">Powered by Assembl · assembl.co.nz</p>
        </div>
      `;

      const recipients = [{ email: env.signer_email, name: env.signer_name }];
      if (tenant?.billing_email) recipients.push({ email: tenant.billing_email, name: senderName });

      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: "Assembl", email: "kia-ora@assembl.co.nz" },
          to: recipients,
          subject: `Signed: ${env.document_name}`,
          htmlContent: certHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, status: "signed", signed_at: signedAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("esign-sign error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
