// ═══════════════════════════════════════════════════════════════
// AAAIP — Clinic Scheduling Digital Twin
// A deterministic, seedable simulator that produces patient-arrival
// and emergency events the agent must respond to. Designed to be
// driven by the dashboard's tick loop or by tests.
// ═══════════════════════════════════════════════════════════════

export type Acuity = 1 | 2 | 3 | 4 | 5; // 1 = critical, 5 = routine

export interface Patient {
  id: string;
  name: string;
  acuity: Acuity;
  consentOnFile: boolean;
  /** Demographic bucket used by the fairness drift signal. */
  cohort: "A" | "B";
  arrivedAt: number;
}

export interface Slot {
  id: string;
  /** Minute offset from sim start. */
  startsAt: number;
  durationMins: number;
  clinicianId: string;
}

export type SimEvent =
  | { type: "patient_arrived"; tick: number; patient: Patient }
  | { type: "emergency"; tick: number; patient: Patient }
  | { type: "tick"; tick: number };

export interface ClinicWorld {
  now: number;
  slots: Slot[];
  occupiedSlots: string[];
  bookings: Array<{ patientId: string; slotId: string; bookedAt: number }>;
  pendingEmergency: boolean;
  fairnessDriftScore: number;
  /** Inbox the agent will pull from on each tick. */
  inbox: Patient[];
}

// ── Pseudo-random — small LCG so tests are reproducible ───────

function makeRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

const FIRST_NAMES = [
  "Aroha",
  "Tane",
  "Mere",
  "Hemi",
  "Kahu",
  "Nikau",
  "Ria",
  "Tui",
  "Rangi",
  "Wiremu",
];

function patientName(rng: () => number, n: number) {
  return `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} #${n}`;
}

// ── Clinic simulator ──────────────────────────────────────────

export interface ClinicSimOptions {
  seed?: number;
  /** How many slots are pre-loaded for the day. */
  slotsPerDay?: number;
  /** Probability per tick a routine patient arrives. */
  arrivalRate?: number;
  /** Probability per tick an emergency arrives. */
  emergencyRate?: number;
}

export class ClinicSimulator {
  readonly world: ClinicWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private readonly emergencyRate: number;
  private patientCounter = 0;
  /** Memo of every patient ever spawned, keyed by id, for fairness analysis. */
  private readonly spawned: Map<string, Patient> = new Map();

  constructor(opts: ClinicSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 42);
    this.arrivalRate = opts.arrivalRate ?? 0.6;
    this.emergencyRate = opts.emergencyRate ?? 0.08;
    const slotsPerDay = opts.slotsPerDay ?? 16;

    const slots: Slot[] = [];
    for (let i = 0; i < slotsPerDay; i++) {
      slots.push({
        id: `slot-${i}`,
        startsAt: i * 30, // every 30 min
        durationMins: 30,
        clinicianId: i % 2 === 0 ? "dr_pohatu" : "dr_walker",
      });
    }

    this.world = {
      now: 0,
      slots,
      occupiedSlots: [],
      bookings: [],
      pendingEmergency: false,
      fairnessDriftScore: 0,
      inbox: [],
    };
  }

  /** Advance the sim by one tick and return any events that fired. */
  tick(): SimEvent[] {
    this.world.now += 1;
    const events: SimEvent[] = [{ type: "tick", tick: this.world.now }];

    if (this.rng() < this.emergencyRate) {
      const patient = this.spawnPatient(1);
      this.world.pendingEmergency = true;
      this.world.inbox.push(patient);
      events.push({ type: "emergency", tick: this.world.now, patient });
    } else if (this.rng() < this.arrivalRate) {
      const acuity = (3 + Math.floor(this.rng() * 3)) as Acuity;
      const patient = this.spawnPatient(acuity);
      this.world.inbox.push(patient);
      events.push({ type: "patient_arrived", tick: this.world.now, patient });
    }

    this.world.fairnessDriftScore = this.computeFairnessDrift();
    return events;
  }

  /**
   * Mark a slot as booked. Idempotent — caller should pre-check via
   * the policy engine, but this still refuses double-bookings as a
   * defence-in-depth.
   */
  applyBooking(patientId: string, slotId: string): boolean {
    if (this.world.occupiedSlots.includes(slotId)) return false;
    const patient = this.world.inbox.find((p) => p.id === patientId);
    if (!patient) return false;
    this.world.occupiedSlots.push(slotId);
    this.world.bookings.push({ patientId, slotId, bookedAt: this.world.now });
    this.world.inbox = this.world.inbox.filter((p) => p.id !== patientId);
    if (patient.acuity === 1) this.world.pendingEmergency = false;
    return true;
  }

  /** Pop the next patient from the inbox without booking them. */
  drainInboxFor(patientId: string) {
    this.world.inbox = this.world.inbox.filter((p) => p.id !== patientId);
  }

  /** Look up the demographic record for fairness reporting. */
  patientHistory(id: string): Patient | undefined {
    return this.spawned.get(id);
  }

  reset() {
    this.world.now = 0;
    this.world.occupiedSlots = [];
    this.world.bookings = [];
    this.world.pendingEmergency = false;
    this.world.fairnessDriftScore = 0;
    this.world.inbox = [];
    this.patientCounter = 0;
    this.spawned.clear();
  }

  private spawnPatient(acuity: Acuity): Patient {
    this.patientCounter += 1;
    const cohort = this.rng() < 0.5 ? "A" : "B";
    const patient: Patient = {
      id: `pt-${this.patientCounter}`,
      name: patientName(this.rng, this.patientCounter),
      acuity,
      // 92% of patients have consent on file — the rest exercise the consent policy.
      consentOnFile: this.rng() > 0.08,
      cohort,
      arrivedAt: this.world.now,
    };
    this.spawned.set(patient.id, patient);
    return patient;
  }

  private computeFairnessDrift(): number {
    const waits: Record<"A" | "B", number[]> = { A: [], B: [] };
    for (const b of this.world.bookings) {
      const p = this.spawned.get(b.patientId);
      if (!p) continue;
      waits[p.cohort].push(b.bookedAt - p.arrivedAt);
    }
    const mean = (xs: number[]) =>
      xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
    const drift = Math.abs(mean(waits.A) - mean(waits.B));
    // Normalise to 0–1ish so the policy threshold (0.25) means something.
    return Math.min(1, drift / 10);
  }
}
