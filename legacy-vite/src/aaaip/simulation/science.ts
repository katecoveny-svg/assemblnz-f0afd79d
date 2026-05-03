// ═══════════════════════════════════════════════════════════════
// AAAIP — Drug Screening Digital Twin
// A deterministic, seedable simulator that produces a stream of
// candidate compounds and a 96-well plate the agent must dispatch
// them into. Toxicity scores, provenance and IRB metadata are
// generated so the policy engine has something to evaluate.
// ═══════════════════════════════════════════════════════════════

export interface Compound {
  id: string;
  name: string;
  /** Library / lot identifier — empty string means provenance is missing. */
  provenance: string;
  usesHumanTissue: boolean;
  /** Optional IRB approval if usesHumanTissue is true. */
  irbApprovalId?: string;
  /** Predicted toxicity score, 0–1. */
  toxicityScore: number;
  /** Proposed dose in micromolar. */
  doseMicromolar: number;
  arrivedAt: number;
}

export interface Well {
  id: string;
  /** Whether the well is reserved as a control (untouchable). */
  isControl: boolean;
  occupiedBy?: string;
}

export interface ScienceWorld {
  now: number;
  /** Validated maximum dosage for the active assay. */
  maxDoseMicromolar: number;
  /** Pipeline / model version — recorded on every action for reproducibility. */
  pipelineVersion: string;
  /** Wells ids that are reserved as controls — referenced by the policy. */
  controlWells: string[];
  /** All wells in the active plate. */
  wells: Well[];
  /** Pending compounds the agent hasn't dispatched yet. */
  inbox: Compound[];
  /** Compounds the agent has successfully screened. */
  completed: Array<{ compound: Compound; wellId: string; at: number }>;
  /** Hits — compounds that produced a positive readout. */
  hits: number;
}

// ── Pseudo-random LCG ─────────────────────────────────────────

function makeRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

const COMPOUND_PREFIXES = [
  "AKT",
  "BRD",
  "CDK",
  "EGFR",
  "FXR",
  "GSK",
  "HDAC",
  "JAK",
];

// ── Simulator ─────────────────────────────────────────────────

export interface ScienceSimOptions {
  seed?: number;
  /** Number of wells per plate (96 by default). */
  plateSize?: number;
  /** Probability per tick a new compound is proposed. */
  arrivalRate?: number;
  /** Validated max dose for the active assay. */
  maxDoseMicromolar?: number;
}

export class ScienceSimulator {
  readonly world: ScienceWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private compoundCounter = 0;

  constructor(opts: ScienceSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 23);
    this.arrivalRate = opts.arrivalRate ?? 0.7;
    const plateSize = opts.plateSize ?? 96;

    const wells: Well[] = [];
    const controlWells: string[] = [];
    for (let i = 0; i < plateSize; i++) {
      const id = `well-${i}`;
      // Reserve the first 8 wells as positive / negative controls.
      const isControl = i < 8;
      wells.push({ id, isControl });
      if (isControl) controlWells.push(id);
    }

    this.world = {
      now: 0,
      maxDoseMicromolar: opts.maxDoseMicromolar ?? 100,
      pipelineVersion: "screen-pipeline-1.4.0",
      controlWells,
      wells,
      inbox: [],
      completed: [],
      hits: 0,
    };
  }

  /** Advance one tick. */
  tick() {
    this.world.now += 1;
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnCompound());
    }
  }

  /**
   * Apply a screening to a free, non-control well. Returns the well id
   * on success or null on rejection (defence-in-depth — caller should
   * have run the policy engine first).
   */
  applyScreening(compoundId: string, wellId: string): boolean {
    const compound = this.world.inbox.find((c) => c.id === compoundId);
    if (!compound) return false;
    const well = this.world.wells.find((w) => w.id === wellId);
    if (!well || well.isControl || well.occupiedBy) return false;

    well.occupiedBy = compoundId;
    this.world.completed.push({
      compound,
      wellId,
      at: this.world.now,
    });
    this.world.inbox = this.world.inbox.filter((c) => c.id !== compoundId);
    // 20% of clean compounds register as a hit.
    if (this.rng() < 0.2 && compound.toxicityScore < 0.5) this.world.hits += 1;
    return true;
  }

  dropCompound(compoundId: string) {
    this.world.inbox = this.world.inbox.filter((c) => c.id !== compoundId);
  }

  freeWells(): Well[] {
    return this.world.wells.filter((w) => !w.isControl && !w.occupiedBy);
  }

  /** Force-inject a compound that violates a policy — used by demo button. */
  injectBadCompound() {
    this.compoundCounter += 1;
    this.world.inbox.push({
      id: `cmp-${this.compoundCounter}`,
      name: `BAD-${this.compoundCounter}`,
      provenance: "", // missing on purpose
      usesHumanTissue: true, // missing IRB on purpose
      toxicityScore: 0.95, // above the safety threshold
      doseMicromolar: this.world.maxDoseMicromolar + 50,
      arrivedAt: this.world.now,
    });
  }

  reset() {
    this.world.now = 0;
    for (const w of this.world.wells) if (!w.isControl) w.occupiedBy = undefined;
    this.world.inbox = [];
    this.world.completed = [];
    this.world.hits = 0;
    this.compoundCounter = 0;
  }

  // ── Internals ────────────────────────────────────────────

  private spawnCompound(): Compound {
    this.compoundCounter += 1;
    const usesHumanTissue = this.rng() < 0.3;
    const provenance =
      this.rng() < 0.95
        ? `lib-${COMPOUND_PREFIXES[Math.floor(this.rng() * COMPOUND_PREFIXES.length)]}-${Math.floor(this.rng() * 9000) + 1000}`
        : ""; // 5% of compounds arrive with missing provenance — exercises the policy
    return {
      id: `cmp-${this.compoundCounter}`,
      name: `${COMPOUND_PREFIXES[Math.floor(this.rng() * COMPOUND_PREFIXES.length)]}-${this.compoundCounter}`,
      provenance,
      usesHumanTissue,
      irbApprovalId: usesHumanTissue && this.rng() > 0.15 ? `HDEC-2026-${100 + this.compoundCounter}` : undefined,
      toxicityScore: this.rng(),
      doseMicromolar: 5 + Math.floor(this.rng() * 110),
      arrivedAt: this.world.now,
    };
  }
}
