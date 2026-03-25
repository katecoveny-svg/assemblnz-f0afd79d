import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Alert {
  type: string;
  title: string;
  message: string;
  agent: string;
  action: string;
  severity: string;
}

async function createAlert(supabase: any, userId: string, alert: Alert) {
  await supabase.from("action_queue").insert({
    user_id: userId,
    agent_id: alert.agent,
    description: `${alert.title} — ${alert.message}`,
    priority: alert.severity === "critical" ? "urgent" : alert.severity === "high" ? "high" : "medium",
    status: "pending",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all users with compliance tasks
    const { data: users } = await supabase
      .from("user_compliance_tasks")
      .select("user_id")
      .in("status", ["upcoming", "in_progress"]);

    const uniqueUserIds = [...new Set((users || []).map((u: any) => u.user_id))];

    let alertsCreated = 0;

    for (const userId of uniqueUserIds) {
      // Check upcoming compliance deadlines
      const { data: tasks } = await supabase
        .from("user_compliance_tasks")
        .select("*, compliance_deadlines(*)")
        .eq("user_id", userId)
        .in("status", ["upcoming", "in_progress"]);

      for (const task of tasks || []) {
        const deadline = task.compliance_deadlines;
        if (!deadline) continue;

        const daysUntilDue = Math.ceil(
          (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Critical deadlines within 7 days
        if (daysUntilDue <= 7 && daysUntilDue >= 0 && deadline.severity === "critical") {
          await createAlert(supabase, userId, {
            type: "compliance_urgent",
            title: ` ${deadline.title} — ${daysUntilDue} days`,
            message: deadline.description || "Urgent compliance deadline approaching",
            agent: deadline.agents?.[0] || "ledger",
            action: deadline.auto_generate_document
              ? "Want me to prepare this now?"
              : `Review before ${task.due_date}`,
            severity: "critical",
          });
          alertsCreated++;
        } else if (daysUntilDue <= 14 && daysUntilDue > 7) {
          await createAlert(supabase, userId, {
            type: "compliance_upcoming",
            title: `${deadline.title} — ${daysUntilDue} days`,
            message: deadline.description || "Compliance deadline approaching",
            agent: deadline.agents?.[0] || "ledger",
            action: "Get ahead of this",
            severity: deadline.severity || "standard",
          });
          alertsCreated++;
        }

        // Mark overdue
        if (daysUntilDue < 0 && task.status !== "overdue") {
          await supabase
            .from("user_compliance_tasks")
            .update({ status: "overdue" })
            .eq("id", task.id);
        }
      }

      // Check for legislation changes in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: newLaws } = await supabase
        .from("legislation_changes")
        .select("*")
        .gte("created_at", sevenDaysAgo);

      for (const law of newLaws || []) {
        await createAlert(supabase, userId, {
          type: "legislation_change",
          title: ` ${law.title}`,
          message: law.summary,
          agent: law.affected_agents?.[0] || "anchor",
          action: law.action_required || "Review the changes",
          severity: law.severity || "standard",
        });
        alertsCreated++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, alertsCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
