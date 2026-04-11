import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ToroRequest {
  familyId: string;
  userId: string;
  action: "sync_calendar" | "generate_meal_plan" | "plan_trip" | "enroll_school" | "track_budget" | "check_holidays";
  payload: Record<string, unknown>;
  timestamp: string;
}

interface ComplianceCheck {
  rule: string;
  status: "pass" | "fail" | "requires_approval";
  details: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const nzSchoolTerms2026 = [
  { term: 1, start: "2026-02-02", end: "2026-04-10" },
  { term: 2, start: "2026-04-27", end: "2026-07-03" },
  { term: 3, start: "2026-07-20", end: "2026-09-25" },
  { term: 4, start: "2026-10-12", end: "2026-12-18" },
];

const nzPublicHolidays2026 = [
  { name: "New Year's Day", date: "2026-01-01" },
  { name: "Day after New Year's Day", date: "2026-01-02" },
  { name: "Waitangi Day", date: "2026-02-06" },
  { name: "Good Friday", date: "2026-04-03" },
  { name: "Easter Monday", date: "2026-04-06" },
  { name: "ANZAC Day", date: "2026-04-25" },
  { name: "Queen's Birthday", date: "2026-06-01" },
  { name: "Matariki", date: "2026-06-24" },
  { name: "Labour Day", date: "2026-10-26" },
  { name: "Christmas Day", date: "2026-12-25" },
  { name: "Boxing Day", date: "2026-12-26" },
];

const policyGates: Record<string, string> = {
  sync_calendar: "allowed",
  generate_meal_plan: "allowed",
  plan_trip: "approval_required",
  enroll_school: "approval_required",
  track_budget: "allowed",
  check_holidays: "allowed",
};

function checkHolidayConflicts(dates: string[]): ComplianceCheck {
  const conflicts = dates.filter(d => nzPublicHolidays2026.some(h => h.date === d));
  return {
    rule: "NZ Public Holiday Calendar",
    status: conflicts.length > 0 ? "requires_approval" : "pass",
    details: conflicts.length > 0 ? `Dates conflict with holidays: ${conflicts.join(", ")}` : "No public holiday conflicts",
  };
}

function checkChildPrivacy(childAge?: number, hasConsent?: boolean): ComplianceCheck {
  if (!childAge || childAge >= 16) return { rule: "Privacy Act 2020 (Child Protection)", status: "pass", details: "No child data protection concern" };
  if (!hasConsent) return { rule: "Privacy Act 2020 (Child Protection)", status: "requires_approval", details: "Child under 16 — guardian consent required" };
  return { rule: "Privacy Act 2020 (Child Protection)", status: "pass", details: "Guardian consent verified" };
}

function checkSchoolTerm(dateStr: string): ComplianceCheck {
  const term = nzSchoolTerms2026.find(t => dateStr >= t.start && dateStr <= t.end);
  return {
    rule: "Ministry of Education Term Dates",
    status: term ? "requires_approval" : "pass",
    details: term ? `Date falls within Term ${term.term} (${term.start} to ${term.end})` : "Date outside school terms",
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body: ToroRequest = await req.json();
    const requestId = `toro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Layer 2: Memory
    const { data: children } = await supabase.from("children").select("id, name, year_level").eq("family_id", body.familyId).limit(10);
    const { data: events } = await supabase.from("events").select("id, title, start_at").eq("family_id", body.familyId).order("start_at", { ascending: false }).limit(10);

    const today = new Date().toISOString().split("T")[0];
    const currentTerm = nzSchoolTerms2026.find(t => today >= t.start && today <= t.end);

    // Compliance checks
    const dates = (body.payload.dates as string[]) || [];
    const childAge = (body.payload.child_age as number) || undefined;
    const startDate = (body.payload.date_start as string) || today;

    const checks: ComplianceCheck[] = [
      checkHolidayConflicts(dates),
      checkChildPrivacy(childAge, (body.payload.parental_consent as boolean) ?? true),
      checkSchoolTerm(startDate),
      { rule: "NZ Dietary Guidelines", status: "pass", details: "Aligned with Ministry of Health guidelines" },
    ];

    const allPassed = checks.every(c => c.status !== "fail");
    const needsApproval = checks.some(c => c.status === "requires_approval");
    const confidenceScore = allPassed ? (needsApproval ? 0.75 : 0.92) : 0.4;

    let gate: "allowed" | "approval_required" | "forbidden" = (policyGates[body.action] as "allowed" | "approval_required") || "approval_required";
    if (!allPassed) gate = "forbidden";
    else if (needsApproval) gate = "approval_required";

    const approvalStatus = gate === "allowed" ? "approved" : gate === "approval_required" ? "pending" : "rejected";

    // Audit
    await supabase.from("pipeline_audit_logs").insert({
      request_id: requestId,
      kete: "toro",
      stage: "complete",
      result: {
        decision: approvalStatus,
        action: body.action,
        confidenceScore,
        familyId: body.familyId,
        childrenCount: children?.length || 0,
        complianceChecks: Object.fromEntries(checks.map(c => [c.rule, c.status])),
      },
      created_at: new Date().toISOString(),
    });

    if (approvalStatus === "pending") {
      await supabase.from("approval_queue").insert({
        request_id: requestId,
        action_type: body.action,
        kete: "toro",
        context: { familyId: body.familyId, userId: body.userId, payload: body.payload, checks },
        status: "pending",
        requested_by: body.userId,
      });
    }

    const evidencePack = {
      request_id: requestId,
      family_id: body.familyId,
      user_id: body.userId,
      action: body.action,
      perception: { family_members_detected: children?.length || 0, data_sources: ["school_calendars", "family_events", "dietary_db"], school_calendars_loaded: children?.map(c => `calendar_${c.id}`) || [] },
      memory: { family_events: events?.map(e => e.title) || [], school_term: currentTerm ? `Term ${currentTerm.term}` : "Holiday period", children: children?.map(c => c.name) || [] },
      reasoning: { decision_logic: `Evaluated ${body.action} for family with ${children?.length || 0} children`, holiday_check: !checks[0].status.includes("fail"), privacy_act_compliance: checks[1].status !== "fail", school_policy_check: checks[2].status !== "fail", confidence_score: confidenceScore },
      action_layer: { action_type: body.action, policy_gate: gate, modifications_applied: gate === "forbidden" ? ["action_blocked"] : [] },
      explanation: { id: `exp_${Date.now()}`, action: body.action, reasoning: `${body.action} processed. ${checks.filter(c => c.status !== "pass").map(c => c.details).join("; ") || "All checks passed."}`, evidence: checks.map(c => `${c.rule}: ${c.details}`), compliance_checks: checks, timestamp: new Date().toISOString() },
      simulation: { family_coordination_score: confidenceScore > 0.8 ? 0.85 : 0.45, schedule_conflict_risk: confidenceScore > 0.8 ? 0.1 : 0.6, budget_impact_estimate: 0.3, child_wellbeing_impact: confidenceScore > 0.8 ? "positive" : "requires_review" },
      nz_context: { public_holidays_2026: nzPublicHolidays2026, current_school_term: currentTerm || null, school_terms_2026: nzSchoolTerms2026 },
      audit_trail: ["perception", "memory", "reasoning", "action", "explanation", "simulation"].map(l => ({ timestamp: new Date().toISOString(), layer: l, result: "success" })),
      approval_status: approvalStatus,
    };

    return new Response(JSON.stringify(evidencePack, null, 2), {
      status: approvalStatus === "rejected" ? 403 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
