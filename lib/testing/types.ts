/**
 * Agent testing protocol — V2 types (Phase 1C).
 *
 * Restored + generalised from the lost V1 protocol
 * (see BUNDLES-V4-SPEC-2026-06-29.pdf §7 and
 * assembl-supabase-backup-20260426/). The V1 world simulator was
 * construction-only (WAIHANGA). V2 generalises it: every bundle gets a
 * deterministic "day-in-the-life" world, and every scenario is graded on the
 * five-axis rubric.
 *
 * Nothing in here calls an LLM at type-definition time. The whole protocol is
 * designed to run deterministically offline so it can be a CI gate; the LLM
 * judge is an optional upgrade layer (see rubric.ts).
 */

// ─── Bundles ────────────────────────────────────────────────────────────────

/** The seven V4 bundles. Each maps to a marketplace category + a sim world. */
export type BundleId =
  | 'assembler' // construction — site-day world
  | 'forge' // sales/service — workshop-day world
  | 'practice' // clinical — clinic-day world
  | 'counsel' // legal — matter-day world
  | 'hearth' // family — family-week world
  | 'ensemble' // creative — studio-day world
  | 'visa'; // immigration — caseload-day world

/**
 * A deterministic world event fired by the simulator. Generalises the WAIHANGA
 * site events (site_checkin / upload_photo / submit_tender / escalate_hazard).
 */
export interface BundleEvent {
  /** monotonically increasing tick within the simulated day */
  tick: number;
  /** e.g. 'site_checkin', 'sales_enquiry', 'patient_consult' */
  kind: string;
  /** the logical route this event *should* be handled by (ground truth) */
  route: string;
  /** free-text describing the event, deterministic per seed */
  detail: string;
  /** arbitrary deterministic fixture payload */
  payload: Record<string, unknown>;
}

/** The world state a bundle simulator maintains across a simulated day. */
export interface WorldState {
  bundle: BundleId;
  seed: number;
  /** minutes since start-of-day (0 = 07:00) */
  clock: number;
  /** bundle-specific counters (headcount, bookings, caseload, …) */
  counters: Record<string, number>;
  /** bundle-specific caps (headcount cap, appointment slots, …) */
  caps: Record<string, number>;
  /** flags injected by red-flag scenarios (critical hazard, safeguarding, …) */
  flags: string[];
  /** the ordered log of events fired so far */
  log: BundleEvent[];
}

/** Config that defines one bundle's simulator world + router. */
export interface BundleConfig {
  id: BundleId;
  label: string;
  /** the marketplace category this bundle draws its agents from */
  category: string;
  /** the human name of the day being simulated */
  world: string;
  /** the event kinds this world can fire */
  eventKinds: string[];
  /** the valid logical routes a lead can pick within this bundle */
  routes: string[];
  /** starting caps for the world */
  caps: Record<string, number>;
  /**
   * Deterministic keyword router: maps a lowercased input to a route. Returns
   * null when it can't decide (→ the agent should ask a clarifying question).
   */
  route(input: string, flags: string[]): string | null;
}

// ─── Scenarios ──────────────────────────────────────────────────────────────

export type ScenarioKind =
  | 'routing'
  | 'red-flag'
  | 'ambiguous'
  | 'te-reo'
  | 'hostile';

/**
 * A single scenario. Mirrors the YAML shape in spec §7.2.1 but persisted as
 * JSON on disk (tests/agents/{bundle}.json) so it needs no YAML dep and loads
 * in both Node (vitest) and Deno (edge function).
 */
export interface Scenario {
  id: string;
  bundle: BundleId;
  kind: ScenarioKind;
  /** the user input the agent receives */
  input: string;
  /** the route the lead is expected to pick. 'clarify' = must ask, not route. */
  expected_route: string;
  /** deterministic RNG seed for the world this scenario runs against */
  seed: number;
  /** the event kind this scenario injects into the world (optional) */
  inject_event?: string;
  /** world flags this scenario forces on (e.g. 'critical_hazard') */
  inject_flags?: string[];
  /** behaviours the response should exhibit (LLM/keyword-judged, factuality) */
  expected_behaviours: string[];
  /** hard-stop checks — ONE fail = whole scenario fails */
  hard_stop_checks: string[];
  /** NZ facts that MUST appear verbatim (nz-accuracy, deterministic) */
  nz_facts: string[];
  /** strings that MUST NOT appear (nz-accuracy + hard-rule, deterministic) */
  forbidden: string[];
  /** sources the Mana Receipt must cite (factuality grounding) */
  expected_mana_receipt_sources: string[];
}

/** A whole bundle's scenario pack, as stored in tests/agents/{bundle}.json. */
export interface ScenarioPack {
  bundle: BundleId;
  version: string;
  scenarios: Scenario[];
}

// ─── Rubric ─────────────────────────────────────────────────────────────────

/** The five rubric axes + the always-on tikanga gate. */
export interface RubricScore {
  /** 0–10; LLM-judge vs cited source, deterministic fallback. Pass ≥ 8. */
  factuality: number;
  /** 0–10; deterministic NZ-fact checker. Pass ≥ 9. */
  nz_accuracy: number;
  /** 0–10; assembl-voice lint (+ optional LLM). Pass ≥ 7. */
  tone: number;
  /** pass/fail; every hard_stop_check must pass. */
  hard_rules: boolean;
  /** pass/fail; chosen route === expected_route (or a correct clarify). */
  route: boolean;
  /** pass/fail; Mead's five tests. A fail here fails the scenario regardless. */
  tikanga_gate: boolean;
}

export const RUBRIC_THRESHOLDS = {
  factuality: 8,
  nz_accuracy: 9,
  tone: 7,
} as const;

/** Per-axis explanation, surfaced to the builder (spec §7.2.2). */
export interface RubricDetail {
  axis: keyof RubricScore;
  passed: boolean;
  score?: number;
  threshold?: number;
  notes: string[];
}

export interface ScenarioResult {
  scenario_id: string;
  bundle: BundleId;
  passed: boolean;
  response: string;
  chosen_route: string | null;
  score: RubricScore;
  details: RubricDetail[];
  /** why the scenario failed, human-readable */
  failures: string[];
  duration_ms: number;
}

export interface SuiteResult {
  bundle: BundleId;
  passed: boolean;
  results: ScenarioResult[];
  total: number;
  failed: number;
}

/** The response an agent-under-test produces for one scenario. */
export interface AgentTurn {
  text: string;
  route: string | null;
  /** sources the agent cited (its Mana Receipt) */
  sources: string[];
}

/** Anything that can play the role of the agent under test. */
export interface AgentUnderTest {
  /** identify the implementation (for audit_entry) */
  id: string;
  respond(
    scenario: Scenario,
    world: WorldState,
    event: BundleEvent | null,
  ): Promise<AgentTurn>;
}
