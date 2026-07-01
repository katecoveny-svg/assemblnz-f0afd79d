/**
 * Bundle simulator — the generalised WAIHANGA digital twin (Phase 1C).
 *
 * V1 shipped a construction-only deterministic simulator: a world state (time,
 * headcount, headcount cap, critical-hazard zones) plus injectable site events
 * (site_checkin / upload_photo / submit_tender / escalate_hazard) and inject
 * methods (injectCriticalHazard, injectMissingPPE). See the recovered WAIHANGA
 * prompt in the backup migration 20260424002842.
 *
 * V2 lifts that pattern into a `bundle_simulator` that fires deterministic
 * events for any bundle: a site event for Assembler, a sales/service event for
 * Forge, a consult for Practice, a legal query for Counsel, and so on.
 *
 * Determinism is the whole point — same (bundle, seed) always produces the same
 * world and the same event stream, so the CI gate never flakes. Never calls an
 * LLM. The RNG is Mulberry32, carried over verbatim from the V1 generators.
 */

import { BUNDLES } from './bundles';
import type { BundleEvent, BundleId, WorldState } from './types';

// ── Seeded RNG (Mulberry32) — same as the V1 kete generators ─────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic "day-in-the-life" event templates per bundle event kind. */
const EVENT_DETAIL: Record<string, string> = {
  // assembler (site-day)
  site_checkin: 'Worker requests site check-in at the gate',
  upload_photo: 'Site photo with identifiable workers queued for upload',
  submit_tender: 'Draft tender ready to submit to the principal',
  escalate_hazard: 'Critical hazard reported in an active zone',
  // forge (workshop-day)
  sales_enquiry: 'Walk-in enquiry about a new unit',
  service_booking: 'Customer wants to book a service / WoF',
  quote_request: 'Customer asks for a repair quote',
  stock_check: 'Parts availability check',
  // practice (clinic-day)
  patient_consult: 'Patient presents with a new complaint',
  triage: 'Reception triages a walk-in',
  prescription_query: 'Repeat prescription query',
  referral: 'Referral decision required',
  // counsel (matter-day)
  legal_query: 'Client asks a legal question',
  contract_review: 'Contract sent in for review',
  dispute: 'Client raises a dispute',
  compliance_check: 'Client asks whether an action is compliant',
  // hearth (family-week)
  school_notice: 'A school pānui lands in the family inbox',
  appointment: 'A family appointment needs booking',
  budget_query: 'A household budget question comes up',
  care_task: 'A care task needs organising',
  // ensemble (studio-day)
  brief_intake: 'A creative brief comes in',
  content_request: 'A content piece is requested',
  brand_check: 'An asset needs a brand check',
  schedule: 'A publishing schedule needs planning',
  // visa (caseload-day)
  visa_query: 'A client asks about a visa pathway',
  document_check: 'Supporting documents need checking',
  eligibility: 'An eligibility assessment is requested',
  status: 'A client asks about application status',
};

export class BundleSimulator {
  readonly state: WorldState;
  private rand: () => number;

  constructor(bundle: BundleId, seed: number) {
    const cfg = BUNDLES[bundle];
    if (!cfg) throw new Error(`Unknown bundle: ${bundle}`);
    this.rand = mulberry32(seed);
    this.state = {
      bundle,
      seed,
      clock: 0,
      counters: {},
      caps: { ...cfg.caps },
      flags: [],
      log: [],
    };
  }

  /** Inject a world flag (the generalised injectCriticalHazard / injectMissingPPE). */
  inject(flag: string): this {
    if (!this.state.flags.includes(flag)) this.state.flags.push(flag);
    return this;
  }

  /**
   * Fire one deterministic event of the given kind (or a seed-picked kind).
   * Advances the clock by a deterministic amount and records the event.
   */
  fire(kind?: string): BundleEvent {
    const cfg = BUNDLES[this.state.bundle];
    const chosen =
      kind && cfg.eventKinds.includes(kind)
        ? kind
        : cfg.eventKinds[Math.floor(this.rand() * cfg.eventKinds.length)];

    // Advance the simulated clock by 15–45 min, deterministically.
    this.state.clock += 15 + Math.floor(this.rand() * 30);
    this.state.counters[chosen] = (this.state.counters[chosen] ?? 0) + 1;

    // Ground-truth route: hazard-like injected flags force the safety route,
    // otherwise the config router decides from the event detail.
    const detail = EVENT_DETAIL[chosen] ?? `${chosen} event`;
    const route = cfg.route(detail, this.state.flags) ?? cfg.routes[0];

    const event: BundleEvent = {
      tick: this.state.log.length + 1,
      kind: chosen,
      route,
      detail,
      payload: {
        clock_minutes: this.state.clock,
        flags: [...this.state.flags],
        seed: this.state.seed,
      },
    };
    this.state.log.push(event);
    return event;
  }

  /** Fire a whole simulated day of `n` events. Deterministic per seed. */
  runDay(n = 6): BundleEvent[] {
    for (let i = 0; i < n; i++) this.fire();
    return this.state.log;
  }
}

/**
 * Convenience: build a simulator for a scenario, inject its flags, and fire the
 * scenario's event (if any). Returns the world + the fired event (or null).
 */
export function simulateForScenario(
  bundle: BundleId,
  seed: number,
  injectFlags: string[] = [],
  injectEvent?: string,
): { world: WorldState; event: BundleEvent | null } {
  const sim = new BundleSimulator(bundle, seed);
  for (const f of injectFlags) sim.inject(f);
  const event = injectEvent ? sim.fire(injectEvent) : null;
  return { world: sim.state, event };
}
