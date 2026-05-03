// ═══════════════════════════════════════════════════════════════
// AAAIP — Pikau (Freight & Customs) Digital Twin
//
// Extended to wire FuelOracle NZ fuel pricing into route selection.
// Every assign_route task now carries:
//   fuelCostNzdEstimate — live-price NZD cost (diesel × litres)
//   fuelCostBudgetNzd  — controller-set NZD budget per route
// The FUEL_COST_CAP policy gates on NZD, not litres, so a fuel
// shock (e.g. Strait of Hormuz +74% diesel) automatically pushes
// over-budget routes into human review without changing the budget.
// ═══════════════════════════════════════════════════════════════

import { FuelOracle, type FuelPriceSnapshot } from "../utils/fuel-oracle";

export type PikauTaskKind = "assign_route" | "clear_delivery";

export interface PikauTask {
  id: string;
  kind: PikauTaskKind;
  label: string;
  driverId?: string;
  driverMinutesRemaining?: number;
  fuelBurnLitres?: number;
  fuelBudgetLitres?: number;
  /** Estimated fuel cost in NZD at current diesel price. */
  fuelCostNzdEstimate?: number;
  /** Controller-set NZD budget for this route. */
  fuelCostBudgetNzd?: number;
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
  /** Current fuel price snapshot from FuelOracle. */
  fuel: FuelPriceSnapshot;
  alerts: {
    fatigueBlocks: number;
    coldChainBreaks: number;
    sensorFailures: number;
    /** Routes whose NZD fuel cost exceeded budget. */
    fuelCostOverruns: number;
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
  readonly oracle: FuelOracle;
  private counter = 0;

  constructor(opts: PikauSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 41);
    this.arrivalRate = opts.arrivalRate ?? 0.8;
    this.oracle = new FuelOracle({ seed: (opts.seed ?? 41) + 3 });
    this.world = {
      now: 0,
      sensorReliability: 0.95,
      fleetSize: 24,
      inbox: [],
      completed: [],
      fuel: this.oracle.snapshot(),
      alerts: {
        fatigueBlocks: 0,
        coldChainBreaks: 0,
        sensorFailures: 0,
        fuelCostOverruns: 0,
      },
    };
  }

  tick() {
    this.world.now += 1;
    this.world.fuel = this.oracle.step();
    // Gentle sensor recovery over time.
    this.world.sensorReliability = Math.min(0.95, this.world.sensorReliability + 0.01);
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnTask());
    }
  }

  apply(task: PikauTask) {
    this.world.completed.push(task);
    this.world.inbox = this.world.inbox.filter((t) => t.id !== task.id);
    // Track NZD overruns for the live view.
    if (
      task.fuelCostNzdEstimate !== undefined &&
      task.fuelCostBudgetNzd !== undefined &&
      task.fuelCostNzdEstimate > task.fuelCostBudgetNzd
    ) {
      this.world.alerts.fuelCostOverruns += 1;
    }
    return true;
  }

  drop(taskId: string) {
    this.world.inbox = this.world.inbox.filter((t) => t.id !== taskId);
  }

  injectDriverFatigue() {
    this.counter += 1;
    const litres = 60;
    this.world.inbox.push({
      id: `pk-${this.counter}`,
      kind: "assign_route",
      label: "Urgent route for tired driver",
      driverId: "drv-007",
      driverMinutesRemaining: 15,
      fuelBurnLitres: litres,
      fuelBudgetLitres: 80,
      fuelCostNzdEstimate: round(litres * this.world.fuel.diesel),
      fuelCostBudgetNzd: 200,
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

  /**
   * Inject a Strait of Hormuz fuel shock — diesel +74%, petrol +30%.
   * Routes that were under the NZD budget before the shock will now
   * exceed it, pushing them into human-review territory.
   */
  injectFuelShock() {
    this.oracle.injectStraitOfHormuzShock();
    this.world.fuel = this.oracle.snapshot();
    // Recalculate NZD estimates for tasks already in the inbox.
    for (const task of this.world.inbox) {
      if (task.kind === "assign_route" && task.fuelBurnLitres !== undefined) {
        task.fuelCostNzdEstimate = round(task.fuelBurnLitres * this.world.fuel.diesel);
      }
    }
  }

  reset() {
    this.oracle.reset();
    this.world.now = 0;
    this.world.sensorReliability = 0.95;
    this.world.inbox = [];
    this.world.completed = [];
    this.world.fuel = this.oracle.snapshot();
    this.world.alerts = {
      fatigueBlocks: 0,
      coldChainBreaks: 0,
      sensorFailures: 0,
      fuelCostOverruns: 0,
    };
    this.counter = 0;
  }

  private spawnTask(): PikauTask {
    this.counter += 1;
    const id = `pk-${this.counter}`;
    if (this.rng() < 0.6) {
      // Route assignment — include live NZD cost estimate.
      const litres = Math.floor(40 + this.rng() * 80);
      const dieselPrice = this.world.fuel.diesel;
      return {
        id,
        kind: "assign_route",
        label: `Route #${this.counter}`,
        driverId: `drv-${Math.floor(this.rng() * 99)}`,
        driverMinutesRemaining: Math.floor(30 + this.rng() * 240),
        fuelBurnLitres: litres,
        fuelBudgetLitres: 90,
        fuelCostNzdEstimate: round(litres * dieselPrice),
        fuelCostBudgetNzd: 200,
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

function round(n: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
