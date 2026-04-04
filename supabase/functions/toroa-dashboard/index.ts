import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");

    if (!phone) {
      return new Response(errorPage("No phone number provided"), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Fetch family
    const { data: family } = await sb
      .from("toroa_families")
      .select("*")
      .eq("primary_phone", phone)
      .single();

    if (!family) {
      return new Response(errorPage("Family not found"), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Parallel fetches
    const [convRes, calRes, childRes, budgetRes, mealRes] = await Promise.all([
      sb.from("toroa_conversations").select("*").eq("family_id", family.id).order("created_at", { ascending: false }).limit(20),
      sb.from("toroa_calendar_events").select("*").eq("family_id", family.id).order("date", { ascending: true }).limit(10),
      sb.from("toroa_children").select("*").eq("family_id", family.id),
      sb.from("toroa_budgets").select("*").eq("family_id", family.id).order("month", { ascending: false }).limit(1),
      sb.from("toroa_meal_plans").select("*").eq("family_id", family.id).order("week_start", { ascending: false }).limit(1),
    ]);

    const conversations = convRes.data || [];
    const events = calRes.data || [];
    const children = childRes.data || [];
    const budget = budgetRes.data?.[0];
    const mealPlan = mealRes.data?.[0];

    const usedPct = family.monthly_sms_limit
      ? Math.min(100, Math.round(((family.sms_used_this_month || 0) / family.monthly_sms_limit) * 100))
      : 0;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tōroa — Family Dashboard</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a1a;color:#e0e0e0;padding:16px;max-width:600px;margin:0 auto}
    h1{font-size:1.5rem;color:#f5c842;margin-bottom:4px}
    h2{font-size:1.1rem;color:#5de0c2;margin:20px 0 8px;border-bottom:1px solid #222;padding-bottom:4px}
    .card{background:#141428;border-radius:12px;padding:14px;margin-bottom:12px;border:1px solid #222}
    .badge{display:inline-block;background:#5de0c2;color:#0a0a1a;padding:2px 8px;border-radius:999px;font-size:0.75rem;font-weight:600}
    .meter{height:8px;background:#222;border-radius:4px;overflow:hidden;margin:8px 0}
    .meter-fill{height:100%;background:linear-gradient(90deg,#5de0c2,#f5c842);border-radius:4px}
    .msg{padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:0.9rem}
    .msg-in{color:#aaa}.msg-out{color:#5de0c2}
    .intent{font-size:0.7rem;color:#f5c842;text-transform:uppercase}
    .event{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a1a2e;font-size:0.9rem}
    .child{display:inline-block;background:#1a1a2e;padding:4px 10px;border-radius:8px;margin:4px;font-size:0.85rem}
    .stat{display:flex;justify-content:space-between;padding:4px 0;font-size:0.9rem}
    .subtle{color:#666;font-size:0.8rem}
    a{color:#5de0c2}
  </style>
</head>
<body>
  <h1>🪶 Tōroa</h1>
  <p class="subtle">${escapeHtml(family.name || "Whānau")} · ${escapeHtml(phone)}</p>

  <div class="card" style="margin-top:12px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span>Plan: <span class="badge">${escapeHtml(family.plan || "starter")}</span></span>
      <span class="subtle">${family.status || "trial"}</span>
    </div>
    <div class="meter"><div class="meter-fill" style="width:${usedPct}%"></div></div>
    <div class="subtle">${family.sms_used_this_month || 0} / ${family.monthly_sms_limit || 100} SMS used this month</div>
    ${family.status === "trial" ? `<div class="subtle" style="margin-top:4px">Trial: ${family.messages_remaining ?? 0} messages remaining</div>` : ""}
  </div>

  ${children.length > 0 ? `
  <h2>👨‍👩‍👧‍👦 Tamariki</h2>
  <div class="card">
    ${children.map((c: any) => `<span class="child">${escapeHtml(c.name)}${c.school ? ` · ${escapeHtml(c.school)}` : ""}${c.year_level ? ` · Y${c.year_level}` : ""}</span>`).join("")}
  </div>` : ""}

  ${events.length > 0 ? `
  <h2>📅 Upcoming</h2>
  <div class="card">
    ${events.map((e: any) => `<div class="event"><span>${escapeHtml(e.title)}</span><span class="subtle">${e.date}${e.time ? " " + e.time : ""}</span></div>`).join("")}
  </div>` : ""}

  ${budget ? `
  <h2>💰 Budget</h2>
  <div class="card">
    <div class="stat"><span>Income</span><span>$${Number(budget.total_income || 0).toFixed(2)}</span></div>
    <div class="stat"><span>Expenses</span><span>$${Number(budget.total_expenses || 0).toFixed(2)}</span></div>
    <div class="stat" style="font-weight:600;color:#5de0c2"><span>Balance</span><span>$${(Number(budget.total_income || 0) - Number(budget.total_expenses || 0)).toFixed(2)}</span></div>
  </div>` : ""}

  ${mealPlan ? `
  <h2>🍽️ Meal Plan</h2>
  <div class="card">
    <div class="stat"><span>Week of</span><span>${mealPlan.week_start}</span></div>
    <div class="stat"><span>Est. cost</span><span>$${Number(mealPlan.estimated_cost || 0).toFixed(2)}</span></div>
  </div>` : ""}

  <h2>💬 Recent Conversations</h2>
  <div class="card">
    ${conversations.length === 0 ? '<p class="subtle">No conversations yet. Text Tōroa to get started!</p>' :
      conversations.slice(0, 10).map((c: any) => `
        <div class="msg">
          <span class="intent">${escapeHtml(c.intent || "general")}</span>
          <div class="msg-in">→ ${escapeHtml((c.message || "").substring(0, 80))}${(c.message || "").length > 80 ? "…" : ""}</div>
          ${c.response ? `<div class="msg-out">← ${escapeHtml(c.response.substring(0, 120))}${c.response.length > 120 ? "…" : ""}</div>` : ""}
        </div>`).join("")}
  </div>

  <p class="subtle" style="text-align:center;margin-top:20px">Tōroa by Assembl · <a href="https://assembl.co.nz/toroa">assembl.co.nz/toroa</a></p>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("toroa-dashboard error:", error);
    return new Response(errorPage("Something went wrong"), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

function errorPage(msg: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tōroa</title>
<style>body{font-family:sans-serif;background:#0a0a1a;color:#e0e0e0;display:flex;align-items:center;justify-content:center;height:100vh}
.error{text-align:center}.error h1{color:#f5c842;font-size:1.3rem}</style></head>
<body><div class="error"><h1>🪶 Tōroa</h1><p>⚠️ ${msg}</p></div></body></html>`;
}
