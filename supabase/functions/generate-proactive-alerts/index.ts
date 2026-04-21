import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get user_id from request body or process all users if called by cron
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body.user_id || null;
    } catch { /* cron call with no body */ }

    // If specific user, check auth
    if (targetUserId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        targetUserId = user.id;
      }
    }

    const alerts: any[] = [];
    const now = new Date();

    // 1. Check compliance deadlines — alert at 14 days (standard) and 7 days (critical)
    const { data: deadlines } = await supabase
      .from("compliance_deadlines")
      .select("*")
      .gte("due_date", now.toISOString().split("T")[0]);

    if (deadlines) {
      for (const deadline of deadlines) {
        const dueDate = new Date(deadline.due_date);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        const alertThreshold = deadline.severity === "critical" ? 30 : 14;
        
        if (daysUntil <= alertThreshold && daysUntil >= 0) {
          alerts.push({
            type: "compliance_deadline",
            title: deadline.title,
            message: daysUntil === 0 
              ? ` ${deadline.title} is due TODAY!` 
              : `${deadline.title} is due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}. ${deadline.description || ""}`,
            relevant_agent: deadline.agents?.[0] || "ledger",
            action_text: "Prepare now",
            severity: daysUntil <= 3 ? "critical" : daysUntil <= 7 ? "high" : "standard",
            due_date: deadline.due_date,
            category: deadline.category,
          });
        }
      }
    }

    // 2. Check legislation changes (recent ones)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAhead = new Date();
    sixtyDaysAhead.setDate(sixtyDaysAhead.getDate() + 60);

    const { data: legChanges } = await supabase
      .from("legislation_changes")
      .select("*")
      .or(`effective_date.gte.${thirtyDaysAgo.toISOString().split("T")[0]},effective_date.is.null`);

    if (legChanges) {
      for (const change of legChanges) {
        const effectiveDate = change.effective_date ? new Date(change.effective_date) : null;
        const isUpcoming = effectiveDate && effectiveDate > now;
        const isRecent = effectiveDate && effectiveDate <= now && effectiveDate >= thirtyDaysAgo;

        if (isUpcoming || isRecent || !effectiveDate) {
          alerts.push({
            type: "legislation_change",
            title: change.title,
            message: isUpcoming 
              ? `New law taking effect ${effectiveDate!.toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}. ${change.action_required || change.summary}`
              : isRecent
                ? `Now in effect: ${change.summary}`
                : `Proposed: ${change.summary}`,
            relevant_agent: change.affected_agents?.[0] || "anchor",
            action_text: "Review changes",
            severity: change.severity || "standard",
            effective_date: change.effective_date,
          });
        }
      }
    }

    // 3. If specific user, check their message usage
    if (targetUserId) {
      const today = now.toISOString().split("T")[0];
      const { data: dailyMsg } = await supabase
        .from("daily_messages")
        .select("message_count")
        .eq("user_id", targetUserId)
        .eq("message_date", today)
        .maybeSingle();

      if (dailyMsg && dailyMsg.message_count >= 80) {
        alerts.push({
          type: "usage_warning",
          title: "Message limit approaching",
          message: `You've used ${dailyMsg.message_count} messages today. Consider upgrading for more capacity.`,
          relevant_agent: "echo",
          action_text: "View plans",
          severity: dailyMsg.message_count >= 95 ? "critical" : "high",
        });
      }

      // 4. Check for overdue user compliance tasks
      const { data: overdueTasks } = await supabase
        .from("user_compliance_tasks")
        .select("*, compliance_deadlines(*)")
        .eq("user_id", targetUserId)
        .eq("status", "upcoming")
        .lt("due_date", today);

      if (overdueTasks && overdueTasks.length > 0) {
        for (const task of overdueTasks) {
          alerts.push({
            type: "overdue_task",
            title: `Overdue: ${(task as any).compliance_deadlines?.title || "Compliance task"}`,
            message: `This task was due on ${new Date(task.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "long" })}. Take action now.`,
            relevant_agent: (task as any).compliance_deadlines?.agents?.[0] || "ledger",
            action_text: "Complete now",
            severity: "critical",
          });
        }
      }
    }

    // Sort by severity
    const severityOrder: Record<string, number> = { critical: 0, high: 1, standard: 2, informational: 3 };
    alerts.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

    // ═══ PERSIST to proactive_alerts so the UI ribbon can render them ═══
    let persistedCount = 0;
    let persistError: string | null = null;
    if (targetUserId && alerts.length > 0) {
      const sevMap: Record<string, string> = {
        critical: "critical",
        high: "high",
        standard: "medium",
        informational: "low",
      };
      const rows = alerts.slice(0, 20).map((a) => ({
        user_id: targetUserId!,
        source_agent: a.relevant_agent || "system",
        target_agent: a.relevant_agent || "system",
        alert_type: a.type || "general",
        title: a.title,
        message: a.message,
        severity: sevMap[a.severity] || "medium",
        is_read: false,
        is_dismissed: false,
        metadata: { action_text: a.action_text, due_date: a.due_date, effective_date: a.effective_date, category: a.category } as any,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      const { error: insErr, count } = await supabase
        .from("proactive_alerts")
        .insert(rows, { count: "exact" });
      if (insErr) {
        persistError = insErr.message;
        console.error("[generate-proactive-alerts] insert failed:", insErr.message);
      } else {
        persistedCount = count ?? rows.length;
      }
    }

    return new Response(
      JSON.stringify({
        alerts,
        persisted: persistedCount,
        persist_error: persistError,
        generated_at: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
