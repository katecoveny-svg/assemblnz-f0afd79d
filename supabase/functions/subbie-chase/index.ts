import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * SUBBIE-CHASE
 * ============
 * Sends a TXT chase reminder to a subcontractor whose compliance
 * documents are about to expire (or already expired). Logs every
 * outbound message to chase_log + messaging_messages for audit.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChaseRequest {
  subbie_id: string;
  reason?: string;
  custom_message?: string;
}

function buildMessage(subbie: any, reason: string): string {
  const parts: string[] = [];
  parts.push(`Kia ora ${subbie.contact_name || subbie.company_name},`);
  parts.push("");
  parts.push("Quick chase from the site office:");

  const today = new Date();
  const expiries: string[] = [];
  const daysUntil = (d: string | null) => d ? Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000) : null;

  const lbpDays = daysUntil(subbie.lbp_expiry);
  if (lbpDays !== null && lbpDays <= 30) {
    expiries.push(lbpDays < 0 ? `• LBP EXPIRED ${Math.abs(lbpDays)} days ago` : `• LBP expires in ${lbpDays} days`);
  }
  const ssDays = daysUntil(subbie.site_safe_expiry);
  if (ssDays !== null && ssDays <= 30) {
    expiries.push(ssDays < 0 ? `• Site Safe EXPIRED ${Math.abs(ssDays)} days ago` : `• Site Safe expires in ${ssDays} days`);
  }
  const insDays = daysUntil(subbie.insurance_expiry);
  if (insDays !== null && insDays <= 30) {
    expiries.push(insDays < 0 ? `• Insurance EXPIRED ${Math.abs(insDays)} days ago` : `• Insurance expires in ${insDays} days`);
  }

  parts.push(...(expiries.length ? expiries : [`• ${reason}`]));
  parts.push("");
  parts.push("Please send updated docs back this week so we can keep you on site. Cheers.");
  parts.push("");
  parts.push("— WAIHANGA Subbie Watchdog");
  return parts.join("\n");
}

async function sendViaTNZ(toPhone: string, body: string): Promise<{ ok: boolean; ref?: string; error?: string }> {
  const base = Deno.env.get("TNZ_API_BASE");
  const token = Deno.env.get("TNZ_AUTH_TOKEN");
  const from = Deno.env.get("TNZ_FROM_NUMBER");
  if (!base || !token || !from) return { ok: false, error: "TNZ not configured" };

  try {
    const resp = await fetch(`${base}/send/sms`, {
      method: "POST",
      headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ Reference: `chase-${Date.now()}`, Destination: toPhone, MessageText: body, Sender: from }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return { ok: false, error: `TNZ ${resp.status}: ${JSON.stringify(data).slice(0, 200)}` };
    return { ok: true, ref: data.MessageID || data.Reference || `tnz-${Date.now()}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: ChaseRequest = await req.json();
    if (!body.subbie_id) {
      return new Response(JSON.stringify({ error: "subbie_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Resolve user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user } } = await sb.auth.getUser(authHeader.slice(7));
      userId = user?.id ?? null;
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: "auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load subbie
    const { data: subbie, error: subErr } = await sb
      .from("subcontractor_compliance")
      .select("*")
      .eq("id", body.subbie_id)
      .eq("user_id", userId)
      .single();
    if (subErr || !subbie) throw new Error("subbie not found");

    if (!subbie.contact_phone) throw new Error("subbie has no phone number on file");

    const message = body.custom_message || buildMessage(subbie, body.reason || "Compliance check");

    // Send
    const sendResult = await sendViaTNZ(subbie.contact_phone, message);

    // Log to chase_log
    await sb.from("chase_log").insert({
      tenant_id: subbie.tenant_id,
      user_id: userId,
      subbie_id: subbie.id,
      channel: "sms",
      reason: body.reason || null,
      message_body: message,
      status: sendResult.ok ? "sent" : "failed",
      provider_ref: sendResult.ref || sendResult.error,
    });

    return new Response(JSON.stringify({
      success: sendResult.ok,
      sent_to: subbie.contact_phone,
      message,
      provider_ref: sendResult.ref,
      error: sendResult.error,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("subbie-chase error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
