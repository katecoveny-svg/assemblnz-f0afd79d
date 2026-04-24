// ═══════════════════════════════════════════════════════════════
// Sample-conversation policy suite for MANAAKI and ARATAKI.
//
// Each test simulates an inbound user turn that maps to a single
// proposed agent action and asserts the compliance engine returns
// the expected block / needs_human / allow verdict, with the
// correct policy id triggering.
//
// Verdict mapping:
//   • severity "block" failure  → engine verdict "block"
//   • severity "warn"  failure  → engine verdict "needs_human"
//   • all pass                  → engine verdict "allow"
// ═══════════════════════════════════════════════════════════════

import { describe, expect, it } from "vitest";

import { ComplianceEngine } from "../policy/engine";
import { ARATAKI_POLICIES } from "../policy/arataki";
import { MANAAKI_POLICIES } from "../policy/manaaki";
import type { AgentAction, Domain, PolicyContext } from "../policy/types";

// ── helpers ───────────────────────────────────────────────────

interface ConversationCase {
  /** Plain-English user turn that produced this proposed action. */
  userTurn: string;
  /** Action the agent wants to take in response. */
  action: AgentAction;
  /** Optional world snapshot (overbook counters, etc.). */
  world?: Record<string, unknown>;
  /** Expected overall verdict from the engine. */
  expectedVerdict: "allow" | "needs_human" | "block";
  /** Policy id that must be the first failed evaluation, or null when allowed. */
  expectedTriggeredPolicy: string | null;
}

const buildAction = (
  domain: Domain,
  kind: string,
  payload: Record<string, unknown>,
  confidence = 0.9,
  id = `act-${Math.random().toString(36).slice(2, 8)}`,
): AgentAction => ({
  id,
  domain,
  kind,
  payload,
  confidence,
  proposedAt: 0,
  rationale: `agent proposed ${kind}`,
});

const runCase = (
  engine: ComplianceEngine,
  c: ConversationCase,
  ctx: Partial<PolicyContext> = {},
) => {
  const decision = engine.evaluate(c.action, { world: c.world ?? {}, ...ctx });
  expect(decision.verdict, `[${c.userTurn}] verdict`).toBe(c.expectedVerdict);
  if (c.expectedTriggeredPolicy) {
    const failed = decision.evaluations.find((e) => !e.passed);
    expect(failed?.policyId, `[${c.userTurn}] triggered policy`).toBe(
      c.expectedTriggeredPolicy,
    );
  } else {
    expect(decision.evaluations.every((e) => e.passed)).toBe(true);
  }
  return decision;
};

// ── MANAAKI ───────────────────────────────────────────────────

