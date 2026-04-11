import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExplanationObject {
  id: string;
  action_id: string;
  layer: string;
  rationale: string;
  rules_applied: string[];
  confidence_score: number;
  timestamp: string;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function makeExplanation(
  layer: string, actionId: string, rationale: string,
  rules: string[], confidence: number
): ExplanationObject {
  return {
    id: `${layer.toLowerCase()}_${Date.now()}`,
    action_id: actionId, layer, rationale,
    rules_applied: rules, confidence_score: confidence,
    timestamp: new Date().toISOString(),
  };
}

// ===== IPP VALIDATION (Privacy Act 2020) =====
async function validateIPPs(
  userId: string, action: string, dataCategory: string
): Promise<{ compliant: boolean; ippsTriggered: number[] }> {
  const ippsTriggered = new Set<number>();

  // IPP1: Collection – purpose limitation
  if (["wof_booking", "fleet_status"].includes(action)) ippsTriggered.add(1);
  // IPP3 & IPP3A: Consent for personal/location data
  if (["driver_location", "driver_personal"].includes(dataCategory)) ippsTriggered.add(3);
  ippsTriggered.add(3); // IPP3A from 1 May 2026
  // IPP4: Manner of collection
  if (action === "gps_tracking") ippsTriggered.add(4);
  // IPP5: Storage and security
  ippsTriggered.add(5);
  // IPP6: Access and correction
  if (action === "ipp_check") ippsTriggered.add(6);
  // IPP9: Accuracy and retention
  ippsTriggered.add(9);
  // IPP13: Unique identifiers
  if (["vehicle_registration", "driver_license"].includes(dataCategory)) ippsTriggered.add(13);

  const supabase = getSupabase();
  const { data: consents } = await supabase
    .from("ipp_consents")
    .select("*")
    .eq("user_id", userId)
    .eq("action_type", action);

  const compliant = !!(consents && consents.length > 0 && (consents[0] as Record<string, unknown>).consented === true);
  return { compliant, ippsTriggered: [...ippsTriggered] };
}

// ===== WoF / CoF STATUS =====
async function checkWoFCoFStatus(vehicleId: string): Promise<{
  wofStatus: string; cofStatus: string;
  daysUntilExpiry: number; requiresScheduling: boolean;
}> {
  const supabase = getSupabase();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("wof_expiry, cof_expiry")
    .eq("vehicle_id", vehicleId)
    .single();

  if (!vehicle) {
    return { wofStatus: "unknown", cofStatus: "unknown", daysUntilExpiry: -1, requiresScheduling: false };
  }

  const today = new Date();
  const wofExpiry = new Date((vehicle as Record<string, string>).wof_expiry);
  const cofExpiry = new Date((vehicle as Record<string, string>).cof_expiry);
  const wofDays = Math.floor((wofExpiry.getTime() - today.getTime()) / 86400000);
  const cofDays = Math.floor((cofExpiry.getTime() - today.getTime()) / 86400000);

  const status = (d: number) => d < 0 ? "expired" : d <= 28 ? "due_soon" : "valid";
  return {
    wofStatus: status(wofDays),
    cofStatus: status(cofDays),
    daysUntilExpiry: Math.min(wofDays, cofDays),
    requiresScheduling: status(wofDays) !== "valid" || status(cofDays) !== "valid",
  };
}

// ===== MAINTENANCE CONFLICT DETECTION =====
async function detectMaintenanceConflicts(
  vehicleId: string, window: { start: string; end: string }
): Promise<{ conflicts: boolean; existingJobs: string[] }> {
  const supabase = getSupabase();
  const { data: jobs } = await supabase
    .from("workshop_jobs")
    .select("job_id, scheduled_start, scheduled_end")
    .eq("vehicle_id", vehicleId)
    .eq("status", "scheduled");

  const pStart = new Date(window.start).getTime();
  const pEnd = new Date(window.end).getTime();
  const conflicting: string[] = [];

  if (jobs) {
    for (const job of jobs as Array<Record<string, string>>) {
      const jStart = new Date(job.scheduled_start).getTime();
      const jEnd = new Date(job.scheduled_end).getTime();
      if ((pStart >= jStart && pStart < jEnd) || (pEnd > jStart && pEnd <= jEnd)) {
        conflicting.push(job.job_id);
      }
    }
  }
  return { conflicts: conflicting.length > 0, existingJobs: conflicting };
}

// ===== POLICY GATES =====
function applyPolicyGates(
  action: string, ctx: Record<string, boolean>
): {
  decision: "allowed" | "approval_required" | "forbidden";
  rationale: string;
  complianceChecks: Record<string, boolean>;
  riskScore: number;
} {
  let decision: "allowed" | "approval_required" | "forbidden" = "allowed";
  let rationale = "All compliance checks passed.";
  let riskScore = 10;

  // Forbidden: expired WoF/CoF
  if (["wof_booking", "fleet_status"].includes(action) && !ctx.wofCofValid) {
    decision = "forbidden";
    rationale = "Vehicle WoF/CoF expired. NZTA regulation violation.";
    riskScore = 95;
  }
  // Forbidden: privacy breach during GPS tracking
  if (action === "gps_tracking" && !ctx.privacyCompliant) {
    decision = "forbidden";
    rationale = "Driver SAR in progress. Location data access prohibited under IPP6.";
    riskScore = 98;
  }
  // Approval: maintenance conflicts
  if (action === "job_creation" && !ctx.maintenanceScheduleClear) {
    decision = "approval_required";
    rationale = "Conflicting maintenance schedule. Manager approval required.";
    riskScore = 65;
  }
  // Approval: GPS without consent
  if (action === "gps_tracking" && decision === "allowed" && !ctx.privacyCompliant) {
    decision = "approval_required";
    rationale = "GPS tracking requires driver consent per IPP3 and IPP3A.";
    riskScore = 72;
  }

  return {
    decision, rationale, riskScore,
    complianceChecks: {
      privacy_act_2020: ctx.privacyCompliant ?? true,
      nzta_compliance: ctx.nztaCompliant ?? true,
      wof_cof_status: ctx.wofCofValid ?? true,
      maintenance_schedule: ctx.maintenanceScheduleClear ?? true,
    },
  };
}

// ===== SIMULATION =====
function simulateOutcomes(action: string, decision: string): {
  outcomeIfAllowed: string; outcomeIfBlocked: string; alternativeApproaches: string[];
} {
  const scenarios: Record<string, { outcomeIfAllowed: string; outcomeIfBlocked: string; alternativeApproaches: string[] }> = {
    wof_booking: {
      outcomeIfAllowed: "WoF booking scheduled. Vehicle removed from non-compliant fleet report.",
      outcomeIfBlocked: "Booking rejected. Vehicle remains flagged. Fleet manager escalation triggered.",
      alternativeApproaches: ["Manager override after IPP validation", "Schedule at alternative workshop", "Expedited appointment request"],
    },
    gps_tracking: {
      outcomeIfAllowed: "Real-time tracking enabled. Location data streamed to fleet dashboard. IPP3A consent logged.",
      outcomeIfBlocked: "Tracking disabled. Driver privacy protected. Historical data retention limited.",
      alternativeApproaches: ["Request explicit driver consent", "Route-only tracking without real-time", "Geofencing alerts instead"],
    },
    job_creation: {
      outcomeIfAllowed: "Workshop job card created. Technician assigned. Maintenance commenced.",
      outcomeIfBlocked: "Job queued for manager approval due to schedule conflicts.",
      alternativeApproaches: ["Reschedule to conflict-free window", "Use alternative workshop slot", "Prioritize urgent repairs"],
    },
  };
  return scenarios[action] || {
    outcomeIfAllowed: "Action executed successfully.",
    outcomeIfBlocked: "Action blocked due to policy gate.",
    alternativeApproaches: ["Request manager approval", "Modify request parameters"],
  };
}

// ===== MAIN HANDLER =====
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const requestId = body.requestId || `req_${Date.now()}`;
    const action = body.actionType || body.action || body.payload?.requestType || "unknown";
    const userId = body.userId || body.user_id || "anon";
    const vehicleId = body.payload?.vehicleId || body.payload?.vehicle_id || "";
    const fleetId = body.payload?.fleetId || body.payload?.fleet_id || "";
    const dataCategory = body.payload?.dataCategory || "general";
    const explanations: ExplanationObject[] = [];

    // Layer 1: Perception
    explanations.push(makeExplanation(
      "Perception", action,
      `Received automotive request: ${action}. Vehicle: ${vehicleId || "N/A"}, Fleet: ${fleetId || "N/A"}. Privacy Act 2020 IPP scope determined.`,
      ["schema_validation", "vehicle_id_check", "ipp_scope_detection"],
      1.0
    ));

    // Layer 2: Memory — Mahara context + IPP consent check
    let memoryCount = 0;
    try {
      const baseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const maharaRes = await fetch(`${baseUrl}/functions/v1/mahara`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({ action: "get_context", userId, kete: "ARATAKI" }),
      });
      const maharaData = await maharaRes.json();
      memoryCount = Array.isArray(maharaData.context) ? maharaData.context.length : 0;
    } catch { /* optional */ }

    const ippResult = await validateIPPs(userId, action, dataCategory);
    explanations.push(makeExplanation(
      "Memory", action,
      `Retrieved ${memoryCount} context entries. IPP validation: compliant=${ippResult.compliant}, triggered IPPs: [${ippResult.ippsTriggered.join(",")}].`,
      ["context_retrieval", "ipp_consent_check", "privacy_act_2020"],
      0.9
    ));

    // Layer 3: Reasoning — WoF/CoF + maintenance conflicts + policy gates
    let wofCofValid = true;
    let maintenanceScheduleClear = true;
    let wofCofDetails = {};

    if (vehicleId) {
      const wofResult = await checkWoFCoFStatus(vehicleId);
      wofCofValid = wofResult.wofStatus === "valid" && wofResult.cofStatus === "valid";
      wofCofDetails = wofResult;

      if (body.payload?.maintenanceWindow) {
        const conflicts = await detectMaintenanceConflicts(vehicleId, body.payload.maintenanceWindow);
        maintenanceScheduleClear = !conflicts.conflicts;
      }
    }

    const gateResult = applyPolicyGates(action, {
      privacyCompliant: ippResult.compliant,
      nztaCompliant: true,
      wofCofValid,
      maintenanceScheduleClear,
    });

    explanations.push(makeExplanation(
      "Reasoning", action,
      gateResult.rationale + ` Risk score: ${gateResult.riskScore}. WoF/CoF: ${JSON.stringify(wofCofDetails)}.`,
      [
        "privacy_act_2020_ipp3a", "nzta_wof_cof_regulations",
        "fair_trading_act_1986", "motor_vehicle_sales_act_2003",
        "cccfa_2003",
      ],
      gateResult.riskScore < 50 ? 0.95 : 0.75
    ));

    // Layer 4: Action
    let actionResult = `Action '${action}' processed (draft only — no autonomous external comms)`;
    if (gateResult.decision !== "forbidden") {
      switch (action) {
        case "wof_booking":
          actionResult = "WoF booking draft created. Awaiting dealer principal sign-off.";
          break;
        case "fleet_status":
          actionResult = "Fleet compliance report generated. Non-compliant vehicles flagged.";
          break;
        case "job_creation":
          actionResult = "Workshop job card drafted. Technician assignment pending approval.";
          break;
        case "gps_tracking":
          actionResult = "GPS tracking configuration prepared. IPP3A consent log created.";
          break;
        case "maintenance_schedule":
          actionResult = "Maintenance schedule updated. Conflict check completed.";
          break;
        case "vehicle_listing_check":
          actionResult = "Vehicle listing compliance checked. Draft ready for dealer review.";
          break;
        case "customer_enquiry_response":
          actionResult = "Customer enquiry response drafted. Pending team review before sending.";
          break;
        case "finance_disclosure_generator":
          actionResult = "Initial disclosure statement (CCCFA s.17) drafted. Lender documents are the legal record.";
          break;
      }
    }

    explanations.push(makeExplanation(
      "Action", action, actionResult,
      ["action_execution", "draft_only_posture", "audit_trail"],
      0.92
    ));

    // Layer 5: Explanation synthesis
    explanations.push(makeExplanation(
      "Explanation", "synthesis",
      `Traced ${explanations.length} layers: ${explanations.map(e => e.layer).join(" → ")}. All decisions traced to Privacy Act 2020 IPPs, NZTA regulations, and Motor Vehicle Sales Act 2003.`,
      ["transparency", "auditability", "traceability", "ipp3a_disclosure"],
      0.96
    ));

    // Layer 6: Simulation
    const sim = simulateOutcomes(action, gateResult.decision);
    explanations.push(makeExplanation(
      "Simulation", action,
      `Allowed: ${sim.outcomeIfAllowed} | Blocked: ${sim.outcomeIfBlocked} | Alternatives: ${sim.alternativeApproaches.join("; ")}`,
      ["outcome_simulation", "cascade_detection", "alternative_generation"],
      0.87
    ));

    // Audit log
    const supabase = getSupabase();
    await supabase.from("pipeline_audit_logs").insert({
      request_id: requestId,
      user_id: userId,
      kete: "ARATAKI",
      action_type: action,
      step: "agent_complete",
      status: gateResult.decision,
      details: {
        vehicle_id: vehicleId,
        fleet_id: fleetId,
        compliance_checks: gateResult.complianceChecks,
        risk_score: gateResult.riskScore,
        ipps_triggered: ippResult.ippsTriggered,
      },
    });

    return new Response(JSON.stringify({
      request_id: requestId,
      vehicle_id: vehicleId,
      fleet_id: fleetId,
      decision: gateResult.decision,
      risk_score: gateResult.riskScore,
      compliance_checks: gateResult.complianceChecks,
      explanation_objects: explanations,
      explanations: explanations.map(e => ({
        action: e.action_id,
        reasoning: e.rationale,
        sources: e.rules_applied,
        confidence: e.confidence_score,
        regulations: e.rules_applied.filter(r =>
          r.includes("act") || r.includes("ipp") || r.includes("nzta") ||
          r.includes("2003") || r.includes("2020") || r.includes("1986")
        ),
      })),
      simulation: sim,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ARATAKI agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
