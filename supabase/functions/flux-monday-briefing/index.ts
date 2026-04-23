import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * FLUX Monday Pipeline Briefing
 * Runs Monday 7:15am NZST via cron (or manual invoke).
 * For each user with active pipeline deals:
 * 1. Summarise stale deals, new opportunities, revenue progress
 * 2. Send via WhatsApp (or queue for in-app delivery)
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get all users with leads in pipeline
    const { data: users } = await supabase
      .from("leads")
      .select("user_id")
      .limit(500);

    const uniqueUserIds = [...new Set((users || []).map((u: any) => u.user_id))];
    console.log(`[flux-briefing] Processing ${uniqueUserIds.length} users`);

    let briefingsSent = 0;

    for (const userId of uniqueUserIds) {
      // Fetch all leads for this user
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!leads?.length) continue;

      // Calculate pipeline stats
      const stages = ["new", "contacted", "qualified", "closed"];
      const now = Date.now();
      const avgStageDays = 14; // default benchmark

      const staleDeals = leads.filter((l: any) => {
        if (l.stage === "closed") return false;
        const lastActivity = l.last_activity
          ? new Date(l.last_activity).getTime()
          : new Date(l.created_at).getTime();
        const daysSince = (now - lastActivity) / 86400_000;
        return daysSince > avgStageDays * 1.5;
      });

      const totalPipeline = leads
        .filter((l: any) => l.stage !== "closed")
        .reduce((s: number, l: any) => s + (l.value || 0), 0);

      const closedValue = leads
        .filter((l: any) => l.stage === "closed")
        .reduce((s: number, l: any) => s + (l.value || 0), 0);

      const newLeadsThisWeek = leads.filter((l: any) => {
        const created = new Date(l.created_at).getTime();
        return now - created < 7 * 86400_000;
      });

      // Check recent compliance updates relevant to FLUX (GETS tenders)
      const weekAgo = new Date(now - 7 * 86400_000).toISOString();
      const { data: complianceUpdates } = await supabase
        .from("compliance_updates")
        .select("title, change_summary")
        .contains("affected_agents", ["flux"])
        .gte("created_at", weekAgo)
        .limit(3);

      // Build briefing with AI
      const briefingPrompt = `Generate a concise Monday morning sales pipeline briefing for a NZ business owner. Use NZ English and te reo greetings.

DATA:
- Stale deals (need action): ${JSON.stringify(staleDeals.map((d: any) => ({ name: d.name, company: d.company, value: d.value, stage: d.stage, days_since_activity: Math.floor((now - new Date(d.last_activity || d.created_at).getTime()) / 86400_000) })))}
- New leads this week: ${newLeadsThisWeek.length}
- Pipeline value: $${totalPipeline.toLocaleString()} NZD
- Closed this period: $${closedValue.toLocaleString()} NZD
- Recent GETS/compliance updates: ${JSON.stringify(complianceUpdates || [])}

FORMAT (WhatsApp-friendly, use emojis):
🔴 Stale deals needing immediate action (with days overdue)
🟡 New opportunities or GETS tenders
🟢 Revenue progress summary
Keep under 500 characters. End with "Reply GO to send follow-ups."`;

      const briefingModel = await resolveModel("flux", supabase);

      const aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: briefingModel,
            messages: [
              { role: "system", content: "You are FLUX, an elite NZ sales intelligence engine. Be concise, actionable, NZ-voiced." },
              { role: "user", content: briefingPrompt },
            ],
          }),
        }
      );

      if (!aiResponse.ok) {
        console.error(`[flux-briefing] AI failed for user ${userId}`);
        continue;
      }

      const aiResult = await aiResponse.json();
      const briefingText = aiResult.choices?.[0]?.message?.content || "";

      if (!briefingText) continue;

      // Store briefing in action_queue for in-app delivery
      await supabase.from("action_queue").insert({
        user_id: userId,
        agent_id: "flux",
        description: briefingText,
        priority: "high",
        status: "pending",
        due_date: new Date().toISOString(),
      });

      // Attempt WhatsApp delivery if configured
      const { data: smsConfig } = await supabase
        .from("agent_sms_config")
        .select("*")
        .eq("user_id", userId)
        .eq("agent_id", "flux")
        .eq("enabled", true)
        .single();

      if (smsConfig?.twilio_phone_number) {
        const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
        const twilioFrom = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

        if (twilioSid && twilioAuth && twilioFrom) {
          const whatsappTo = `whatsapp:${smsConfig.twilio_phone_number}`;
          const whatsappFrom = `whatsapp:${twilioFrom}`;

          await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                To: whatsappTo,
                From: whatsappFrom,
                Body: `FLUX — Sales Intelligence\n\n${briefingText}`,
              }),
            }
          );
        }
      }

      briefingsSent++;
    }

    const result = {
      success: true,
      briefings_sent: briefingsSent,
      users_processed: uniqueUserIds.length,
    };

    console.log("[flux-briefing] Complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[flux-briefing] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
