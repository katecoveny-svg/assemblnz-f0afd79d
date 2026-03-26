import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cross-agent trigger rules: when source_agent writes context_key, alert target_agent
const TRIGGER_RULES: {
  contextKey: RegExp;
  sourceAgent?: string;
  alerts: { targetAgent: string; alertType: string; titleTemplate: string; messageTemplate: string; severity: string }[];
}[] = [
  {
    contextKey: /constitution|club_registration|entity_created/i,
    sourceAgent: "sports",
    alerts: [
      { targetAgent: "legal", alertType: "legal_review", titleTemplate: "New constitution may need legal review", messageTemplate: "TURF generated a new constitution. ANCHOR should review for legal compliance.", severity: "standard" },
      { targetAgent: "finance", alertType: "tax_registration", titleTemplate: "New entity may need tax registration", messageTemplate: "A new entity was created via TURF. LEDGER should check if IRD registration is needed.", severity: "standard" },
    ],
  },
  {
    contextKey: /property_listed|new_listing/i,
    sourceAgent: "property",
    alerts: [
      { targetAgent: "echo", alertType: "content_needed", titleTemplate: "New listing needs marketing content", messageTemplate: "HAVEN listed a new property. ECHO should draft listing descriptions and social content.", severity: "standard" },
      { targetAgent: "marketing", alertType: "creative_brief", titleTemplate: "New listing needs photography brief", messageTemplate: "A new property listing was added. PRISM should prepare a visual content plan.", severity: "standard" },
    ],
  },
  {
    contextKey: /employee_terminated|staff_offboarding/i,
    sourceAgent: "hr",
    alerts: [
      { targetAgent: "legal", alertType: "employment_check", titleTemplate: "Check employment obligations", messageTemplate: "AROHA processed a staff departure. ANCHOR should verify final pay and notice obligations.", severity: "high" },
      { targetAgent: "it", alertType: "access_revoke", titleTemplate: "Revoke system access", messageTemplate: "An employee departure was processed. SIGNAL should disable accounts and revoke access.", severity: "high" },
    ],
  },
  {
    contextKey: /new_project|project_started/i,
    sourceAgent: "construction",
    alerts: [
      { targetAgent: "hr", alertType: "staffing_check", titleTemplate: "May need additional staff", messageTemplate: "APEX started a new project. AROHA should check if additional hires or contractors are needed.", severity: "standard" },
      { targetAgent: "finance", alertType: "cost_codes", titleTemplate: "Set up project cost codes", messageTemplate: "A new project was started. LEDGER should set up project-specific cost tracking.", severity: "standard" },
      { targetAgent: "it", alertType: "project_infra", titleTemplate: "Set up project tech infrastructure", messageTemplate: "New project initiated. SIGNAL should provision project communication and document sharing.", severity: "standard" },
    ],
  },
  {
    contextKey: /deal_closed|deal_won|new_client/i,
    sourceAgent: "sales",
    alerts: [
      { targetAgent: "finance", alertType: "invoice_needed", titleTemplate: "Prepare invoice for closed deal", messageTemplate: "FLUX closed a deal. LEDGER should prepare the initial invoice.", severity: "high" },
      { targetAgent: "echo", alertType: "announcement", titleTemplate: "Draft deal announcement", messageTemplate: "A deal was closed. ECHO should draft internal and external announcements.", severity: "standard" },
      { targetAgent: "hr", alertType: "hiring_check", titleTemplate: "New client may require additional staff", messageTemplate: "FLUX closed a new client. AROHA should check if you need to hire to service this account.", severity: "standard" },
    ],
  },
  {
    contextKey: /new_project|project_started/i,
    sourceAgent: "construction",
    alerts: [
      { targetAgent: "hr", alertType: "staffing_check", titleTemplate: "May need additional staff", messageTemplate: "APEX started a new project. AROHA should check if additional hires or contractors are needed.", severity: "standard" },
      { targetAgent: "hr", alertType: "site_induction", titleTemplate: "Generate site induction plan", messageTemplate: "A new construction project started. AROHA should generate a site-specific induction plan for new workers.", severity: "high" },
      { targetAgent: "finance", alertType: "cost_codes", titleTemplate: "Set up project cost codes", messageTemplate: "A new project was started. LEDGER should set up project-specific cost tracking.", severity: "standard" },
      { targetAgent: "it", alertType: "project_infra", titleTemplate: "Set up project tech infrastructure", messageTemplate: "New project initiated. SIGNAL should provision project communication and document sharing.", severity: "standard" },
    ],
  },
  {
    contextKey: /revenue_growth|revenue_up|profit_up/i,
    sourceAgent: "finance",
    alerts: [
      { targetAgent: "hr", alertType: "bonus_consideration", titleTemplate: "Consider performance bonuses", messageTemplate: "LEDGER detected revenue growth. AROHA suggests considering performance bonuses to retain your team during this growth period.", severity: "standard" },
    ],
  },
  {
    contextKey: /new_technology|system_deployed|software_rollout/i,
    sourceAgent: "it",
    alerts: [
      { targetAgent: "hr", alertType: "training_plan", titleTemplate: "Staff training needed for new technology", messageTemplate: "SIGNAL deployed new technology. AROHA should generate a training plan for staff adoption.", severity: "standard" },
    ],
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let targetUserId: string | null = null;
    let mode = "scan"; // "scan" for cron, "check" for user-triggered
    try {
      const body = await req.json();
      targetUserId = body.user_id || null;
      mode = body.mode || "scan";
    } catch { /* cron call */ }

    const alertsGenerated: any[] = [];

    // Get recent shared_context entries (last hour for cron, last 24h for user check)
    const lookback = mode === "scan" ? 1 : 24;
    const since = new Date(Date.now() - lookback * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from("shared_context")
      .select("*")
      .gte("updated_at", since)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: recentContext } = await query;

    if (recentContext && recentContext.length > 0) {
      for (const ctx of recentContext) {
        for (const rule of TRIGGER_RULES) {
          // Match context key
          if (!rule.contextKey.test(ctx.context_key)) continue;
          // Optionally match source agent
          if (rule.sourceAgent && ctx.source_agent !== rule.sourceAgent) continue;

          for (const alertDef of rule.alerts) {
            // Check if similar alert already exists (dedup within 24h)
            const { data: existing } = await supabase
              .from("proactive_alerts")
              .select("id")
              .eq("user_id", ctx.user_id)
              .eq("alert_type", alertDef.alertType)
              .eq("source_agent", ctx.source_agent)
              .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
              .limit(1);

            if (existing && existing.length > 0) continue;

            const alert = {
              user_id: ctx.user_id,
              source_agent: ctx.source_agent,
              target_agent: alertDef.targetAgent,
              alert_type: alertDef.alertType,
              title: alertDef.titleTemplate,
              message: alertDef.messageTemplate,
              severity: alertDef.severity,
              metadata: { context_key: ctx.context_key, context_value: ctx.context_value },
            };

            const { error } = await supabase.from("proactive_alerts").insert(alert);
            if (!error) alertsGenerated.push(alert);
          }
        }
      }
    }

    // Also scan for user-specific briefing data if requested
    let briefing = null;
    if (targetUserId && mode === "briefing") {
      const uid = targetUserId;
      const today = new Date().toISOString().split("T")[0];

      const [alertsRes, actionsRes, exportsRes, deadlinesRes, contextsRes] = await Promise.allSettled([
        supabase.from("proactive_alerts").select("*").eq("user_id", uid).eq("is_dismissed", false).order("created_at", { ascending: false }).limit(10),
        supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").limit(10),
        supabase.from("exported_outputs").select("*").eq("user_id", uid).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).limit(10),
        supabase.from("compliance_deadlines").select("*").gte("due_date", today).order("due_date").limit(5),
        supabase.from("shared_context").select("*").eq("user_id", uid).order("updated_at", { ascending: false }).limit(20),
      ]);

      briefing = {
        alerts: alertsRes.status === "fulfilled" ? alertsRes.value.data : [],
        pendingActions: actionsRes.status === "fulfilled" ? actionsRes.value.data : [],
        recentOutputs: exportsRes.status === "fulfilled" ? exportsRes.value.data : [],
        upcomingDeadlines: deadlinesRes.status === "fulfilled" ? deadlinesRes.value.data : [],
        businessContext: contextsRes.status === "fulfilled" ? contextsRes.value.data : [],
      };
    }

    return new Response(JSON.stringify({
      alerts_generated: alertsGenerated.length,
      alerts: alertsGenerated,
      briefing,
      scanned_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