describe("MANAAKI sample conversations → policy verdicts", () => {
  const engine = new ComplianceEngine({
    policies: MANAAKI_POLICIES,
    defaultUncertaintyThreshold: 0.6,
  });

  const cases: ConversationCase[] = [
    {
      userTurn: "Confirm Sarah's reservation for Friday night.",
      action: buildAction("hospitality", "confirm_reservation", { region: "nz" }),
      world: { confirmedCount: 3, propertyCapacity: 10 },
      expectedVerdict: "allow",
      expectedTriggeredPolicy: null,
    },
    {
      userTurn: "Squeeze in one more booking for tonight.",
      action: buildAction("hospitality", "confirm_reservation", { region: "nz" }),
      world: { confirmedCount: 10, propertyCapacity: 10 },
      expectedVerdict: "block",
      expectedTriggeredPolicy: "manaaki.no_overbook",
    },
    {
      userTurn: "Confirm the peanut-sauce order for the guest with a peanut allergy.",
      action: buildAction("hospitality", "confirm_order", {
        region: "nz",
        allergenConflict: true,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "manaaki.allergen_safety",
    },
    {
      userTurn: "Put the wheelchair guest in room 4 (no step-free access).",
      action: buildAction("hospitality", "assign_room", {
        region: "nz",
        accessibilityRequired: ["step_free", "grab_rails"],
        accessibilityProvided: ["grab_rails"],
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "manaaki.accessibility",
    },
    {
      userTurn: "Share the guest list with our marketing partner.",
      action: buildAction("hospitality", "share_guest_profile", {
        region: "nz",
        marketingOptIn: false,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "manaaki.guest_consent",
    },
    {
      userTurn: "Send guest data to our US analytics vendor.",
      action: buildAction("hospitality", "share_guest_profile", {
        region: "us",
        marketingOptIn: true,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "manaaki.data_residency",
    },
    {
      userTurn: "I'm not sure — best guess on whether to upgrade the guest?",
      action: buildAction(
        "hospitality",
        "confirm_reservation",
        { region: "nz" },
        0.35, // below 0.6 threshold
      ),
      world: { confirmedCount: 2, propertyCapacity: 10 },
      expectedVerdict: "needs_human",
      expectedTriggeredPolicy: "manaaki.uncertainty_handoff",
    },
  ];

  for (const c of cases) {
    it(`"${c.userTurn}" → ${c.expectedVerdict}`, () => {
      runCase(engine, c);
    });
  }

  it("covers every MANAAKI policy at least once", () => {
    const triggered = new Set(
      cases.map((c) => c.expectedTriggeredPolicy).filter(Boolean) as string[],
    );
    for (const { policy } of MANAAKI_POLICIES) {
      expect(triggered.has(policy.id), `missing case for ${policy.id}`).toBe(true);
    }
  });
});

// ── ARATAKI ───────────────────────────────────────────────────

describe("ARATAKI sample conversations → policy verdicts", () => {
  const engine = new ComplianceEngine({
    policies: ARATAKI_POLICIES,
    defaultUncertaintyThreshold: 0.6,
  });

  const cases: ConversationCase[] = [
    {
      userTurn: "Send the customer a finance quote for the Hilux.",
      action: buildAction("automotive", "quote_finance", {
        cccfaDisclosuresAttached: true,
        mvtrNumber: "MVTR-12345",
        ratedLPer100km: 8.5,
        quotedLPer100km: 8.5,
      }),
      expectedVerdict: "allow",
      expectedTriggeredPolicy: null,
    },
    {
      userTurn: "Just send the finance number — skip the legal disclosures.",
      action: buildAction("automotive", "quote_finance", {
        cccfaDisclosuresAttached: false,
        mvtrNumber: "MVTR-12345",
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "arataki.cccfa_disclosure",
    },
    {
      userTurn: "Tell them this ute does 6.0 L/100km (it's actually rated 9.0).",
      action: buildAction("automotive", "quote_vehicle", {
        ratedLPer100km: 9.0,
        quotedLPer100km: 6.0,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "arataki.fair_trading_claims",
    },
    {
      userTurn: "Close the sale on the Mazda for me.",
      action: buildAction("automotive", "close_sale", {
        cccfaDisclosuresAttached: true,
        mvtrNumber: "NOT-A-NUMBER",
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "arataki.mvsa_licensing",
    },
    {
      userTurn: "List the Corolla — yes, MotorWeb flagged the odometer.",
      action: buildAction("automotive", "list_vehicle", {
        odometerTamperFlag: true,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "arataki.odometer_integrity",
    },
    {
      userTurn: "Quote the Swift even though it failed our quality inspection.",
      action: buildAction("automotive", "quote_vehicle", {
        inspectionPassed: false,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "arataki.cga_acceptable_quality",
    },
    {
      userTurn: "Forward the lead to our finance partner.",
      action: buildAction("automotive", "share_with_partner", {
        customerOptIn: false,
      }),
      expectedVerdict: "block",
      expectedTriggeredPolicy: "arataki.customer_data_consent",
    },
    {
      userTurn: "Not sure — guess a trade-in figure for the customer.",
      action: buildAction(
        "automotive",
        "quote_vehicle",
        { ratedLPer100km: 8.0, quotedLPer100km: 8.0 },
        0.3, // below 0.6 threshold
      ),
      expectedVerdict: "needs_human",
      expectedTriggeredPolicy: "arataki.uncertainty_handoff",
    },
  ];

  for (const c of cases) {
    it(`"${c.userTurn}" → ${c.expectedVerdict}`, () => {
      runCase(engine, c);
    });
  }

  it("covers every ARATAKI policy at least once", () => {
    const triggered = new Set(
      cases.map((c) => c.expectedTriggeredPolicy).filter(Boolean) as string[],
    );
    for (const { policy } of ARATAKI_POLICIES) {
      expect(triggered.has(policy.id), `missing case for ${policy.id}`).toBe(true);
    }
  });
});
