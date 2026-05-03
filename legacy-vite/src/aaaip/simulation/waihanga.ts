// ═══════════════════════════════════════════════════════════════
// AAAIP — Waihanga (Construction) Digital Twin
// Deterministic simulator producing site events: worker check-ins,
// photo uploads, tender drafts, and hazard reports. Fed into
// WaihangaAgent which gates every action through WAIHANGA_POLICIES.
// ═══════════════════════════════════════════════════════════════

export type WaihangaTaskKind =
  | "site_checkin"
  | "upload_photo"
  | "submit_tender"
  | "escalate_hazard";

export interface WaihangaTask {
  id: string;
  kind: WaihangaTaskKind;
  label: string;
  zone?: string;
  /** For site_checkin: has the worker confirmed PPE? */
  ppeConfirmed?: boolean;
  /** For upload_photo: does the photo show identifiable workers? */
  containsWorkers?: boolean;
  workerConsent?: boolean;
  /** For submit_tender: is human sign-off attached? */
  humanSignoff?: boolean;
  /** For escalate_hazard: severity 1–5. */
  severity?: number;
  arrivedAt: number;
}

export interface WaihangaWorld {
  now: number;
  headcount: number;
  headcountCap: number;
  criticalHazardZones: string[];
  zones: string[];
  inbox: WaihangaTask[];
  completed: WaihangaTask[];
}

function makeRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export interface WaihangaSimOptions {
  seed?: number;
  arrivalRate?: number;
  headcountCap?: number;
}

export class WaihangaSimulator {
  readonly world: WaihangaWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private taskCounter = 0;

  constructor(opts: WaihangaSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 31);
    this.arrivalRate = opts.arrivalRate ?? 0.75;
    this.world = {
      now: 0,
      headcount: 0,
      headcountCap: opts.headcountCap ?? 40,
      criticalHazardZones: [],
      zones: ["gate", "foundations", "slab", "frame", "roof", "interior"],
      inbox: [],
      completed: [],
    };
  }

  tick() {
    this.world.now += 1;
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnTask());
    }
  }

  apply(task: WaihangaTask): boolean {
    if (task.kind === "site_checkin") {
      if (this.world.headcount >= this.world.headcountCap) return false;
      this.world.headcount += 1;
    }
    if (task.kind === "escalate_hazard" && task.zone) {
      this.world.criticalHazardZones = this.world.criticalHazardZones.filter(
        (z) => z !== task.zone,
      );
    }
    this.world.completed.push(task);
    this.world.inbox = this.world.inbox.filter((t) => t.id !== task.id);
    return true;
  }

  drop(taskId: string) {
    this.world.inbox = this.world.inbox.filter((t) => t.id !== taskId);
  }

  injectCriticalHazard(zone: string = "frame") {
    if (!this.world.criticalHazardZones.includes(zone)) {
      this.world.criticalHazardZones.push(zone);
    }
    this.taskCounter += 1;
    this.world.inbox.push({
      id: `waihanga-${this.taskCounter}`,
      kind: "escalate_hazard",
      label: `Critical hazard on ${zone}`,
      zone,
      severity: 5,
      arrivedAt: this.world.now,
    });
  }

  injectMissingPPE() {
    this.taskCounter += 1;
    this.world.inbox.push({
      id: `waihanga-${this.taskCounter}`,
      kind: "site_checkin",
      label: "Worker check-in (no PPE)",
      zone: "gate",
      ppeConfirmed: false,
      arrivedAt: this.world.now,
    });
  }

  reset() {
    this.world.now = 0;
    this.world.headcount = 0;
    this.world.criticalHazardZones = [];
    this.world.inbox = [];
    this.world.completed = [];
    this.taskCounter = 0;
  }

  private spawnTask(): WaihangaTask {
    this.taskCounter += 1;
    const roll = this.rng();
    const id = `waihanga-${this.taskCounter}`;
    const zone = this.world.zones[Math.floor(this.rng() * this.world.zones.length)];
    if (roll < 0.55) {
      return {
        id,
        kind: "site_checkin",
        label: `Check-in at ${zone}`,
        zone,
        ppeConfirmed: this.rng() > 0.08,
        arrivedAt: this.world.now,
      };
    }
    if (roll < 0.85) {
      const containsWorkers = this.rng() < 0.45;
      return {
        id,
        kind: "upload_photo",
        label: `Photo: ${zone} progress`,
        zone,
        containsWorkers,
        workerConsent: containsWorkers && this.rng() > 0.2,
        arrivedAt: this.world.now,
      };
    }
    return {
      id,
      kind: "submit_tender",
      label: `Tender draft #${this.taskCounter}`,
      humanSignoff: this.rng() > 0.6,
      arrivedAt: this.world.now,
    };
  }
}
