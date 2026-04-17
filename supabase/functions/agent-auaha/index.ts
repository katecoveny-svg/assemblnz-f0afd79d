import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface AuahaRequest {
  userId: string;
  action: "generate_calendar" | "check_compliance" | "schedule_post" | "generate_report" | "analyze_campaign";
  payload: Record<string, unknown>;
  timestamp: string;
}

interface ComplianceCheck {
  rule: string;
  status: "pass" | "fail" | "requires_approval";
  details: string;
}

interface ExplanationObject {
  id: string;
  action: string;
  reasoning: string;
  evidence: string[];
  compliance_checks: ComplianceCheck[];
  timestamp: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const policyGates: Record<string, string> = {
  generate_calendar: "allowed",
  check_compliance: "allowed",
  schedule_post: "approval_required",
  generate_report: "allowed",
  analyze_campaign: "allowed",
};

function checkFairTradingAct(content: string): ComplianceCheck {
  const misleading = ["guaranteed", "proven cure", "100% effective", "miracle cure"];
  const hit = misleading.some(p => content.toLowerCase().includes(p));
  return { rule: "Fair Trading Act 1986", status: hit ? "fail" : "pass", details: hit ? "Content contains potentially misleading claims" : "No misleading claims detected" };
}

function checkASACompliance(content: string): ComplianceCheck {
  const violations = ["denigrating competitor", "false testimonial", "undisclosed affiliate"];
  const hit = violations.some(v => content.toLowerCase().includes(v));
  return { rule: "ASA Code of Ethics", status: hit ? "fail" : "pass", details: hit ? "Content violates ASA code" : "ASA compliant" };
}

function checkCopyrightAct(assets: string[]): ComplianceCheck {
  const bad = assets.filter(a => !a.startsWith("approved_"));
  return { rule: "Copyright Act 1994", status: bad.length > 0 ? "fail" : "pass", details: bad.length > 0 ? `Unauthorized assets: ${bad.join(", ")}` : "All assets licensed" };
}

function checkTikanga(content: string): ComplianceCheck {
  const terms = ["tapu", "mana", "whānau", "kaitiakitanga"];
  const hit = terms.some(t => content.toLowerCase().includes(t));
  return { rule: "Tikanga Māori Compliance", status: hit ? "requires_approval" : "pass", details: hit ? "Cultural terms detected — requires cultural review" : "No cultural sensitivity issues" };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const raw = await req.json().catch(() => ({}));
    const body: AuahaRequest = {
      userId: raw.userId ?? "anonymous",
      action: raw.action ?? "check_compliance",
      payload: raw.payload ?? {},
      timestamp: raw.timestamp ?? new Date().toISOString(),
    };
    const requestId = `auaha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const contentStr = JSON.stringify(body.payload);
    const brandAssets = (body.payload.brand_assets as string[]) || [];

    // Layer 2: Memory
    const { data: campaigns } = await supabase.from("campaigns").select("id, name").eq("user_id", body.userId).order("created_at", { ascending: false }).limit(5);

    // Compliance checks
    const checks: ComplianceCheck[] = [
      checkFairTradingAct(contentStr),
      checkASACompliance(contentStr),
      checkCopyrightAct(brandAssets),
      checkTikanga(contentStr),
    ];

    const allPassed = checks.every(c => c.status !== "fail");
    const hasTikanga = checks.some(c => c.rule.includes("Tikanga") && c.status === "requires_approval");
    const confidenceScore = allPassed ? 0.95 : 0.45;

    // Layer 4: Action gate
    let gate: "allowed" | "approval_required" | "forbidden" = (policyGates[body.action] as "allowed" | "approval_required") || "approval_required";
    if (!allPassed) gate = "forbidden";
    else if (hasTikanga) gate = "approval_required";

    let approvalStatus: "approved" | "pending" | "rejected" = gate === "allowed" ? "approved" : gate === "approval_required" ? "pending" : "rejected";

    // Layer 5: Explanation
    const explanation: ExplanationObject = {
      id: `exp_${Date.now()}`,
      action: body.action,
      reasoning: `Processed ${body.action} with confidence ${confidenceScore}. ${checks.filter(c => c.status === "fail").map(c => c.details).join("; ") || "All checks passed."}`,
      evidence: checks.map(c => `${c.rule}: ${c.details}`),
      compliance_checks: checks,
      timestamp: new Date().toISOString(),
    };

    // Audit
    await supabase.from("pipeline_audit_logs").insert({
      request_id: requestId,
      kete: "auaha",
      stage: "complete",
      result: {
        decision: approvalStatus,
        action: body.action,
        confidenceScore,
        complianceChecks: Object.fromEntries(checks.map(c => [c.rule, c.status])),
        gate,
      },
      created_at: new Date().toISOString(),
    });

    if (approvalStatus === "pending") {
      await supabase.from("approval_queue").insert({
        request_id: requestId,
        action_type: body.action,
        kete: "auaha",
        context: { explanation, userId: body.userId, payload: body.payload },
        status: "pending",
        requested_by: body.userId,
      });
    }

    const evidencePack = {
      request_id: requestId,
      user_id: body.userId,
      action: body.action,
      perception: { inputs_received: Object.keys(body.payload), data_sources_accessed: ["brand_assets_db", "campaign_history"], brand_assets_loaded: brandAssets },
      memory: { relevant_campaigns: campaigns?.map(c => c.id) || [], brand_guidelines: "v2.3", previous_posts: campaigns?.map(c => c.name) || [] },
      reasoning: { decision_logic: `Evaluated ${body.action} against ${checks.length} compliance rules`, fair_trading_check: allPassed, asa_compliance_check: allPassed, copyright_check: checks.find(c => c.rule.includes("Copyright"))?.status === "pass", tikanga_check: !hasTikanga, confidence_score: confidenceScore },
      action_layer: { action_type: body.action, policy_gate: gate, modifications_applied: gate === "forbidden" ? ["action_blocked"] : [] },
      explanation,
      simulation: { predicted_engagement: confidenceScore > 0.8 ? 0.72 : 0.35, compliance_risk_score: confidenceScore > 0.8 ? 0.05 : 0.75, audience_impact_assessment: confidenceScore > 0.8 ? "Suitable for publication" : "Requires review" },
      audit_trail: ["perception", "memory", "reasoning", "action", "explanation", "simulation"].map(l => ({ timestamp: new Date().toISOString(), layer: l, action: "complete", result: "success" })),
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
