import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  bool,
  makeExplanation,
  recallMahara,
  text,
  type KeteLogic,
  type NormalizedPipelineInput,
} from "../_shared/kete-agent-pipeline.ts";

export const mataurangaLogic: KeteLogic = {
  kete: "MATAURANGA",
  keteSlug: "matauranga",
  entityLabel: "school_id",
  defaultAction: "board_pack",
  subjectId: (payload) => text(payload.school_id, "unknown-school"),
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
    `Validated secondary-school request for ${input.subjectId}. Student privacy, assessment, and board-governance scope established.`,
    ["schema_validation", "student_privacy_scope", "education_training_act_2020"],
    1,
  );
}

function iho(input: NormalizedPipelineInput) {
  return makeExplanation(
    "Iho",
    input.action,
    `Routed ${input.action} to Mātauranga with NCEA, ERO, attendance, pastoral-care, and board reporting rules active.`,
    ["ncea_assessment_rules", "ero_school_evaluation", "teaching_council_code"],
    0.93,
  );
}

async function mahara(input: NormalizedPipelineInput, _supabase: SupabaseClient) {
  const context = await recallMahara(input, "MATAURANGA");
  return {
    memory: { context_count: context.length },
    explanation: makeExplanation(
      "Mahara",
      input.action,
      `Retrieved ${context.length} school memory entries for attendance patterns, assessment moderation, board packs, and prior ERO evidence.`,
      ["context_retrieval", "school_memory", "board_evidence_history"],
      0.88,
    ),
  };
}

async function ta(input: NormalizedPipelineInput) {
  const privacyOk = bool(input.payload.student_privacy_ok);
  const moderationCurrent = bool(input.payload.assessment_moderation_current);
  const pastoralSafeguard = bool(input.payload.pastoral_safeguard_current);
  const attendanceDataComplete = bool(input.payload.attendance_data_complete);
  const boardConfidential = bool(input.payload.board_confidential_handling);

  const complianceStatus = {
    education_training_act_2020: privacyOk && pastoralSafeguard,
    privacy_act_2020: privacyOk && boardConfidential,
    ncea_moderation: moderationCurrent,
    pastoral_care_code: pastoralSafeguard,
    attendance_records: attendanceDataComplete,
    ero_evidence_ready: moderationCurrent && attendanceDataComplete,
  };

  const failed = Object.entries(complianceStatus).filter(([, ok]) => !ok).map(([key]) => key);
  let decision: "allowed" | "approval_required" | "forbidden" = "allowed";
  if (!privacyOk || !pastoralSafeguard) decision = "forbidden";
  else if (failed.length > 0) decision = "approval_required";

  return {
    decision,
    complianceStatus,
    riskScore: decision === "forbidden" ? 90 : decision === "approval_required" ? 58 : 13,
    actionResult:
      decision === "forbidden"
        ? `Blocked ${input.action}; student privacy or pastoral safeguards must be resolved first.`
        : `Drafted ${input.action} with NCEA, ERO, and board-governance evidence ready for operator review.`,
    rules: [
      "education_training_act_2020",
      "privacy_act_2020",
      "ncea_assessment_rules",
      "pastoral_care_code",
      "ero_school_evaluation",
      "teaching_council_code",
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
