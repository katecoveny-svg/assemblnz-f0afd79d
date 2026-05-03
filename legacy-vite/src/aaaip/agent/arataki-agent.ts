// ═══════════════════════════════════════════════════════════════
// AAAIP — Arataki (Automotive) Agent
//
// Picks the next customer enquiry, runs the proposed response
// through ARATAKI_POLICIES, and (when allowed) computes a live
// total-cost-of-ownership snapshot using the shared FuelOracle.
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { ArataikiSimulator, CustomerEnquiry, Vehicle } from "../simulation/arataki";
import type { TcoResult } from "../utils/fuel-oracle";

export interface ArataikiDecisionResult {
  decision: ComplianceDecision;
  applied: boolean;
  summary: string;
  enquiry?: CustomerEnquiry;
  vehicle?: Vehicle;
  /** Optional TCO calculation attached when the agent quoted one. */
  tco?: {
    ice: TcoResult;
    ev: TcoResult;
    savingsNzd: number;
  };
}

export interface ArataikiAgentOptions {
  engine: ComplianceEngine;
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `arakact-${++actionCounter}`;

export class ArataikiAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: ArataikiAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  step(sim: ArataikiSimulator): ArataikiDecisionResult | null {
    const enquiry = this.pickEnquiry(sim);
    if (!enquiry) return null;

    const vehicle = sim.world.inventory.find((v) => v.id === enquiry.vehicleId);
    if (!vehicle) {
      sim.drop(enquiry.id);
      return null;
    }

    const confidence = this.estimateConfidence(enquiry, vehicle);

    const action: AgentAction = {
      id: nextActionId(),
      domain: "automotive",
      kind: enquiry.kind,
      payload: {
        enquiryId: enquiry.id,
        vehicleId: vehicle.id,
        mvtrNumber: sim.world.mvtrNumber,
        cccfaDisclosuresAttached: enquiry.cccfaDisclosuresAttached,
        quotedLPer100km: enquiry.quotedLPer100km,
        ratedLPer100km: vehicle.powertrain === "ev" ? undefined : vehicle.ratedEconomy,
        odometerTamperFlag: vehicle.odometerTamperFlag,
        inspectionPassed: vehicle.inspectionPassed,
        customerOptIn: enquiry.customerOptIn,
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `${enquiry.kind} · ${vehicle.make} ${vehicle.model} (${vehicle.year}) · conf ${confidence.toFixed(2)}`,
    };

    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;
    let tco: ArataikiDecisionResult["tco"];

    if (decision.verdict === "allow") {
      applied = sim.handle(enquiry.id);
      summary = applied
        ? `Handled: ${enquiry.kind} · ${vehicle.make} ${vehicle.model}`
        : `Simulator refused ${enquiry.id}`;
      // When the agent confirms a fuel-economy quote, attach a live
      // TCO snapshot so the sales team can counter-offer with the
      // real running cost vs an EV alternative.
      if (applied && enquiry.kind === "quote_fuel_economy") {
        tco = this.computeTcoComparison(sim, vehicle);
      }
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting sales-manager approval: ${enquiry.kind} · ${vehicle.make} ${vehicle.model}`;
    } else {
      summary = `Blocked: ${decision.explanation}`;
      sim.reject(enquiry.id);
      // Delist the vehicle if it failed an integrity check.
      if (vehicle.odometerTamperFlag || vehicle.inspectionPassed === false) {
        vehicle.listed = false;
      }
    }

    return { decision, applied, summary, enquiry, vehicle, tco };
  }

  approveAndApply(sim: ArataikiSimulator, enquiryId: string): boolean {
    return sim.handle(enquiryId);
  }

  // ── Internals ────────────────────────────────────────────

  private pickEnquiry(sim: ArataikiSimulator): CustomerEnquiry | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Sale closes first (highest commercial value), then finance,
    // then test drives, then other enquiries.
    const priority: Record<string, number> = {
      close_sale: 0,
      quote_finance: 1,
      book_test_drive: 2,
      quote_fuel_economy: 3,
      share_with_partner: 4,
    };
    const sorted = [...sim.world.inbox].sort((a, b) => {
      const ap = priority[a.kind] ?? 9;
      const bp = priority[b.kind] ?? 9;
      if (ap !== bp) return ap - bp;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private estimateConfidence(enquiry: CustomerEnquiry, vehicle: Vehicle): number {
    let conf = 0.92;
    if (vehicle.odometerTamperFlag) conf = 0.1;
    if (!vehicle.inspectionPassed) conf = 0.15;
    if (enquiry.kind === "quote_finance" && enquiry.cccfaDisclosuresAttached !== true) conf = 0.2;
    if (
      enquiry.kind === "quote_fuel_economy" &&
      enquiry.quotedLPer100km !== undefined &&
      vehicle.powertrain !== "ev" &&
      enquiry.quotedLPer100km < vehicle.ratedEconomy - 0.5
    ) {
      conf = 0.15;
    }
    if (enquiry.kind === "share_with_partner" && enquiry.customerOptIn !== true) conf = 0.25;
    return Math.max(0, Math.min(1, conf));
  }

  /** Build an ICE-vs-EV total-cost-of-ownership comparison for the customer. */
  private computeTcoComparison(
    sim: ArataikiSimulator,
    vehicle: Vehicle,
  ): ArataikiDecisionResult["tco"] {
    const annualKm = 14000;
    const years = 5;
    const annualFixedNzd = 2400;

    let iceFuelKind: "petrol91" | "petrol95" | "diesel" = "petrol91";
    if (vehicle.powertrain === "diesel") iceFuelKind = "diesel";
    if (vehicle.powertrain === "petrol95") iceFuelKind = "petrol95";

    const ice = sim.oracle.tcoIce({
      annualKm,
      years,
      lPer100km: vehicle.powertrain === "ev" ? 7 : vehicle.ratedEconomy,
      purchaseNzd: vehicle.powertrain === "ev" ? Math.round(vehicle.priceNzd * 0.85) : vehicle.priceNzd,
      annualFixedNzd,
      fuelKind: iceFuelKind,
    });
    const ev = sim.oracle.tcoEv({
      annualKm,
      years,
      kwhPer100km: vehicle.powertrain === "ev" ? vehicle.ratedEconomy : 17,
      purchaseNzd: vehicle.powertrain === "ev" ? vehicle.priceNzd : Math.round(vehicle.priceNzd * 1.18),
      annualFixedNzd: annualFixedNzd - 400, // EVs skip regular services
    });
    const savingsNzd = Math.round(ice.totalNzd - ev.totalNzd);
    return { ice, ev, savingsNzd };
  }
}
