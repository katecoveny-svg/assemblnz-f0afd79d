import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * TNZ Send — manually send SMS or WhatsApp via TNZ API.
 * Used by the admin dashboard for manual takeover replies.
 *
 * FIXED 2026-04-28: previously used v3.00 + Bearer (silently rejected by TNZ).
 * Now uses v2.04 + Basic + the /send/<channel> path that TNZ actually accepts.
 */

/** Normalise an NZ phone number to E.164 (+64...) and strip channel prefixes. */
function normalisePhone(raw: string): string {
  if (!raw) return raw;
  let n = String(raw).trim();
  n = n.replace(/^(whatsapp|sms):/i, "");
  n = n.replace(/[\s\-()]/g, "");
  if (/^64\d+/.test(n)) n = "+" + n;
  if (/^0\d+/.test(n)) n = "+64" + n.substring(1);
  if (/^\d{8,}$/.test(n) && !n.startsWith("+")) n = "+" + n;
  return n;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v2.04";
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
    const tnzFrom = Deno.env.get("TNZ_FROM_NUMBER");

    if (!tnzToken) {
      return new Response(JSON.stringify({ error: "TNZ_AUTH_TOKEN not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { channel, to, message, conversationId } = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'message'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipient = normalisePhone(to);
    const endpoint = channel === "whatsapp" ? "send/whatsapp" : "send/sms";
    const ref = `assembl-manual-${crypto.randomUUID()}`;
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;

    const body: Record<string, unknown> = {
      MessageData: {
        Message: String(message).substring(0, 1600),
        Destinations: [{ Recipient: recipient }],
        WebhookCallbackURL: webhookUrl,
        WebhookCallbackFormat: "JSON",
        Reference: ref,
        ...(channel === "whatsapp" ? {} : { SendMode: "Normal" }),
        ...(tnzFrom ? { FromNumber: tnzFrom } : {}),
      },
    };

    const tnzResp = await fetch(`${tnzBase}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${tnzToken}`,
      },
      body: JSON.stringify(body),
    });

    const respText = await tnzResp.text();
    let tnzData: Record<string, unknown> = {};
    try { tnzData = JSON.parse(respText); } catch { tnzData = { raw: respText }; }

    const ok = tnzResp.ok && (tnzData as { Result?: string }).Result === "Success";

    if (!ok) {
      console.error(`[tnz-send] FAIL status=${tnzResp.status} body=${respText.substring(0, 500)}`);
    } else {
      console.log(`[tnz-send] OK messageId=${(tnzData as { MessageID?: string }).MessageID} to=${recipient}`);
    }

    if (conversationId) {
      const { error: insErr } = await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        tnz_message_id: (tnzData as { MessageID?: string }).MessageID || null,
        direction: "outbound",
        to_number: recipient,
        body: message,
        channel: channel || "sms",
        status: ok ? "sent" : "failed",
        agent_used: "manual",
        tnz_reference: ref,
      });
      if (insErr) console.error("[tnz-send] DB insert error:", insErr);
    }

    return new Response(
      JSON.stringify({
        ok,
        messageId: (tnzData as { MessageID?: string }).MessageID,
        status: tnzResp.status,
        result: (tnzData as { Result?: string }).Result,
        error: ok ? undefined : (respText.substring(0, 300)),
      }),
      {
        status: ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[tnz-send] exception:", err);
    return new Response(JSON.stringify({ error: "Send failed", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
