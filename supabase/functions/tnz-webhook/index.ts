import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * TNZ Webhook — single endpoint TNZ posts to for BOTH:
 *   1. Delivery status updates (Type: SMS / WhatsApp, Status: SUCCESS/FAILED/etc.)
 *   2. Inbound replies from customers (Type: SMSReply / WhatsAppReply)
 *
 * Inbound replies are forwarded to `tnz-inbound` for AI agent routing.
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    console.log("TNZ webhook payload:", JSON.stringify(payload));

    const type = (payload.Type || payload.type || "").toString();
    const messageId = payload.MessageID || payload.messageId || payload.message_id;
    const status = payload.Status || payload.status;

    // ── INBOUND REPLY → forward to unified inbound gateway for AI routing ──
    if (type.toLowerCase().includes("reply") || type.toLowerCase() === "inbound") {
      const inboundPayload = {
        From: payload.Destination || payload.destination || "", // customer number
        To: payload.Sender || payload.sender || "",              // our sender id
        Message: payload.Message || payload.message || "",
        MessageID: payload.ReceivedID || payload.MessageID || "",
        Channel: type.toLowerCase().includes("whatsapp") ? "whatsapp" : "sms",
        ReplyTo: payload.MessageID || null,
      };

      console.log("[tnz-webhook] Forwarding inbound reply →", JSON.stringify(inboundPayload));

      try {
        const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-inbound`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify(inboundPayload),
        });
        const result = await resp.text();
        console.log("[tnz-webhook] tnz-inbound response:", resp.status, result);
      } catch (e) {
        console.error("[tnz-webhook] Forward error:", e);
      }

      return new Response(JSON.stringify({ ok: true, forwarded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELIVERY STATUS UPDATE ──
    if (!messageId) {
      console.log("No MessageID in payload — ignoring");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusMap: Record<string, string> = {
      Sent: "sent",
      SUCCESS: "delivered",
      Delivered: "delivered",
      Read: "read",
      Failed: "failed",
      FAILED: "failed",
      Expired: "failed",
      Rejected: "failed",
      Pending: "processing",
    };

    const mappedStatus = statusMap[status] || "sent";

    const { error } = await sb
      .from("messaging_messages")
      .update({ status: mappedStatus })
      .eq("tnz_message_id", messageId);

    if (error) {
      console.error("Failed to update message status:", error);
    } else {
      console.log(`Updated message ${messageId} to status: ${mappedStatus}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TNZ webhook error:", err);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
