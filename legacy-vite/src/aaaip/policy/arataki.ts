// ═══════════════════════════════════════════════════════════════
// AAAIP — Arataki (Automotive) Policies
//
// Consumer-protection and dealer-compliance policies for the
// Arataki automotive agent. Covers finance disclosure, fuel-
// economy claim honesty, odometer integrity, motor-vehicle sales
// licensing, Consumer Guarantees, and customer-data consent.
//
// Arataki is the AAAIP pilot that unlocks the Dealer Inventory
// Optimiser + Customer Insights revenue opportunity: every
// customer enquiry and inventory decision passes through these
// policies before the agent can respond or recommend.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

// ── Policies ─────────────────────────────────────────────────

const CCCFA_DISCLOSURE: Policy = {
  id: "arataki.cccfa_disclosure",
  domain: "automotive",
  name: "CCCFA finance disclosure",
  rationale:
    "Any finance quote offered to a customer must include the full CCCFA disclosures: total amount payable, interest rate, all fees, and the right to request a written contract.",
  source: "NZ Credit Contracts and Consumer Finance Act 2003 + 2020 amendments",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["finance", "legal", "consumer-protection"],
};
const cccfaPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "quote_finance") return pass(CCCFA_DISCLOSURE.id, "block");
  const disclosed = action.payload.cccfaDisclosuresAttached as boolean | undefined;
  if (disclosed !== true) {
    return fail(
      CCCFA_DISCLOSURE.id,
      "block",
      "Finance quote missing CCCFA disclosures — refusing to send.",
    );
  }
  return pass(CCCFA_DISCLOSURE.id, "block");
};

const FAIR_TRADING: Policy = {
  id: "arataki.fair_trading_claims",
  domain: "automotive",
  name: "Honest fuel-economy claims",
  rationale:
    "Fuel-economy, range or running-cost claims quoted to customers must be backed by the real manufacturer figure, not optimistic marketing language or a 'best-case' scenario.",
  source: "NZ Fair Trading Act 1986 — sections 9, 10, 13",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["consumer-protection", "marketing"],
};
const fairTradingPredicate: PolicyPredicate = (action) => {
  const quoted = action.payload.quotedLPer100km as number | undefined;
  const rated = action.payload.ratedLPer100km as number | undefined;
  if (quoted !== undefined && rated !== undefined && quoted < rated - 0.5) {
    return fail(
      FAIR_TRADING.id,
      "block",
      `Quoted ${quoted.toFixed(1)} L/100km is below rated ${rated.toFixed(1)} L/100km — misleading per Fair Trading Act.`,
    );
  }
  return pass(FAIR_TRADING.id, "block");
};

const MVSA_LICENSING: Policy = {
  id: "arataki.mvsa_licensing",
  domain: "automotive",
  name: "Motor Vehicle Sales Act licensing",
  rationale:
    "Outbound sales actions must include the dealer's Motor Vehicle Traders Register (MVTR) number. A trader without a valid MVTR cannot close a sale.",
  source: "NZ Motor Vehicle Sales Act 2003 + MBIE MVTR register",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["legal", "licensing"],
};
const mvsaPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "quote_finance" && action.kind !== "close_sale") {
    return pass(MVSA_LICENSING.id, "block");
  }
  const mvtr = action.payload.mvtrNumber as string | undefined;
  if (!mvtr || !/^MVTR-\d{4,}$/.test(mvtr)) {
    return fail(
      MVSA_LICENSING.id,
      "block",
      "Missing or malformed MVTR number — refusing to complete dealer transaction.",
    );
  }
  return pass(MVSA_LICENSING.id, "block");
};

const ODOMETER_INTEGRITY: Policy = {
  id: "arataki.odometer_integrity",
  domain: "automotive",
  name: "Odometer integrity",
  rationale:
    "Quoted vehicle odometer readings must match the certified history. Tamper flags from Waka Kotahi or MotorWeb block the action immediately.",
  source: "NZ Motor Vehicle Sales Act 2003 + Waka Kotahi odometer rules",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["fraud", "safety"],
};
const odometerPredicate: PolicyPredicate = (action) => {
  const tamperFlag = action.payload.odometerTamperFlag as boolean | undefined;
  if (tamperFlag === true) {
    return fail(
      ODOMETER_INTEGRITY.id,
      "block",
      "Vehicle history shows an odometer tamper flag — cannot be sold by this dealer.",
    );
  }
  return pass(ODOMETER_INTEGRITY.id, "block");
};

const CGA_QUALITY: Policy = {
  id: "arataki.cga_acceptable_quality",
  domain: "automotive",
  name: "Consumer Guarantees Act — acceptable quality",
  rationale:
    "Any vehicle flagged by the dealer inspection as not meeting the acceptable-quality standard cannot be listed or quoted until remediated.",
  source: "NZ Consumer Guarantees Act 1993 — sections 6–7",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["consumer-protection", "quality"],
};
const cgaPredicate: PolicyPredicate = (action) => {
  const inspectionPassed = action.payload.inspectionPassed as boolean | undefined;
  if (inspectionPassed === false) {
    return fail(
      CGA_QUALITY.id,
      "block",
      "Vehicle did not pass the dealer acceptable-quality inspection.",
    );
  }
  return pass(CGA_QUALITY.id, "block");
};

const CUSTOMER_CONSENT: Policy = {
  id: "arataki.customer_data_consent",
  domain: "automotive",
  name: "Customer data consent",
  rationale:
    "Customer enquiry data (name, email, phone, trade-in details) cannot be shared with third parties (finance, insurance, marketing) without the customer's explicit opt-in.",
  source: "NZ Privacy Act 2020 — IPPs 3 & 11",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "consent"],
};
const consentPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "share_with_partner") return pass(CUSTOMER_CONSENT.id, "block");
  const consent = action.payload.customerOptIn as boolean | undefined;
  if (consent !== true) {
    return fail(
      CUSTOMER_CONSENT.id,
      "block",
      "Customer has not opted in to data sharing with partners.",
    );
  }
  return pass(CUSTOMER_CONSENT.id, "block");
};

const UNCERTAINTY: Policy = {
  id: "arataki.uncertainty_handoff",
  domain: "automotive",
  name: "Defer to humans when uncertain",
  rationale: "Low-confidence quotes and recommendations escalate to the sales manager.",
  source: "AAAIP safe-operation principle",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight"],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(
      UNCERTAINTY.id,
      "warn",
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)}.`,
    );
  }
  return pass(UNCERTAINTY.id, "warn");
};

export const ARATAKI_POLICIES: RegisteredPolicy[] = [
  { policy: CCCFA_DISCLOSURE, predicate: cccfaPredicate },
  { policy: FAIR_TRADING, predicate: fairTradingPredicate },
  { policy: MVSA_LICENSING, predicate: mvsaPredicate },
  { policy: ODOMETER_INTEGRITY, predicate: odometerPredicate },
  { policy: CGA_QUALITY, predicate: cgaPredicate },
  { policy: CUSTOMER_CONSENT, predicate: consentPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];
export const ARATAKI_POLICY_METADATA: Policy[] = ARATAKI_POLICIES.map((p) => p.policy);
