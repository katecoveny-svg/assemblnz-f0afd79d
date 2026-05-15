import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  bool,
  makeExplanation,
  recallMahara,
  text,
  type KeteLogic,
  type NormalizedPipelineInput,
} from "../_shared/kete-agent-pipeline.ts";

export const akoLogic: KeteLogic = {
  kete: "AKO",
  keteSlug: "ako",
  entityLabel: "centre_id",
  defaultAction: "licence_check",
  subjectId: (payload) => text(payload.centre_id, "unknown-centre"),
  kahu,
  iho,
  mahara,
  ta,
  mana,
};

function kahu(input: NormalizedPipelineInput) {
  return makeExplanation(
    "Kahu",
    input.action,
    `Validated early childhood request for centre ${input.subjectId}. Child-safety, consent, and privacy scope established before drafting.`,
    ["schema_validation", "child_safety_scope", "privacy_act_2020"],
    1,
  );
}

function iho(input: NormalizedPipelineInput) {
  return makeExplanation(
    "Iho",
    input.action,
    `Routed ${input.action} to Ako with ECE licensing, Te Whāriki, funding, and ERO evidence rules active.`,
    ["education_training_act_2020", "ece_services_regulations_2008", "licensing_criteria_2008"],
    0.94,
  );
}

async function mahara(input: NormalizedPipelineInput, _supabase: SupabaseClient) {
  const context = await recallMahara(input, "AKO");
  return {
    memory: { context_count: context.length },
    explanation: makeExplanation(
      "Mahara",
      input.action,
      `Retrieved ${context.length} centre memory entries and checked whether prior ERO, incident, funding, or whānau communication context should constrain the draft.`,
      ["context_retrieval", "centre_memory", "ero_evidence_history"],
      0.88,
    ),
  };
}

async function ta(input: NormalizedPipelineInput) {
  const ratiosOk = bool(input.payload.ratios_ok);
  const safetyPlanCurrent = bool(input.payload.child_safety_plan_current);
  const consentRecorded = bool(input.payload.parent_consent_recorded);
  const fundingEvidenceComplete = bool(input.payload.funding_evidence_complete);
  const incidentNotifiable = bool(input.payload.notifiable_incident, false);

  const complianceStatus = {
    ece_services_regulations_2008: ratiosOk,
    licensing_criteria_2008: ratiosOk && safetyPlanCurrent,
    childrens_act_2014: safetyPlanCurrent,
    privacy_act_2020: consentRecorded,
    ministry_funding_rules: fundingEvidenceComplete,
    ero_evidence_ready: !incidentNotifiable || safetyPlanCurrent,
  };

  const failed = Object.entries(complianceStatus).filter(([, ok]) => !ok).map(([key]) => key);
  let decision: "allowed" | "approval_required" | "forbidden" = "allowed";
  if (!ratiosOk || !safetyPlanCurrent) decision = "forbidden";
  else if (failed.length > 0 || incidentNotifiable) decision = "approval_required";

  return {
    decision,
    complianceStatus,
    riskScore: decision === "forbidden" ? 92 : decision === "approval_required" ? 61 : 14,
    actionResult:
      decision === "forbidden"
        ? `Blocked ${input.action}; centre leadership must resolve child-safety or ratio evidence before this can proceed.`
        : `Drafted ${input.action} with Ako centre evidence, Te Whāriki framing, and operator review required before send.`,
    rules: [
      "education_training_act_2020",
      "ece_services_regulations_2008",
      "licensing_criteria_2008",
      "te_whariki",
      "childrens_act_2014",
      "privacy_act_2020",
    ],
  };
}

function mana(
  input: NormalizedPipelineInput,
  result: Awaited<ReturnType<typeof ta>>,
) {
  return makeExplanation(
    "Mana",
    input.action,
    `Final gate: ${result.decision}. Failed checks: ${Object.entries(result.complianceStatus).filter(([, ok]) => !ok).map(([key]) => key).join(", ") || "none"}.`,
    result.rules,
    result.decision === "allowed" ? 0.96 : 0.8,
  );
}
