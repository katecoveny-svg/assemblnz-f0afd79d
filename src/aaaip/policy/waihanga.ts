// ═══════════════════════════════════════════════════════════════
// AAAIP — Waihanga (Construction) Policies
// Safety, consent and data-integrity policies for the Waihanga
// construction agent that processes site check-ins, hazard
// reports, photo documentation and tender submissions.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

const PPE_REQUIRED: Policy = {
  id: "waihanga.ppe_required",
  domain: "construction",
  name: "PPE required on site",
  rationale:
    "Workers without confirmed hi-vis, hard-hat and boots cannot be checked in to any active zone.",
  source: "NZ Health and Safety at Work Act 2015 + WorkSafe PPE guidance",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "ppe"],
};
const ppePredicate: PolicyPredicate = (action) => {
  if (action.kind !== "site_checkin") return pass(PPE_REQUIRED.id, "block");
  const ppe = (action.payload.ppeConfirmed as boolean | undefined) ?? false;
  if (!ppe) return fail(PPE_REQUIRED.id, "block", "Worker has not confirmed PPE — refusing check-in.");
  return pass(PPE_REQUIRED.id, "block");
};

const HAZARD_ESCALATION: Policy = {
  id: "waihanga.hazard_escalation",
  domain: "construction",
  name: "Critical hazards escalate immediately",
  rationale:
    "Hazard reports above the critical threshold must be escalated to a site supervisor before any other action on the same zone.",
  source: "ISO 45001 + WorkSafe notifiable-event guidance",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "hazard"],
};
const hazardPredicate: PolicyPredicate = (action, ctx) => {
  const zone = action.payload.zone as string | undefined;
  const criticalZones = (ctx.world.criticalHazardZones as string[]) ?? [];
  if (zone && criticalZones.includes(zone) && action.kind !== "escalate_hazard") {
    return fail(HAZARD_ESCALATION.id, "block",
      `Zone ${zone} has an unresolved critical hazard — only escalation actions allowed.`);
  }
  return pass(HAZARD_ESCALATION.id, "block");
};

const WORKER_CONSENT: Policy = {
  id: "waihanga.worker_consent",
  domain: "construction",
  name: "Worker consent for photo documentation",
  rationale:
    "Site photos that include identifiable workers cannot be uploaded without the worker's documented consent.",
  source: "NZ Privacy Act 2020 — IPP 1 & IPP 3",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "consent"],
};
const workerConsentPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "upload_photo") return pass(WORKER_CONSENT.id, "block");
  const containsWorkers = action.payload.containsWorkers as boolean | undefined;
  const consent = action.payload.workerConsent as boolean | undefined;
  if (containsWorkers && consent !== true) {
    return fail(WORKER_CONSENT.id, "block",
      "Photo contains identifiable workers but no consent is on file.");
  }
  return pass(WORKER_CONSENT.id, "block");
};

const TENDER_INTEGRITY: Policy = {
  id: "waihanga.tender_integrity",
  domain: "construction",
  name: "Tender submissions require human sign-off",
  rationale:
    "Tender submissions commit the business legally and financially. The agent cannot auto-submit — a human must review.",
  source: "NZ Contract and Commercial Law Act 2017 + internal SOP",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["legal", "human-in-the-loop"],
};
const tenderPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "submit_tender") return pass(TENDER_INTEGRITY.id, "warn");
  const humanSignoff = action.payload.humanSignoff as boolean | undefined;
  if (humanSignoff !== true) {
    return fail(TENDER_INTEGRITY.id, "warn",
      "Tender submission requires human sign-off before dispatch.");
  }
  return pass(TENDER_INTEGRITY.id, "warn");
};

const SITE_ACCESS: Policy = {
  id: "waihanga.site_access",
  domain: "construction",
  name: "Site access cap",
  rationale:
    "Active site headcount cannot exceed the permitted maximum. Agent must refuse further check-ins once the cap is hit.",
  source: "Site-specific safety plan + WorkSafe induction requirement",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["safety", "operational"],
};
const siteAccessPredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== "site_checkin") return pass(SITE_ACCESS.id, "block");
  const headcount = (ctx.world.headcount as number | undefined) ?? 0;
  const cap = (ctx.world.headcountCap as number | undefined) ?? 40;
  if (headcount >= cap) {
    return fail(SITE_ACCESS.id, "block",
      `Site at capacity (${headcount}/${cap}) — refusing further check-ins.`);
  }
  return pass(SITE_ACCESS.id, "block");
};

const UNCERTAINTY: Policy = {
  id: "waihanga.uncertainty_handoff",
  domain: "construction",
  name: "Defer to humans when uncertain",
  rationale: "Escalate low-confidence site actions to the site supervisor.",
  source: "AAAIP safe-operation principle: human-in-the-loop fallback",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight"],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(UNCERTAINTY.id, "warn",
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)}.`);
  }
  return pass(UNCERTAINTY.id, "warn");
};

export const WAIHANGA_POLICIES: RegisteredPolicy[] = [
  { policy: PPE_REQUIRED, predicate: ppePredicate },
  { policy: HAZARD_ESCALATION, predicate: hazardPredicate },
  { policy: WORKER_CONSENT, predicate: workerConsentPredicate },
  { policy: TENDER_INTEGRITY, predicate: tenderPredicate },
  { policy: SITE_ACCESS, predicate: siteAccessPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];
export const WAIHANGA_POLICY_METADATA: Policy[] = WAIHANGA_POLICIES.map((p) => p.policy);
