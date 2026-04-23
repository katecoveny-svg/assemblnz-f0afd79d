import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { resolveModel } from "../_shared/model-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// ─── SMS/WhatsApp notification helper ──────────────────
async function sendNotification(
  supabase: any, userId: string, agentId: string, kete: string,
  message: string, overrideChannel?: string, overridePhone?: string
): Promise<{ sent: boolean; channel?: string; error?: string }> {
  try {
    let finalPhone = overridePhone;
    let finalChannel = overrideChannel || "sms";

    if (!finalPhone) {
      const { data: profile } = await supabase
        .from("profiles").select("phone, notify_channel, notify_enabled")
        .eq("id", userId).single();
      if (!profile?.notify_enabled || !profile?.phone) {
        return { sent: false, error: "Notifications not enabled or no phone" };
      }
      finalPhone = profile.phone;
      finalChannel = profile.notify_channel || "sms";
    }

    const maxLen = finalChannel === "sms" ? 380 : 1500;
    const truncated = message.length > maxLen ? message.substring(0, maxLen - 3) + "..." : message;
    const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
    if (!tnzToken) return { sent: false, error: "TNZ_AUTH_TOKEN not configured" };

    const endpoint = finalChannel === "whatsapp" ? "whatsapp" : "sms";
    const ref = `assembl-${kete}-${agentId}-${crypto.randomUUID().slice(0, 8)}`;

    const tnzResp = await fetch(`${tnzBase}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tnzToken}` },
      body: JSON.stringify({
        MessageData: {
          Message: truncated,
          Destinations: [{ Recipient: finalPhone }],
          WebhookCallbackURL: `${SUPABASE_URL}/functions/v1/tnz-webhook`,
          WebhookCallbackFormat: "JSON",
          Reference: ref,
          ...(endpoint === "sms" ? { SendMode: "Normal" } : {}),
        },
      }),
    });

    const tnzData = await tnzResp.json();
    const success = tnzData.Result === "Success";

    try {
      await supabase.from("audit_log").insert({
        agent_code: agentId, agent_name: agentId.toUpperCase(),
        model_used: "scheduled-task", user_id: userId,
        request_summary: `[PROACTIVE ${endpoint.toUpperCase()} → ${finalPhone}]`,
        response_summary: truncated.substring(0, 200),
        compliance_passed: true, data_classification: "INTERNAL",
      });
    } catch (_) {}

    console.log(`[notify] ${endpoint} → ${finalPhone} (${agentId}): ${success ? "OK" : "FAIL"}`);
    return { sent: success, channel: endpoint };
  } catch (err) {
    console.error("[notify] Error:", err);
    return { sent: false, error: err instanceof Error ? err.message : "Unknown" };
  }
}

// Helper: insert action_queue + send SMS/WhatsApp notification in parallel
async function notifyAndQueue(
  supabase: any, userId: string, agentId: string, kete: string,
  description: string, priority: string, payload?: any
) {
  const [qR, nR] = await Promise.allSettled([
    supabase.from("action_queue").insert({
      user_id: userId, agent_id: agentId, description, priority, status: "pending",
    }),
    sendNotification(supabase, userId, agentId, kete, description,
      payload?.notify_channel, payload?.notify_phone),
  ]);
  return {
    queued: qR.status === "fulfilled",
    notified: nR.status === "fulfilled" ? (nR as any).value?.sent : false,
  };
}


// ─── Cron parser ───────────────────────────────────────
function getNextRun(cron: string, from: Date = new Date()): Date {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return new Date(from.getTime() + 3600_000);

  const [min, hour, dom, mon, dow] = parts;

  // Every N minutes: */N * * * *
  if (min.startsWith("*/") && hour === "*") {
    const interval = parseInt(min.slice(2)) || 15;
    return new Date(from.getTime() + interval * 60_000);
  }
  // Monthly on specific day: 0 H D * *
  if (dom !== "*" && mon === "*" && dow === "*") {
    const next = new Date(from);
    next.setDate(parseInt(dom));
    next.setHours(parseInt(hour === "*" ? "6" : hour), parseInt(min === "*" ? "0" : min), 0, 0);
    if (next <= from) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }
  // Daily at specific hour: 0 H * * *
  if (hour !== "*" && dom === "*" && dow === "*") {
    const next = new Date(from);
    next.setHours(parseInt(hour), parseInt(min === "*" ? "0" : min), 0, 0);
    if (next <= from) next.setDate(next.getDate() + 1);
    return next;
  }
  // Weekly: 0 H * * D
  if (dow !== "*") {
    const next = new Date(from);
    const targetDay = parseInt(dow);
    next.setHours(parseInt(hour === "*" ? "6" : hour), parseInt(min === "*" ? "0" : min), 0, 0);
    let daysAhead = targetDay - next.getDay();
    if (daysAhead <= 0) daysAhead += 7;
    next.setDate(next.getDate() + daysAhead);
    return next;
  }
  return new Date(from.getTime() + 3600_000);
}

