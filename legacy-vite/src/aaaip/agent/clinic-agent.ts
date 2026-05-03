// ═══════════════════════════════════════════════════════════════
// AAAIP — Clinic Scheduling Agent
// Decision logic that consumes simulator state, proposes actions,
// runs them through the compliance engine, and emits a fully
// audited result. Designed to be driven from a UI tick loop.
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "../policy/engine";
import type { AgentAction, ComplianceDecision } from "../policy/types";
import type { ClinicSimulator, Patient, Slot } from "../simulation/clinic";

export interface AgentDecisionResult {
  decision: ComplianceDecision;
  /** True if the runtime applied the booking automatically. */
  applied: boolean;
  /** Reason in plain English — used by the audit log + UI. */
  summary: string;
  /** Patient and slot bound to this decision (if any). */
  patient?: Patient;
  slot?: Slot;
}

export interface ClinicAgentOptions {
  engine: ComplianceEngine;
  /** Threshold below which the agent emits low-confidence proposals. */
  uncertaintyThreshold?: number;
}

let actionCounter = 0;
const nextActionId = () => `act-${++actionCounter}`;

export class ClinicAgent {
  private readonly engine: ComplianceEngine;
  private readonly uncertaintyThreshold: number;

  constructor(opts: ClinicAgentOptions) {
    this.engine = opts.engine;
    this.uncertaintyThreshold = opts.uncertaintyThreshold ?? 0.7;
  }

  /**
   * Look at the simulator state and try to schedule the highest-priority
   * patient in the inbox. Returns null when there's nothing to do.
   */
  step(sim: ClinicSimulator): AgentDecisionResult | null {
    const patient = this.pickNextPatient(sim);
    if (!patient) return null;

    const slot = this.pickSlotFor(patient, sim);
    if (!slot) {
      // No slot available — agent escalates to a human via a needs_human action.
      return this.escalateNoSlot(patient, sim);
    }

    const confidence = this.estimateConfidence(patient, slot, sim);

    const action: AgentAction = {
      id: nextActionId(),
      domain: "clinic_scheduling",
      kind: "schedule_appointment",
      payload: {
        patientId: patient.id,
        slotId: slot.id,
        clinicianId: slot.clinicianId,
        acuity: patient.acuity,
        consentOnFile: patient.consentOnFile,
        region: "nz",
      },
      confidence,
      proposedAt: sim.world.now,
      rationale: `Booking ${patient.name} into ${slot.id} (acuity ${patient.acuity}, conf ${confidence.toFixed(2)}).`,
    };

    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });

    let applied = false;
    let summary = decision.explanation;

    if (decision.verdict === "allow") {
      applied = sim.applyBooking(patient.id, slot.id);
      summary = applied
        ? `Booked ${patient.name} into ${slot.id}.`
        : `Refused: simulator rejected booking for ${patient.name}.`;
    } else if (decision.verdict === "needs_human") {
      summary = `Awaiting human approval for ${patient.name} → ${slot.id}: ${decision.explanation}`;
    } else {
      // block — drop the patient back into the queue or skip them
      summary = `Blocked: ${decision.explanation}`;
      // For consent failures the patient will not be re-proposed automatically.
      if (!patient.consentOnFile) sim.drainInboxFor(patient.id);
    }

    return { decision, applied, summary, patient, slot };
  }

  /**
   * Apply a human-approved decision that the engine had marked as needs_human.
   * Returns true if the booking ultimately took effect.
   */
  approveAndApply(
    sim: ClinicSimulator,
    patientId: string,
    slotId: string,
  ): boolean {
    return sim.applyBooking(patientId, slotId);
  }

  // ── Internals ─────────────────────────────────────────────

  private pickNextPatient(sim: ClinicSimulator): Patient | undefined {
    if (sim.world.inbox.length === 0) return undefined;
    // Sort by acuity asc (1 = critical first), then by arrival time.
    const sorted = [...sim.world.inbox].sort((a, b) => {
      if (a.acuity !== b.acuity) return a.acuity - b.acuity;
      return a.arrivedAt - b.arrivedAt;
    });
    return sorted[0];
  }

  private pickSlotFor(patient: Patient, sim: ClinicSimulator): Slot | undefined {
    const free = sim.world.slots.filter((s) => !sim.world.occupiedSlots.includes(s.id));
    if (free.length === 0) return undefined;
    // Critical patients get the next slot regardless; routine patients
    // get the earliest slot at least 60 minutes from "now".
    if (patient.acuity <= 2) return free[0];
    return free.find((s) => s.startsAt >= sim.world.now + 60) ?? free[0];
  }

  private estimateConfidence(patient: Patient, slot: Slot, sim: ClinicSimulator): number {
    let conf = 0.95;
    // Pending emergency drops confidence on routine bookings.
    if (sim.world.pendingEmergency && patient.acuity >= 3) conf -= 0.4;
    // Late in the day → less certain about overflow risk.
    if (slot.startsAt > 60 * 6) conf -= 0.1;
    // Missing consent → very low confidence.
    if (!patient.consentOnFile) conf = 0.2;
    // Fairness drift creeping → also lowers confidence.
    if (sim.world.fairnessDriftScore > 0.15) conf -= 0.1;
    return Math.max(0, Math.min(1, conf));
  }

  private escalateNoSlot(patient: Patient, sim: ClinicSimulator): AgentDecisionResult {
    const action: AgentAction = {
      id: nextActionId(),
      domain: "clinic_scheduling",
      kind: "request_human_review",
      payload: { patientId: patient.id, reason: "no_slot_available" },
      confidence: 0.1,
      proposedAt: sim.world.now,
      rationale: `No slot left for ${patient.name} (acuity ${patient.acuity}). Escalating.`,
    };
    const decision = this.engine.evaluate(action, {
      now: sim.world.now,
      world: sim.world as unknown as Record<string, unknown>,
      uncertaintyThreshold: this.uncertaintyThreshold,
    });
    return {
      decision,
      applied: false,
      summary: `No slots available for ${patient.name} — handed off to a clinician.`,
      patient,
    };
  }
}
