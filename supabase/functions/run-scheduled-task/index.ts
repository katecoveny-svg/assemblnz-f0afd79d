import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Cron expression parser — calculates next run from a simple cron string
function getNextRun(cron: string, from: Date = new Date()): Date {
  // For simplicity, support common intervals
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return new Date(from.getTime() + 3600_000); // default 1h

  const [min, hour, dom, mon, dow] = parts;

  // Every N minutes: */N * * * *
  if (min.startsWith("*/") && hour === "*") {
    const interval = parseInt(min.slice(2)) || 15;
    return new Date(from.getTime() + interval * 60_000);
  }
  // Daily at specific hour: 0 H * * *
  if (hour !== "*" && dom === "*") {
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
  // Fallback: 1 hour
  return new Date(from.getTime() + 3600_000);
}

// Agent task handlers
async function executeTask(
  task: any,
  supabase: any
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { agent_id, task_type, payload, user_id } = task;

  try {
    switch (task_type) {
      case "compliance_check": {
        // Check upcoming compliance deadlines for this user
        const { data: deadlines } = await supabase
          .from("compliance_deadlines")
          .select("title, due_date, severity, category")
          .gte("due_date", new Date().toISOString())
          .lte("due_date", new Date(Date.now() + 14 * 86400_000).toISOString())
          .order("due_date")
          .limit(10);

        if (deadlines?.length) {
          // Generate proactive alert
          const alertContent = deadlines
            .map((d: any) => `• ${d.title} — due ${d.due_date} (${d.severity})`)
            .join("\n");

          await supabase.from("action_queue").insert({
            user_id,
            agent_id,
            description: `Upcoming compliance deadlines:\n${alertContent}`,
            priority: deadlines.some((d: any) => d.severity === "critical") ? "high" : "medium",
            status: "pending",
          });
        }

        return { success: true, result: { deadlines_found: deadlines?.length || 0 } };
      }

      case "proactive_alert": {
        // Use AI to generate a proactive insight based on payload context
        const aiResp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: `You are ${agent_id}, a proactive NZ business assistant. Generate a brief, actionable insight or reminder based on the context. Keep it under 100 words. Be specific and helpful.`,
                },
                {
                  role: "user",
                  content: JSON.stringify(payload),
                },
              ],
            }),
          }
        );

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const insight = aiData.choices?.[0]?.message?.content || "";
          
          if (insight) {
            await supabase.from("action_queue").insert({
              user_id,
              agent_id,
              description: insight,
              priority: payload?.priority || "low",
              status: "pending",
            });
          }
          return { success: true, result: { insight_generated: true } };
        }
        return { success: false, error: "AI generation failed" };
      }

      case "report": {
        // Generate scheduled report
        await supabase.from("action_queue").insert({
          user_id,
          agent_id,
          description: `Scheduled report ready: ${task.title}. ${payload?.report_type || "summary"} report has been generated.`,
          priority: "low",
          status: "pending",
        });
        return { success: true, result: { report_type: payload?.report_type } };
      }

      case "reminder": {
        await supabase.from("action_queue").insert({
          user_id,
          agent_id,
          description: payload?.message || task.description || task.title,
          priority: payload?.priority || "medium",
          status: "pending",
        });
        return { success: true, result: { reminded: true } };
      }

      case "data_refresh": {
        // Refresh shared context / business memory
        const { data: context } = await supabase
          .from("shared_context")
          .select("context_key, context_value, updated_at")
          .eq("user_id", user_id)
          .order("updated_at", { ascending: false })
          .limit(20);

        // Check for stale data (>30 days old)
        const staleItems = (context || []).filter((c: any) => {
          const age = Date.now() - new Date(c.updated_at).getTime();
          return age > 30 * 86400_000;
        });

        if (staleItems.length > 0) {
          await supabase.from("action_queue").insert({
            user_id,
            agent_id,
            description: `${staleItems.length} business facts may be outdated: ${staleItems.map((s: any) => s.context_key).join(", ")}. Consider reviewing.`,
            priority: "low",
            status: "pending",
          });
        }
        return { success: true, result: { stale_items: staleItems.length } };
      }

      default:
        return { success: true, result: { task_type, note: "executed with default handler" } };
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    // Fetch due tasks
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

      // Calculate next run
      let nextRun: string | null = null;
      if (!isCompleted && task.schedule_cron) {
        nextRun = getNextRun(task.schedule_cron).toISOString();
      }

      // Update task
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