// ─── AI helper ─────────────────────────────────────────
async function callAI(systemPrompt: string, userPrompt: string, model = "google/gemini-2.5-flash-lite"): Promise<string | null> {
  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!aiResp.ok) return null;
  const data = await aiResp.json();
  return data.choices?.[0]?.message?.content || null;
}

// ─── Task handlers ─────────────────────────────────────
async function executeTask(
  task: any,
  supabase: any
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { agent_id, task_type, payload, user_id } = task;

  try {
    switch (task_type) {
      // ─── Existing handlers ─────────────────────────
      case "compliance_check": {
        const { data: deadlines } = await supabase
          .from("compliance_deadlines")
          .select("title, due_date, severity, category")
          .gte("due_date", new Date().toISOString())
          .lte("due_date", new Date(Date.now() + 14 * 86400_000).toISOString())
          .order("due_date")
          .limit(10);

        if (deadlines?.length) {
          const alertContent = deadlines
            .map((d: any) => `• ${d.title} — due ${d.due_date} (${d.severity})`)
            .join("\n");

          await notifyAndQueue(supabase, user_id, agent_id, "shared", `Upcoming compliance deadlines:\n${alertContent}`, "medium", payload);
        }
        return { success: true, result: { deadlines_found: deadlines?.length || 0 } };
      }

      case "proactive_alert": {
        const insight = await callAI(
          `You are ${agent_id}, a proactive NZ business assistant. Generate a brief, actionable insight or reminder based on the context. Keep it under 100 words. Be specific and helpful.`,
          JSON.stringify(payload)
        );

        if (insight) {
          await notifyAndQueue(supabase, user_id, agent_id, "shared", insight, "medium", payload);
          return { success: true, result: { insight_generated: true } };
        }
        return { success: false, error: "AI generation failed" };
      }

      case "report": {
        await notifyAndQueue(supabase, user_id, agent_id, "shared", `Scheduled report ready: ${task.title}. ${payload?.report_type || "summary"} report has been generated.`, "low", payload);
        return { success: true, result: { report_type: payload?.report_type } };
      }

      case "reminder": {
        await notifyAndQueue(supabase, user_id, agent_id, "shared", payload?.message || task.description || task.title, "medium", payload);
        return { success: true, result: { reminded: true } };
      }

      case "data_refresh": {
        const { data: context } = await supabase
          .from("shared_context")
          .select("context_key, context_value, updated_at")
          .eq("user_id", user_id)
          .order("updated_at", { ascending: false })
          .limit(20);

        const staleItems = (context || []).filter((c: any) => {
          const age = Date.now() - new Date(c.updated_at).getTime();
          return age > 30 * 86400_000;
        });

        if (staleItems.length > 0) {
          await notifyAndQueue(supabase, user_id, agent_id, "shared", `${staleItems.length} business facts may be outdated: ${staleItems.map((s: any) => s.context_key).join(", ")}. Consider reviewing.`, "low", payload);
        }
        return { success: true, result: { stale_items: staleItems.length } };
      }

      // ═══════════════════════════════════════════════════
      // WAIHANGA (Construction) task handlers
      // ═══════════════════════════════════════════════════

      case "construction_briefing": {
        // ĀRAI weekly site safety briefing
        // Gather site context for all active projects
        const { data: siteContext } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .like("context_key", "project.%")
          .limit(30);

        const siteData = (siteContext || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const briefing = await callAI(
          `You are ĀRAI, the H&S safety agent for NZ construction sites. Generate a Monday morning site safety briefing.
Include:
- Active hazards and controls
- Weather advisory if relevant (assume NZ autumn/winter conditions)
- Scaffold tag expiry reminders
- Upcoming inspections
- PPE reminders
- Any notifiable events under HSWA 2015
Format for WhatsApp delivery: use emojis (⚠️ 🌧️ ✅ 🔒 🏗️), keep under 1000 chars.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          `Active project data:\n${siteData || "No active project data — generate generic NZ construction safety brief."}`,
          "google/gemini-2.5-flash"
        );

        if (briefing) {
          await notifyAndQueue(supabase, user_id, "arai", "waihanga", briefing, "medium", payload);
        }

        return { success: true, result: { briefing_generated: !!briefing } };
      }

      case "progress_claim": {
        // KAUPAPA monthly progress claim — CCA 2002
        const { data: retentions } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.project.retentions.%,context_key.like.project.consent_ref,context_key.like.project.address")
          .limit(20);

        const projectData = (retentions || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const claimSummary = await callAI(
          `You are KAUPAPA, the NZ construction project management agent.
Generate a progress claim reminder for the 20th of the month under the Construction Contracts Act 2002.

Include:
- Payment schedule deadline (payment due within 20 working days of claim under s22 CCA)
- Retention status — remind that retentions must be held on trust since 2023 amendment
- If scheduled amounts are in context, calculate claim value
- Flag if any payment schedule responses are overdue
- Note: if no pay schedule response within 20 working days, claimed amount becomes due (s23 CCA)

Keep under 500 chars. Be direct and actionable.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          projectData || "No project retention data available — generate generic CCA 2002 progress claim reminder.",
          "google/gemini-2.5-flash"
        );

        if (claimSummary) {
          await notifyAndQueue(supabase, user_id, "kaupapa", "waihanga", claimSummary, "high", payload);
        }

        return { success: true, result: { claim_generated: !!claimSummary } };
      }

      case "ccc_alert": {
        // WHAKAAĒ — Code Compliance Certificate countdown
        const { data: consentData } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.project.consent_ref,context_key.like.project.inspection_stage,context_key.like.project.address")
          .limit(10);

        const consentInfo = (consentData || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const alert = await callAI(
          `You are WHAKAAĒ, the NZ building consents agent.
Generate a CCC (Code Compliance Certificate) application deadline alert.

Include the documentation checklist:
- Producer statements (PS1 design, PS2 manufacturer, PS3 construction review, PS4 construction)
- All inspection records from council
- As-built drawings (plumbing, drainage, structural)
- Energy work certificate (if applicable)
- Record of work from all LBPs involved

Note: CCC must be applied for within 2 years of code compliance per Building Act 2004 s93.
Keep under 500 chars. Format as a checklist.`,
          consentInfo || "No consent data available — generate generic CCC checklist reminder.",
          "google/gemini-2.5-flash"
        );

        if (alert) {
          await notifyAndQueue(supabase, user_id, "whakaae", "waihanga", alert, "high", payload);
        }

        return { success: true, result: { ccc_alert_generated: !!alert } };
      }

      // ═══════════════════════════════════════════════════
      // AUAHA (Creative & Marketing) task handlers
      // ═══════════════════════════════════════════════════

      case "content_calendar": {
        // ECHO — Sunday evening weekly content calendar generation
        const { data: brandContext } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .like("context_key", "brand.%")
          .limit(30);

        const brandData = (brandContext || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        // Get NZ calendar context
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday

        const calendar = await callAI(
          `You are ECHO, the content strategist for an NZ creative platform.
Generate a weekly content calendar for Mon–Fri based on the brand's performance data and voice.

Include for each day:
- Platform (LinkedIn, Instagram, Facebook — pick best fit)
- Format (carousel, reel, static post, story, article)
- Topic/angle (specific, not generic)
- Suggested time (NZST)

Consider:
- NZ public holidays, Matariki, ANZAC Day, school terms
- Brand's best performing formats and posting times from context
- Avoid content types that have previously underperformed
- NZ audience behaviour: Tuesday–Thursday typically strongest for B2B

Keep total under 1000 chars. Use emojis for quick scanning.
Week of: ${weekStart.toLocaleDateString("en-NZ")} – ${weekEnd.toLocaleDateString("en-NZ")}`,
          brandData || "No brand data available — generate generic NZ small business content calendar.",
          "google/gemini-2.5-flash"
        );

        if (calendar) {
          await notifyAndQueue(supabase, user_id, "echo", "auaha", calendar, "medium", payload);
        }

        return { success: true, result: { calendar_generated: !!calendar } };
      }

      case "daily_post": {
        // PRISM — Daily social post generation for one-tap approval
        const { data: brandDna } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.brand.dna.%,context_key.like.brand.approved_phrases,context_key.like.brand.forbidden_words,context_key.like.brand.top_content.%,context_key.like.brand.style.%")
          .limit(20);

        const dnaData = (brandDna || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const dayOfWeek = new Date().toLocaleDateString("en-NZ", { weekday: "long" });

        const post = await callAI(
          `You are PRISM, the creative studio agent for an NZ marketing platform.
Generate today's social media post ready for one-tap approval.

Include:
- Platform recommendation (based on day and brand data)
- Caption/copy (match the brand's voice exactly — formality level, humour style, forbidden words)
- 3-5 relevant hashtags (mix of NZ-specific and industry)
- Suggested posting time (NZST)
- Brief image/visual description for the creative team

Rules:
- Match the brand's voice formality level from context
- Never use words from the forbidden list
- Prefer formats that have historically performed well
- Include NZ-specific references where natural (place names, seasonal context)
- If behind-the-scenes or authenticity formats perform best, lean into those

Format for WhatsApp delivery. Keep under 800 chars.
Today: ${dayOfWeek}, ${new Date().toLocaleDateString("en-NZ")}`,
          dnaData || "No brand DNA available — generate a generic NZ business post with professional tone.",
          "google/gemini-2.5-flash"
        );

        if (post) {
          await notifyAndQueue(supabase, user_id, "prism", "auaha", post, "medium", payload);
        }

        return { success: true, result: { post_generated: !!post } };
      }

      case "performance_review": {
        // ECHO — Monday morning content performance analysis
        const { data: performanceData } = await supabase
          .from("shared_context")
          .select("context_key, context_value, updated_at")
          .eq("user_id", user_id)
          .or("context_key.like.brand.top_content.%,context_key.like.brand.failed_content.%,context_key.like.brand.last_engagement_rate,context_key.like.brand.audience.%")
          .limit(20);

        const perfData = (performanceData || [])
          .map((r: any) => `${r.context_key}: ${r.context_value} (updated: ${r.updated_at})`)
          .join("\n");

        const review = await callAI(
          `You are ECHO, the content strategist for an NZ creative platform.
Generate a Monday morning content performance review for last week.

Include:
- What content performed best and WHY (be specific, not generic)
- What underperformed and what to adjust
- Audience engagement trends
- Recommendations for this week's strategy adjustments
- Any NZ-specific timing insights (e.g., "Friday afternoon posts dropped — likely long weekend")

Be direct and actionable. This is for a busy NZ business owner.
Keep under 600 chars. Format for WhatsApp.`,
          perfData || "No performance data available yet — generate a starter performance framework and suggest what metrics to begin tracking.",
          "google/gemini-2.5-flash"
        );

        if (review) {
          await notifyAndQueue(supabase, user_id, "echo", "auaha", review, "low", payload);
        }

        return { success: true, result: { review_generated: !!review } };
      }

      // ═══════════════════════════════════════════════════
      // AHUWHENUA (Agriculture) task handlers
      // ═══════════════════════════════════════════════════

      case "seasonal_compliance_sweep": {
        // TERRA — Start-of-season compliance sweep
        const { data: farmContext } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .like("context_key", "farm.%")
          .limit(40);

        const farmData = (farmContext || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const sweep = await callAI(
          `You are TERRA, the NZ agriculture specialist agent.
Generate a seasonal compliance sweep report for a NZ farm.

Check and report status of:
- NAIT compliance: location registered, movements recorded within 48hrs, annual web declaration done
- FEP (Farm Environment Plan): audit date, risk grade, regional council specific requirements
- Water consent expiry dates — flag any expiring within 6 months
- Effluent system compliance — storage capacity, discharge limits
- ETS obligations — emissions reporting, forestry carbon credits
- Stock exclusion compliance (NES-Freshwater 2020)
- H&S: quad bike training, chemical handling certs, visitor register

Flag anything overdue as ⚠️ OVERDUE.
Current date: ${new Date().toLocaleDateString("en-NZ")}
Format as a one-page status report. Keep under 1200 chars.`,
          farmData || "No farm data available — generate a generic NZ farm compliance checklist.",
          "google/gemini-2.5-flash"
        );

        if (sweep) {
          await notifyAndQueue(supabase, user_id, "terra", "toro-ahuwhenua", sweep, "high", payload);
        }

        return { success: true, result: { sweep_generated: !!sweep } };
      }

      case "weather_ops_advisory": {
        // TERRA — Weather-to-operations mapping
        const { data: farmCtx } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.farm.type,context_key.like.farm.region,context_key.like.farm.stock_units,context_key.like.farm.effluent_%")
          .limit(10);

        const farmInfo = (farmCtx || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const advisory = await callAI(
          `You are TERRA, the NZ agriculture specialist. Generate a weather-operations advisory for a NZ farm.
Based on the farm type and region, provide practical advice:

Map weather conditions to farming operations:
- Heavy rain (>25mm): stock off hills, delay effluent spreading, check flood-prone paddocks
- Frost: delay milking (teat damage), check water troughs, brassica break-feeding
- Strong wind (>60km/h): delay spraying, secure shelters
- Drought: reduce stocking rate, supplementary feed plan, MPI adverse events contact
- Snow: lamb survival protocols, supplementary feeding

Also include:
- Pasture growth estimates for the season
- Soil moisture status impact on operations
- Feed budget implications

Format for WhatsApp/SMS delivery. Use emojis. Keep under 800 chars.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          farmInfo || "No farm data — generate generic NZ autumn/winter farming advisory.",
          "google/gemini-2.5-flash"
        );

        if (advisory) {
          await notifyAndQueue(supabase, user_id, "terra", "toro-ahuwhenua", advisory, "medium", payload);
        }

        return { success: true, result: { advisory_generated: !!advisory } };
      }

      case "nait_reminder": {
        // TERRA — NAIT compliance check
        const { data: naitData } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.farm.nait_%,context_key.like.farm.stock_units,context_key.like.farm.type")
          .limit(10);

        const naitInfo = (naitData || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const reminder = await callAI(
          `You are TERRA, the NZ agriculture specialist.
Generate a NAIT compliance reminder.

Check:
- Annual web declaration due (must be completed each year)
- Movement recordings within 48 hours of any animal movement
- Tag ordering — sufficient tags for upcoming calving/fawning season
- Saleyard/processor movements recorded

Penalties: Up to $5,000 per infringement, $100,000 court fine.
Be direct and helpful. Keep under 500 chars.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          naitInfo || "No NAIT data — generate generic NAIT compliance reminder for NZ farmer.",
          "google/gemini-2.5-flash-lite"
        );

        if (reminder) {
          await notifyAndQueue(supabase, user_id, "terra", "toro-ahuwhenua", reminder, "medium", payload);
        }

        return { success: true, result: { reminder_generated: !!reminder } };
      }

      case "wellbeing_checkin": {
        // TERRA — Farmstrong-aligned rural wellbeing check-in
        const { data: farmType } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.farm.type,context_key.like.farm.region,context_key.like.farm.calendar.%")
          .limit(5);

        const context = (farmType || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        // Determine season stress level
        const month = new Date().getMonth(); // 0-indexed
        const highStressMonths = [6, 7, 8, 9]; // Jul-Oct: calving/lambing
        const isHighStress = highStressMonths.includes(month);

        const checkin = await callAI(
          `You are TERRA, providing a Farmstrong-aligned wellbeing check-in for a NZ farmer.
${isHighStress ? "This is a HIGH STRESS season (calving/lambing period)." : ""}

Write a brief, non-intrusive wellbeing message:
- Acknowledge the season and workload
- One practical tip (sleep, breaks, asking for help)
- Mention Farmstrong.co.nz, 1737, or Rural Support Trust naturally
- Use warm, Kiwi tone — like a mate checking in, not a counsellor
- Never be patronising

Keep under 400 chars. Format for SMS/WhatsApp.`,
          context || "Generic NZ farmer",
          "google/gemini-2.5-flash-lite"
        );

        if (checkin) {
          await notifyAndQueue(supabase, user_id, "terra", "toro-ahuwhenua", checkin, "low", payload);
        }

        return { success: true, result: { checkin_generated: !!checkin } };
      }

      case "milk_price_update": {
        // TERRA — Fonterra milk price tracking
        const { data: dairyCtx } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.farm.milk_production_%,context_key.like.farm.processor,context_key.like.farm.supplier_number")
          .limit(5);

        const dairyInfo = (dairyCtx || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const update = await callAI(
          `You are TERRA, the NZ agriculture specialist.
Generate a milk price season update for a NZ dairy farmer.

Include:
- Current Fonterra forecast farmgate milk price range (use latest publicly available data)
- Advance rate payment schedule status
- If production data available, estimate payout: kgMS × farmgate price
- Note any dividend forecast changes
- Compare to previous season if data available

Keep under 600 chars. Be factual and specific. Use $/kgMS format.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          dairyInfo || "No dairy data — generate generic Fonterra season update.",
          "google/gemini-2.5-flash"
        );

        if (update) {
          await notifyAndQueue(supabase, user_id, "terra", "toro-ahuwhenua", update, "medium", payload);
        }

        return { success: true, result: { update_generated: !!update } };
      }

      case "schedule_price_alert": {
        // TERRA — Meat schedule price monitoring
        const { data: meatCtx } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.farm.schedule.%,context_key.like.farm.type,context_key.like.farm.stock_units")
          .limit(10);

        const meatInfo = (meatCtx || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const alert = await callAI(
          `You are TERRA, the NZ agriculture specialist.
Generate a meat schedule price update for a NZ farmer.

Include:
- Current schedule price movements for relevant species (lamb, beef, mutton, venison)
- Major processor schedules (Silver Fern Farms, Alliance, ANZCO)
- Timing advice: if schedule is rising, consider holding; if falling, lock in contracts
- Grade premiums worth noting

Keep under 600 chars. Be actionable. Use $/kg carcass weight format.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          meatInfo || "No livestock data — generate generic NZ meat schedule overview.",
          "google/gemini-2.5-flash"
        );

        if (alert) {
          await notifyAndQueue(supabase, user_id, "terra", "toro-ahuwhenua", alert, "medium", payload);
        }

        return { success: true, result: { alert_generated: !!alert } };
      }

      // ═══════════════════════════════════════════════════
      // MANAAKI — Hospitality & Tourism cron handlers
      // ═══════════════════════════════════════════════════

      case "daily_fcp_checks": {
        // Daily 6am: AURA sends opening check prompt via WhatsApp
        const alert = await callAI(
          `You are AURA, the assembl hospitality operations specialist.
Generate a morning opening check prompt for a NZ café/restaurant.

Include these checks in order:
1. Chiller temperatures (must be ≤5°C per Food Act 2014)
2. Freezer temperatures (must be ≤-15°C)
3. Hot-hold units if applicable (must be ≥65°C)
4. Handwash station — soap, paper towels, warm water
5. Food dating — check use-by dates on prep items
6. Cleaning schedule — overnight tasks completed?

Format as a brief WhatsApp-friendly checklist.
Keep under 500 chars. Use ✅ and 📝 emojis.
Current date: ${new Date().toLocaleDateString("en-NZ")}
Day: ${new Date().toLocaleDateString("en-NZ", { weekday: "long" })}`,
          "Generate daily opening FCP check prompt",
          "google/gemini-2.5-flash-lite"
        );

        if (alert && user_id) {
          await notifyAndQueue(supabase, user_id, "aura", "manaaki", alert, "high", payload);
        }

        return { success: true, result: { alert_generated: !!alert } };
      }

      case "verification_prep": {
        // 4 weeks before MPI verification: generate preparation pack checklist
        if (!user_id) return { success: true, result: { note: "No user_id for verification prep" } };

        const { data: hospCtx } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.hospitality.%")
          .limit(20);

        const hospInfo = (hospCtx || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const pack = await callAI(
          `You are AURA, the assembl hospitality specialist.
Generate a verifier preparation checklist for an upcoming MPI Food Act 2014 verification visit.

Business context:
${hospInfo || "No specific context — generate a generic NZ café preparation pack"}

Include:
1. 12-month temperature records — are they complete?
2. Staff food safety training register — all current?
3. Corrective action register — all resolved?
4. Supplier records and traceability documentation
5. Cleaning schedules — 12 months of records
6. Food Control Plan — current version, last reviewed?
7. Allergen declarations — up to date for current menu?
8. Calibration records for thermometers
9. Pest control records

Flag any gaps. Keep under 800 chars. Be specific and actionable.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          hospInfo || "Generate generic verification prep pack",
          "google/gemini-2.5-flash"
        );

        if (pack) {
          await notifyAndQueue(supabase, user_id, "aura", "manaaki", `📋 VERIFICATION PREP PACK\n${pack}`, "high", payload);
        }

        return { success: true, result: { pack_generated: !!pack } };
      }

      case "liquor_licence_renewal": {
        // 3 months before expiry: alert + checklist
        if (!user_id) return { success: true, result: { note: "No user_id" } };

        const { data: licenceCtx } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.hospitality.liquor%,context_key.like.hospitality.manager%")
          .limit(5);

        const licenceInfo = (licenceCtx || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const renewal = await callAI(
          `You are CELLAR, the assembl alcohol licensing specialist.
Generate a liquor licence renewal preparation alert for a NZ hospitality business.

Known licence details:
${licenceInfo || "No licence data — generate generic renewal checklist"}

Include:
1. Renewal application form requirements (SSAA 2012)
2. Manager certificate status — is it current? Expires before licence?
3. Host responsibility training — all bar staff current?
4. Building compliance — has anything changed?
5. Objection risk assessment
6. Timeline: file at least 20 working days before expiry

Keep under 500 chars. Be specific.`,
          licenceInfo || "Generate generic liquor licence renewal alert",
          "google/gemini-2.5-flash-lite"
        );

        if (renewal) {
          await notifyAndQueue(supabase, user_id, "cellar", "manaaki", `🍷 LICENCE RENEWAL ALERT\n${renewal}`, "high", payload);
        }

        return { success: true, result: { renewal_generated: !!renewal } };
      }

      case "weekend_prep_brief": {
        // Friday 4pm: weekend service preparation brief
        if (!user_id) return { success: true, result: { note: "No user_id" } };

        const { data: opsCtx } = await supabase
          .from("shared_context")
          .select("context_key, context_value")
          .eq("user_id", user_id)
          .or("context_key.like.hospitality.%,context_key.like.company.team_size")
          .limit(15);

        const opsInfo = (opsCtx || [])
          .map((r: any) => `${r.context_key}: ${r.context_value}`)
          .join("\n");

        const brief = await callAI(
          `You are AURA, the assembl hospitality operations specialist.
Generate a weekend preparation brief for a NZ café/restaurant.

Business context:
${opsInfo || "No specific context — generate generic weekend prep brief"}

Include:
1. Public holiday check — is this weekend a public holiday? If so, note staff pay rates (time and a half + day in lieu under Holidays Act 2003)
2. Expected covers based on patterns
3. Any allergen menu updates needed
4. Stock check reminders for high-volume items
5. Weekend roster confirmation
6. Any unresolved corrective actions that need attention before service

Keep under 500 chars. Practical and actionable.
Current date: ${new Date().toLocaleDateString("en-NZ")}`,
          opsInfo || "Generate generic weekend prep brief",
          "google/gemini-2.5-flash-lite"
        );

        if (brief) {
          await notifyAndQueue(supabase, user_id, "aura", "manaaki", `🍽️ WEEKEND BRIEF\n${brief}`, "medium", payload);
        }

        return { success: true, result: { brief_generated: !!brief } };
      }

      // ═══════════════════════════════════════════════════
      // LEARNING LOOPS — Self-improving architecture
      // ═══════════════════════════════════════════════════

      case "compliance_autoupdate": {
        // Loop 1: Daily compliance scanner — check NZ government sources for changes
        // In production this would scrape legislation.govt.nz, IRD, WorkSafe, MPI, etc.
        // For now, use AI to generate awareness of recent changes

        const sources = [
          { name: "IRD", domain: "Tax, GST, PAYE, KiwiSaver", agents: ["ledger", "pulse"] },
          { name: "WorkSafe NZ", domain: "H&S, HSWA 2015, notifiable events", agents: ["arai", "vitals"] },
          { name: "MPI", domain: "Food safety, biosecurity, agriculture", agents: ["saffron", "terra", "gateway"] },
          { name: "MBIE", domain: "Employment, building, consumer, immigration", agents: ["aroha", "kaupapa", "whakaae", "compass", "counter"] },
          { name: "NZ Legislation", domain: "Acts, amendments, regulations", agents: [] },
          { name: "NZTA/Waka Kotahi", domain: "Transport, vehicle compliance, RUCs", agents: ["motor", "transit"] },
          { name: "Privacy Commissioner", domain: "Privacy Act 2020, IPP amendments", agents: ["shield"] },
          { name: "DIA", domain: "Charities, incorporated societies, anti-money laundering", agents: ["anchor"] },
          { name: "Fonterra/DairyNZ", domain: "Milk price, dairy compliance", agents: ["terra"] },
          { name: "Regional Councils", domain: "Resource management, freshwater, FEPs", agents: ["terra", "reef"] },
        ];

        const scanResult = await callAI(
          `You are the assembl Compliance Auto-Updater. Your job is to identify recent or upcoming NZ regulatory changes.

For each source below, identify the MOST IMPORTANT recent change (last 30 days) or upcoming change (next 60 days).
Only include REAL, verifiable changes — not speculation.

Sources to scan:
${sources.map(s => `- ${s.name}: ${s.domain}`).join("\n")}

Return a JSON array of changes found:
[{
  "source_name": "IRD",
  "title": "Brief title of change",
  "change_summary": "One sentence explaining what changed and impact",
  "impact_level": "low | medium | high",
  "affected_agents": ["ledger", "pulse"],
  "legislation_ref": "Tax Administration Act 1994 s33A",
  "effective_date": "2026-04-01"
}]

Rules:
- Only include changes you are confident are real
- Rate impact: HIGH = affects most users immediately, MEDIUM = affects some users or upcoming, LOW = minor/admin
- Return empty array [] if no significant changes
- Current date: ${new Date().toISOString()}`,
          `Scan all ${sources.length} NZ government and industry sources.`,
          "google/gemini-2.5-flash"
        );

        let changesInserted = 0;
        if (scanResult) {
          try {
            const jsonMatch = scanResult.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const changes = JSON.parse(jsonMatch[0]);
              for (const change of changes) {
                const { error: insertErr } = await supabase
                  .from("compliance_updates")
                  .insert({
                    source_name: change.source_name || "Unknown",
                    source_url: change.source_url || null,
                    title: change.title,
                    change_summary: change.change_summary,
                    impact_level: change.impact_level || "low",
                    affected_agents: change.affected_agents || [],
                    legislation_ref: change.legislation_ref || null,
                    effective_date: change.effective_date || null,
                    auto_applied: change.impact_level === "low",
                  });
                if (!insertErr) changesInserted++;
              }
            }
          } catch (parseErr) {
            console.error("[compliance_autoupdate] Parse error:", parseErr);
          }
        }

        return { success: true, result: { changes_detected: changesInserted } };
      }

      case "feedback_analysis": {
        // Loop 3: Weekly user feedback analysis
        // Analyse accept/edit/reject patterns to identify agent improvement opportunities
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

        const { data: feedback } = await supabase
          .from("output_feedback")
          .select("agent_id, output_type, action, edit_diff")
          .gte("created_at", sevenDaysAgo)
          .limit(200);

        if (!feedback?.length) {
          return { success: true, result: { note: "No feedback data this week" } };
        }

        // Aggregate by agent
        const agentStats: Record<string, { accepted: number; edited: number; rejected: number; regenerated: number; edits: string[] }> = {};
        for (const fb of feedback) {
          if (!agentStats[fb.agent_id]) {
            agentStats[fb.agent_id] = { accepted: 0, edited: 0, rejected: 0, regenerated: 0, edits: [] };
          }
          agentStats[fb.agent_id][fb.action as keyof typeof agentStats[string]]++;
          if (fb.action === "edited" && fb.edit_diff) {
            agentStats[fb.agent_id].edits.push(fb.edit_diff);
          }
        }

        // For agents with high edit/reject rates, generate improvement insights
        for (const [agentId, stats] of Object.entries(agentStats)) {
          const total = stats.accepted + stats.edited + stats.rejected + stats.regenerated;
          const editRate = (stats.edited + stats.rejected + stats.regenerated) / total;

          if (editRate > 0.3 && total >= 5) {
            const insight = await callAI(
              `You are the assembl Agent Improvement Analyst.
Agent ${agentId.toUpperCase()} has a ${(editRate * 100).toFixed(0)}% edit/reject rate this week (${total} total outputs).

Accepted: ${stats.accepted}, Edited: ${stats.edited}, Rejected: ${stats.rejected}, Regenerated: ${stats.regenerated}

Common user edits:
${stats.edits.slice(0, 10).map(e => `- ${e}`).join("\n")}

Identify:
1. What pattern explains why users are editing/rejecting outputs?
2. What specific prompt adjustment would reduce the edit rate?
3. Is there a tone, format, or content issue?

Keep under 300 chars. Be specific and actionable.`,
              `Analyse feedback patterns for ${agentId}`,
              "google/gemini-2.5-flash-lite"
            );

            if (insight) {
              await notifyAndQueue(supabase, user_id, "nova", "shared", `📊 Agent improvement insight for ${agentId.toUpperCase()}: ${insight}`, "low", payload);
            }
          }
        }

        return { success: true, result: { agents_analysed: Object.keys(agentStats).length, feedback_count: feedback.length } };
      }

      default:
        return { success: true, result: { task_type, note: "executed with default handler" } };
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    const { data: dueTasks, error: fetchError } = await supabase
      .from("scheduled_tasks")
      .select("*")
      .eq("status", "active")
      .lte("next_run_at", now)
      .order("next_run_at")
      .limit(50);

    if (fetchError) {
      console.error("[scheduler] Fetch error:", fetchError.message);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!dueTasks?.length) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No due tasks" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[scheduler] Processing ${dueTasks.length} due tasks`);

    const results: any[] = [];

    for (const task of dueTasks) {
      const result = await executeTask(task, supabase);
      const newRunCount = task.run_count + 1;
      const isCompleted = task.max_runs && newRunCount >= task.max_runs;

      let nextRun: string | null = null;
      if (!isCompleted && task.schedule_cron) {
        nextRun = getNextRun(task.schedule_cron).toISOString();
      }

      const updatePayload: any = {
        last_run_at: now,
        run_count: newRunCount,
        result: result.result || null,
        error_message: result.error || null,
        status: isCompleted ? "completed" : result.success ? "active" : "failed",
      };

      if (nextRun && !isCompleted) {
        updatePayload.next_run_at = nextRun;
      }

      await supabase
        .from("scheduled_tasks")
        .update(updatePayload)
        .eq("id", task.id);

      results.push({
        task_id: task.id,
        agent: task.agent_id,
        type: task.task_type,
        success: result.success,
        next_run: nextRun,
      });

      console.log(
        `[scheduler] Task ${task.id} (${task.task_type}): ${result.success ? "OK" : "FAIL"}`
      );
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[scheduler] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
