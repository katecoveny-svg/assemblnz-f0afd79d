// ═══════════════════════════════════════════════════════════════
// AAAIP — Manaaki (Hospitality) Digital Twin
// ═══════════════════════════════════════════════════════════════

export type ManaakiTaskKind =
  | "confirm_reservation"
  | "assign_room"
  | "confirm_order"
  | "share_guest_profile";

export interface ManaakiTask {
  id: string;
  kind: ManaakiTaskKind;
  label: string;
  guestId?: string;
  accessibilityRequired?: string[];
  accessibilityProvided?: string[];
  allergenConflict?: boolean;
  marketingOptIn?: boolean;
  region: string;
  arrivedAt: number;
}

export interface ManaakiWorld {
  now: number;
  propertyCapacity: number;
  confirmedCount: number;
  inbox: ManaakiTask[];
  completed: ManaakiTask[];
  alerts: {
    allergenConflicts: number;
    overbookAttempts: number;
    missingAccessibility: number;
  };
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export interface ManaakiSimOptions {
  seed?: number;
  arrivalRate?: number;
  propertyCapacity?: number;
}

export class ManaakiSimulator {
  readonly world: ManaakiWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private counter = 0;

  constructor(opts: ManaakiSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 53);
    this.arrivalRate = opts.arrivalRate ?? 0.7;
    this.world = {
      now: 0,
      propertyCapacity: opts.propertyCapacity ?? 12,
      confirmedCount: 0,
      inbox: [],
      completed: [],
      alerts: { allergenConflicts: 0, overbookAttempts: 0, missingAccessibility: 0 },
    };
  }

  tick() {
    this.world.now += 1;
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnTask());
    }
  }

  apply(task: ManaakiTask): boolean {
    if (task.kind === "confirm_reservation") {
      if (this.world.confirmedCount >= this.world.propertyCapacity) return false;
      this.world.confirmedCount += 1;
    }
    this.world.completed.push(task);
    this.world.inbox = this.world.inbox.filter((t) => t.id !== task.id);
    return true;
  }

  drop(taskId: string) {
    this.world.inbox = this.world.inbox.filter((t) => t.id !== taskId);
  }

  injectAllergenConflict() {
    this.counter += 1;
    this.world.inbox.push({
      id: `mnk-${this.counter}`,
      kind: "confirm_order",
      label: "Order with allergen conflict",
      allergenConflict: true,
      region: "nz",
      arrivedAt: this.world.now,
    });
    this.world.alerts.allergenConflicts += 1;
  }

  injectAccessibilityMismatch() {
    this.counter += 1;
    this.world.inbox.push({
      id: `mnk-${this.counter}`,
      kind: "assign_room",
      label: "Assign room to mobility guest",
      accessibilityRequired: ["step_free", "grab_rails"],
      accessibilityProvided: ["step_free"],
      region: "nz",
      arrivedAt: this.world.now,
    });
    this.world.alerts.missingAccessibility += 1;
  }

  reset() {
    this.world.now = 0;
    this.world.confirmedCount = 0;
    this.world.inbox = [];
    this.world.completed = [];
    this.world.alerts = { allergenConflicts: 0, overbookAttempts: 0, missingAccessibility: 0 };
    this.counter = 0;
  }

  private spawnTask(): ManaakiTask {
    this.counter += 1;
    const id = `mnk-${this.counter}`;
    const roll = this.rng();
    if (roll < 0.4) {
      return {
        id, kind: "confirm_reservation", label: `Reservation #${this.counter}`,
        region: "nz", arrivedAt: this.world.now,
      };
    }
    if (roll < 0.65) {
      const needAccess = this.rng() < 0.2;
      const required = needAccess ? ["step_free"] : [];
      const provided = needAccess && this.rng() > 0.15 ? ["step_free"] : (needAccess ? [] : []);
      return {
        id, kind: "assign_room", label: `Room assignment #${this.counter}`,
        accessibilityRequired: required, accessibilityProvided: provided,
        region: "nz", arrivedAt: this.world.now,
      };
    }
    if (roll < 0.9) {
      return {
        id, kind: "confirm_order", label: `Order confirm #${this.counter}`,
        allergenConflict: this.rng() < 0.05, region: "nz", arrivedAt: this.world.now,
      };
    }
    return {
      id, kind: "share_guest_profile", label: `Share profile #${this.counter}`,
      marketingOptIn: this.rng() > 0.5, region: "nz", arrivedAt: this.world.now,
    };
  }
}
