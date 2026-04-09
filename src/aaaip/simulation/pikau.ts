// ═══════════════════════════════════════════════════════════════
// AAAIP — Pikau (Freight & Customs) Digital Twin
// ═══════════════════════════════════════════════════════════════

export type PikauTaskKind = "assign_route" | "clear_delivery";

export interface PikauTask {
  id: string;
  kind: PikauTaskKind;
  label: string;
  driverId?: string;
  driverMinutesRemaining?: number;
  fuelBurnLitres?: number;
  fuelBudgetLitres?: number;
  reeferTempC?: number;
  targetTempC?: number;
  region: string;
  arrivedAt: number;
}

export interface PikauWorld {
  now: number;
  sensorReliability: number;
  fleetSize: number;
  inbox: PikauTask[];
  completed: PikauTask[];
  alerts: {
    fatigueBlocks: number;
    coldChainBreaks: number;
    sensorFailures: number;
  };
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export interface PikauSimOptions {
  seed?: number;
  arrivalRate?: number;
}

export class PikauSimulator {
  readonly world: PikauWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private counter = 0;

  constructor(opts: PikauSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 41);
    this.arrivalRate = opts.arrivalRate ?? 0.8;
    this.world = {
      now: 0,
      sensorReliability: 0.95,
      fleetSize: 24,
      inbox: [],
      completed: [],
      alerts: { fatigueBlocks: 0, coldChainBreaks: 0, sensorFailures: 0 },
    };
  }

  tick() {
    this.world.now += 1;
    // Gentle sensor recovery over time.
    this.world.sensorReliability = Math.min(0.95, this.world.sensorReliability + 0.01);
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnTask());
    }
  }

  apply(task: PikauTask) {
    this.world.completed.push(task);
    this.world.inbox = this.world.inbox.filter((t) => t.id !== task.id);
    return true;
  }

  drop(taskId: string) {
    this.world.inbox = this.world.inbox.filter((t) => t.id !== taskId);
  }

  injectDriverFatigue() {
    this.counter += 1;
    this.world.inbox.push({
      id: `pk-${this.counter}`,
      kind: "assign_route",
      label: "Urgent route for tired driver",
      driverId: "drv-007",
      driverMinutesRemaining: 15,
      fuelBurnLitres: 60,
      fuelBudgetLitres: 80,
      region: "nz",
      arrivedAt: this.world.now,
    });
    this.world.alerts.fatigueBlocks += 1;
  }

  injectColdChainBreak() {
    this.counter += 1;
    this.world.inbox.push({
      id: `pk-${this.counter}`,
      kind: "clear_delivery",
      label: "Reefer container clear",
      reeferTempC: 10,
      targetTempC: 4,
      region: "nz",
      arrivedAt: this.world.now,
    });
    this.world.alerts.coldChainBreaks += 1;
  }

  injectSensorFailure() {
    this.world.sensorReliability = 0.55;
    this.world.alerts.sensorFailures += 1;
  }

  reset() {
    this.world.now = 0;
    this.world.sensorReliability = 0.95;
    this.world.inbox = [];
    this.world.completed = [];
    this.world.alerts = { fatigueBlocks: 0, coldChainBreaks: 0, sensorFailures: 0 };
    this.counter = 0;
  }

  private spawnTask(): PikauTask {
    this.counter += 1;
    const id = `pk-${this.counter}`;
    if (this.rng() < 0.6) {
      // Route assignment
      return {
        id,
        kind: "assign_route",
        label: `Route #${this.counter}`,
        driverId: `drv-${Math.floor(this.rng() * 99)}`,
        driverMinutesRemaining: Math.floor(30 + this.rng() * 240),
        fuelBurnLitres: Math.floor(40 + this.rng() * 80),
        fuelBudgetLitres: 90,
        region: this.rng() < 0.97 ? "nz" : "au",
        arrivedAt: this.world.now,
      };
    }
    return {
      id,
      kind: "clear_delivery",
      label: `Reefer ${id}`,
      reeferTempC: 4 + (this.rng() - 0.5) * 2,
      targetTempC: 4,
      region: "nz",
      arrivedAt: this.world.now,
    };
  }
}
