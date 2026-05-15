import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  bool,
  makeExplanation,
  recallMahara,
  text,
  type KeteLogic,
  type NormalizedPipelineInput,
} from "../_shared/kete-agent-pipeline.ts";

export const hokoLogic: KeteLogic = {
  kete: "HOKO",
  keteSlug: "hoko",
  entityLabel: "store_id",
  defaultAction: "cga_response",
  subjectId: (payload) => text(payload.store_id, "unknown-store"),
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
    `Validated retail request for ${input.subjectId}. Consumer, promotion, stock, and customer-data scope established.`,
    ["schema_validation", "consumer_scope", "privacy_act_2020"],
    1,
  );
}

function iho(input: NormalizedPipelineInput) {
  return makeExplanation(
    "Iho",
    input.action,
    `Routed ${input.action} to Hoko with CGA, Fair Trading, product safety, and retail messaging gates active.`,
    ["consumer_guarantees_act_1993", "fair_trading_act_1986", "product_safety_standards"],
    0.94,
  );
}

async function mahara(input: NormalizedPipelineInput, _supabase: SupabaseClient) {
  const context = await recallMahara(input, "HOKO");
  return {
    memory: { context_count: context.length },
    explanation: makeExplanation(
      "Mahara",
      input.action,
      `Retrieved ${context.length} retail memory entries for refund precedents, supplier issues, stock patterns, and campaign claims.`,
      ["context_retrieval", "retail_memory", "customer_outcome_history"],
      0.88,
    ),
  };
}

async function ta(input: NormalizedPipelineInput) {
  const claimEvidence = bool(input.payload.claim_evidence_current);
  const productSafetyOk = bool(input.payload.product_safety_ok);
  const customerDataOk = bool(input.payload.customer_data_ok);
  const unsubscribePresent = bool(input.payload.unsubscribe_present);
  const cgaRemedyOffered = bool(input.payload.cga_remedy_offered);
  const stockAvailable = bool(input.payload.stock_available);

  const complianceStatus = {
    consumer_guarantees_act_1993: cgaRemedyOffered,
    fair_trading_act_1986: claimEvidence,
    privacy_act_2020: customerDataOk,
    unsolicited_electronic_messages_act_2007: unsubscribePresent,
    product_safety_standards: productSafetyOk,
    stock_promises_accurate: stockAvailable,
  };

  const failed = Object.entries(complianceStatus).filter(([, ok]) => !ok).map(([key]) => key);
  let decision: "allowed" | "approval_required" | "forbidden" = "allowed";
  if (!productSafetyOk || !customerDataOk) decision = "forbidden";
  else if (failed.length > 0) decision = "approval_required";

  return {
    decision,
    complianceStatus,
    riskScore: decision === "forbidden" ? 88 : decision === "approval_required" ? 55 : 12,
    actionResult:
      decision === "forbidden"
        ? `Blocked ${input.action}; product safety or customer-data compliance must be resolved first.`
        : `Drafted ${input.action} with CGA remedy, Fair Trading, and stock-accuracy checks ready for operator review.`,
    rules: [
      "consumer_guarantees_act_1993",
      "fair_trading_act_1986",
      "privacy_act_2020",
      "unsolicited_electronic_messages_act_2007",
      "product_safety_standards",
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
