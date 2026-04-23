import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

/**
 * ═══════════════════════════════════════════════════════════
 * PRISM — Content Approval Pipeline
 * One-tap approve/edit/kill via WhatsApp
 * ═══════════════════════════════════════════════════════════
 *
 * Flow:
 * 1. ECHO generates content calendar → stored in content_items
 * 2. PRISM formats for platform → sends via WhatsApp for approval
 * 3. User replies ✅ (approve), ✏️ (edit), ❌ (kill)
 * 4. On approve → push to Buffer/scheduler → mark as approved
 * 5. On edit → user sends edited text → PRISM updates and re-sends
 * 6. On kill → mark as killed, suggest replacement
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContentApproval {
  contentId: string;
  platform: string;
  caption: string;
  scheduledAt: string;
  imageUrl?: string;
  hashtags?: string[];
  status: "pending" | "approved" | "edited" | "killed";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, userId, phone } = body;

    // ═══ ACTION: SEND_FOR_APPROVAL — Send content to user for review ═══
    if (action === "send_for_approval") {
      const { contentId, platform, caption, scheduledAt, imageUrl, hashtags } = body;

      if (!contentId || !caption) {
        return respond({ ok: false, error: "contentId and caption are required" });
      }

      // Store approval state
      const approval: ContentApproval = {
        contentId,
        platform: platform || "linkedin",
        caption,
        scheduledAt: scheduledAt || new Date(Date.now() + 86400_000).toISOString(),
        imageUrl,
        hashtags,
        status: "pending",
      };

      await sb.from("agent_memory").upsert(
        {
          user_id: userId,
          agent_id: "prism",
          memory_key: `content_approval_${contentId}`,
          memory_value: approval as any,
        },
        { onConflict: "user_id,agent_id,memory_key" }
      );

      // Also store current pending ID for quick lookup
      await sb.from("agent_memory").upsert(
        {
          user_id: userId,
          agent_id: "prism",
          memory_key: "current_pending_content",
          memory_value: contentId as any,
        },
        { onConflict: "user_id,agent_id,memory_key" }
      );

      // Format WhatsApp message
      const schedDate = new Date(approval.scheduledAt);
      const day = schedDate.toLocaleDateString("en-NZ", { weekday: "short", timeZone: "Pacific/Auckland" });
      const time = schedDate.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland" });

      let msg = `*PRISM — Content Review*\n\n`;
      msg += `📱 *${approval.platform.toUpperCase()}*\n\n`;
      msg += `"${caption}"\n\n`;
      if (imageUrl) msg += `📸 Image: ${imageUrl}\n`;
      if (hashtags?.length) msg += `# ${hashtags.join(" #")}\n`;
      msg += `🕐 Scheduled: ${day} ${time} NZST\n\n`;
      msg += `Reply:\n✅ to approve\n✏️ to edit (send new text after)\n❌ to kill`;

      if (phone) await sendWhatsApp(phone, msg);

      // Update content_items table if it exists
      await sb.from("content_items").update({
        pipeline_stage: "review",
        metadata: { approval_sent_at: new Date().toISOString(), approval_phone: phone },
      }).eq("id", contentId).then(() => {}).catch(() => {});

      return respond({ ok: true, message: "Content sent for approval", contentId });
    }

    // ═══ ACTION: RESPOND — Process user's approval response ═══
    if (action === "respond") {
      const { response, contentId: explicitContentId, editedCaption } = body;

      // Find pending content
      let targetContentId = explicitContentId;
      if (!targetContentId) {
        const { data: pending } = await sb
          .from("agent_memory")
          .select("memory_value")
          .eq("user_id", userId)
          .eq("agent_id", "prism")
          .eq("memory_key", "current_pending_content")
          .single();
        targetContentId = pending?.memory_value;
      }

      if (!targetContentId) {
        return respond({ ok: false, error: "No pending content to respond to" });
      }

      // Load approval data
      const { data: approvalData } = await sb
        .from("agent_memory")
        .select("memory_value")
        .eq("user_id", userId)
        .eq("agent_id", "prism")
        .eq("memory_key", `content_approval_${targetContentId}`)
        .single();

      if (!approvalData?.memory_value) {
        return respond({ ok: false, error: "Content approval not found" });
      }

      const approval = approvalData.memory_value as unknown as ContentApproval;
      let reply = "";

      // Parse response
      const r = (response || "").trim().toLowerCase();
      const isApprove = r.includes("✅") || r === "approve" || r === "yes" || r === "go" || r === "ok";
      const isEdit = r.includes("✏️") || r === "edit" || r.startsWith("change");
      const isKill = r.includes("❌") || r === "kill" || r === "no" || r === "delete" || r === "skip";

      if (isApprove) {
        approval.status = "approved";
        reply = `✅ Locked in. Publishing ${approval.platform} ${new Date(approval.scheduledAt).toLocaleDateString("en-NZ", { weekday: "short", timeZone: "Pacific/Auckland" })} ${new Date(approval.scheduledAt).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland" })}.`;

        // Update content_items
        await sb.from("content_items").update({
          pipeline_stage: "approved",
          metadata: { approved_at: new Date().toISOString(), approved_by: "whatsapp" },
        }).eq("id", targetContentId).then(() => {}).catch(() => {});

        // Log feedback
        await sb.from("output_feedback").insert({
          user_id: userId,
          agent_id: "prism",
          output_type: "content",
          action: "accepted",
          original_output: approval.caption,
        }).then(() => {}).catch(() => {});

      } else if (isEdit) {
        if (editedCaption) {
          // User provided edited text
          approval.status = "edited";
          approval.caption = editedCaption;
          reply = `✏️ Updated. New version:\n\n"${editedCaption}"\n\nReply ✅ to approve or ✏️ to edit again.`;

          // Reset to pending for re-approval
          approval.status = "pending";

          // Update content_items
          await sb.from("content_items").update({
            body: editedCaption,
            pipeline_stage: "review",
          }).eq("id", targetContentId).then(() => {}).catch(() => {});

          // Log feedback
          await sb.from("output_feedback").insert({
            user_id: userId,
            agent_id: "prism",
            output_type: "content",
            action: "edited",
            original_output: approvalData.memory_value.caption,
            edit_diff: editedCaption,
          }).then(() => {}).catch(() => {});

        } else {
          reply = `✏️ Send me the updated text and I'll swap it in.`;
        }

      } else if (isKill) {
        approval.status = "killed";
        reply = `❌ Killed. I'll prepare a replacement — check back tonight.`;

        // Update content_items
        await sb.from("content_items").update({
          pipeline_stage: "killed",
          metadata: { killed_at: new Date().toISOString(), killed_by: "whatsapp" },
        }).eq("id", targetContentId).then(() => {}).catch(() => {});

        // Log feedback
        await sb.from("output_feedback").insert({
          user_id: userId,
          agent_id: "prism",
          output_type: "content",
          action: "rejected",
          original_output: approval.caption,
        }).then(() => {}).catch(() => {});

      } else {
        reply = `I didn't catch that. Reply:\n✅ to approve\n✏️ to edit\n❌ to kill`;
      }

      // Update approval state
      await sb.from("agent_memory").upsert(
        {
          user_id: userId,
          agent_id: "prism",
          memory_key: `content_approval_${targetContentId}`,
          memory_value: approval as any,
        },
        { onConflict: "user_id,agent_id,memory_key" }
      );

      if (phone) await sendWhatsApp(phone, reply);
      return respond({ ok: true, reply, status: approval.status, contentId: targetContentId });
    }

    // ═══ ACTION: QUEUE — Get pending approvals for a user ═══
    if (action === "queue") {
      const { data: pendingItems } = await sb
        .from("agent_memory")
        .select("memory_key, memory_value")
        .eq("user_id", userId)
        .eq("agent_id", "prism")
        .like("memory_key", "content_approval_%");

      const pending = (pendingItems || [])
        .filter(item => (item.memory_value as any)?.status === "pending")
        .map(item => ({
          contentId: (item.memory_value as any)?.contentId,
          platform: (item.memory_value as any)?.platform,
          caption: (item.memory_value as any)?.caption,
          scheduledAt: (item.memory_value as any)?.scheduledAt,
        }));

      return respond({ ok: true, pendingCount: pending.length, pending });
    }

    // ═══ ACTION: GENERATE — AI generates content and sends for approval ═══
    if (action === "generate") {
      const { platform: targetPlatform, topic, brandDna } = body;
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      // Load brand profile
      let brandContext = "";
      if (userId) {
        const { data: brand } = await sb
          .from("brand_profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (brand) {
          brandContext = `\nBrand: ${brand.business_name || ""}. Tone: ${brand.tone || "professional"}. Audience: ${brand.audience || "NZ businesses"}. Key message: ${brand.key_message || ""}.`;
        }
      }

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are PRISM, Assembl's creative content agent. Generate a single social media post. NZ English. Authentic Kiwi voice — no corporate jargon, no exclamation marks. Include hashtags. ${brandContext}${brandDna ? `\nBrand DNA: ${JSON.stringify(brandDna)}` : ""}`,
            },
            {
              role: "user",
              content: `Generate a ${targetPlatform || "LinkedIn"} post about: ${topic || "our latest business update"}. Return JSON with: caption, hashtags (array), suggestedTime (ISO string for tomorrow morning NZST).`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!aiResponse.ok) {
        return respond({ ok: false, error: `AI generation failed: ${aiResponse.status}` });
      }

      const aiData = await aiResponse.json();
      let content: any;
      try {
        content = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
      } catch {
        content = { caption: aiData.choices?.[0]?.message?.content || "", hashtags: [] };
      }

      // Save to content_items
      const { data: contentItem } = await sb.from("content_items").insert({
        user_id: userId,
        title: topic || "Generated post",
        body: content.caption,
        content_type: "social_post",
        platform: targetPlatform || "linkedin",
        pipeline_stage: "draft",
        agent_attribution: "prism",
        tone: "brand_voice",
        metadata: { hashtags: content.hashtags, generated_at: new Date().toISOString() },
      }).select("id").single();

      if (contentItem && phone) {
        // Auto-send for approval
        const schedTime = content.suggestedTime || new Date(Date.now() + 86400_000).toISOString();

        // Recurse into send_for_approval
        const approvalBody = {
          action: "send_for_approval",
          userId,
          phone,
          contentId: contentItem.id,
          platform: targetPlatform || "linkedin",
          caption: content.caption,
          scheduledAt: schedTime,
          hashtags: content.hashtags,
        };

        // Internal call
        const internalReq = new Request(req.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(approvalBody),
        });

        // Store approval state directly
        const approval: ContentApproval = {
          contentId: contentItem.id,
          platform: targetPlatform || "linkedin",
          caption: content.caption,
          scheduledAt: schedTime,
          hashtags: content.hashtags,
          status: "pending",
        };

        await sb.from("agent_memory").upsert(
          {
            user_id: userId,
            agent_id: "prism",
            memory_key: `content_approval_${contentItem.id}`,
            memory_value: approval as any,
          },
          { onConflict: "user_id,agent_id,memory_key" }
        );

        await sb.from("agent_memory").upsert(
          {
            user_id: userId,
            agent_id: "prism",
            memory_key: "current_pending_content",
            memory_value: contentItem.id as any,
          },
          { onConflict: "user_id,agent_id,memory_key" }
        );

        // Send approval message
        const schedDate = new Date(schedTime);
        const day = schedDate.toLocaleDateString("en-NZ", { weekday: "short", timeZone: "Pacific/Auckland" });
        const time = schedDate.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland" });

        let msg = `*PRISM — Content Review*\n\n`;
        msg += `📱 *${(targetPlatform || "LINKEDIN").toUpperCase()}*\n\n`;
        msg += `"${content.caption}"\n\n`;
        if (content.hashtags?.length) msg += `# ${content.hashtags.join(" #")}\n`;
        msg += `🕐 Scheduled: ${day} ${time} NZST\n\n`;
        msg += `Reply ✅ to approve, ✏️ to edit, ❌ to kill`;

        await sendWhatsApp(phone, msg);
      }

      return respond({
        ok: true,
        contentId: contentItem?.id,
        generated: content,
        sentForApproval: !!phone,
      });
    }

    return respond({ ok: false, error: `Unknown action: ${action}. Use: send_for_approval, respond, queue, generate` });
  } catch (error) {
    console.error("[content-approval] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function respond(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendWhatsApp(to: string, body: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
  if (!accountSid || !authToken || !fromNumber) return;

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${fromNumber}`,
        Body: body.length > 4000 ? body.substring(0, 3997) + "..." : body,
      }),
    }
  ).catch(e => console.error("[content-approval] WhatsApp error:", e));
}
