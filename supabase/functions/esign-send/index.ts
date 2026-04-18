import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://assembl.co.nz";

/**
 * E-Sign Send (Path B) — creates an envelope and emails a magic link.
 * Body: { tenant_id, document_name, document_url, signer_name, signer_email, message? }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userResp = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userResp.error || !userResp.data.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userResp.data.user;

    const body = await req.json();
    const { tenant_id, document_name, document_url, signer_name, signer_email, message } = body;
    if (!tenant_id || !document_name || !document_url || !signer_name || !signer_email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: membership } = await supabase
      .from("tenant_members").select("role")
      .eq("user_id", user.id).eq("tenant_id", tenant_id).maybeSingle();
    if (!membership || !["admin", "manager"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate token (stored as-is; signer URL contains the token)
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

    const { data: envelope, error: envErr } = await supabase.from("esign_envelopes").insert({
      tenant_id, document_name, document_url, signer_name, signer_email,
      message: message || null, token, created_by: user.id,
    }).select().single();

    if (envErr) throw envErr;

    // Audit
    await supabase.from("esign_audit_events").insert({
      envelope_id: envelope.id, event_type: "sent",
      ip_address: req.headers.get("x-forwarded-for") || null,
      user_agent: req.headers.get("user-agent") || null,
      metadata: { sent_by: user.email },
    });

    const signUrl = `${APP_URL}/sign/${token}`;

    // Send email via Brevo (already configured)
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (brevoKey) {
      const { data: tenant } = await supabase.from("tenants").select("name").eq("id", tenant_id).single();
      const senderName = tenant?.name || "Assembl";

      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: senderName, email: "kia-ora@assembl.co.nz" },
          to: [{ email: signer_email, name: signer_name }],
          subject: `${senderName} — please sign: ${document_name}`,
          htmlContent: `
            <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
              <h2 style="color: #3D4250; font-weight: 400;">Kia ora ${signer_name},</h2>
              <p style="color: #3D4250; line-height: 1.6;">
                ${senderName} has sent you a document to review and sign: <strong>${document_name}</strong>.
              </p>
              ${message ? `<p style="color: #55575d; font-style: italic; padding: 16px; background: #f5f5f7; border-radius: 8px;">${message}</p>` : ""}
              <p style="text-align: center; margin: 32px 0;">
                <a href="${signUrl}" style="background: #3D4250; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">Review and sign</a>
              </p>
              <p style="color: #999; font-size: 12px; line-height: 1.5;">
                This link expires in 30 days. By signing, you confirm your identity and agree the document is legally binding.
                Audit trail captured: timestamp, IP address, typed name.
              </p>
              <p style="color: #999; font-size: 11px; margin-top: 32px;">Powered by Assembl · assembl.co.nz</p>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      envelope_id: envelope.id,
      sign_url: signUrl,
      token,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("esign-send error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
