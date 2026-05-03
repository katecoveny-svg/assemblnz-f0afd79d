// ═══════════════════════════════════════════════════════════════
// AAAIP — Arataki (Automotive) Digital Twin
//
// Simulates a NZ dealership responding to customer enquiries,
// finance quotes, test-drive requests and trade-in valuations.
// Every action is gated through ARATAKI_POLICIES, and the live
// fuel prices drive the ICE-vs-EV total-cost-of-ownership
// calculations the agent offers customers.
// ═══════════════════════════════════════════════════════════════

import { FuelOracle, type FuelPriceSnapshot } from "../utils/fuel-oracle";

export type ArataikiTaskKind =
  | "quote_finance"
  | "close_sale"
  | "share_with_partner"
  | "book_test_drive"
  | "quote_fuel_economy";

export type Powertrain = "petrol91" | "petrol95" | "diesel" | "ev";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  powertrain: Powertrain;
  /** Manufacturer-rated L/100km (or kWh/100km for EV). */
  ratedEconomy: number;
  odometerKm: number;
  /** Has the car been flagged by Waka Kotahi / MotorWeb? */
  odometerTamperFlag: boolean;
  /** Dealer inspection passed? */
  inspectionPassed: boolean;
  priceNzd: number;
  listed: boolean;
}

export interface CustomerEnquiry {
  id: string;
  name: string;
  email: string;
  kind: ArataikiTaskKind;
  vehicleId: string;
  /** For finance quotes. */
  cccfaDisclosuresAttached?: boolean;
  /** For fuel-economy quotes — the number we're about to say out loud. */
  quotedLPer100km?: number;
  /** For share_with_partner — did the customer opt in? */
  customerOptIn?: boolean;
  arrivedAt: number;
}

export interface ArataikiWorld {
  now: number;
  mvtrNumber: string;
  inventory: Vehicle[];
  inbox: CustomerEnquiry[];
  /** Enquiries the agent successfully responded to. */
  handled: CustomerEnquiry[];
  /** Enquiries rejected by the compliance engine. */
  rejected: CustomerEnquiry[];
  /** Current fuel price snapshot. */
  fuel: FuelPriceSnapshot;
  alerts: {
    cccfaBlocks: number;
    fairTradingBlocks: number;
    odometerBlocks: number;
    consentBlocks: number;
  };
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const NAMES = ["Aroha", "Sam", "Priya", "Wiremu", "Niko", "Mere", "Tama", "Hera", "Liam", "Anika"];
const MAKES: Array<{ make: string; models: Array<{ model: string; powertrain: Powertrain; rated: number; price: number }> }> = [
  {
    make: "Toyota",
    models: [
      { model: "Corolla Hybrid", powertrain: "petrol91", rated: 4.1, price: 39900 },
      { model: "RAV4 Hybrid", powertrain: "petrol91", rated: 5.2, price: 52990 },
      { model: "Hilux", powertrain: "diesel", rated: 8.1, price: 65990 },
    ],
  },
  {
    make: "Tesla",
    models: [
      { model: "Model 3", powertrain: "ev", rated: 15.4, price: 72900 },
      { model: "Model Y", powertrain: "ev", rated: 17.1, price: 78900 },
    ],
  },
  {
    make: "BYD",
    models: [
      { model: "Atto 3", powertrain: "ev", rated: 16.8, price: 49990 },
      { model: "Seal", powertrain: "ev", rated: 15.9, price: 59990 },
    ],
  },
  {
    make: "Ford",
    models: [
      { model: "Ranger Wildtrak", powertrain: "diesel", rated: 8.4, price: 75990 },
    ],
  },
];

export interface ArataikiSimOptions {
  seed?: number;
  arrivalRate?: number;
  mvtrNumber?: string;
}

export class ArataikiSimulator {
  readonly world: ArataikiWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  readonly oracle: FuelOracle;
  private counter = 0;

  constructor(opts: ArataikiSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 109);
    this.arrivalRate = opts.arrivalRate ?? 0.65;
    this.oracle = new FuelOracle({ seed: (opts.seed ?? 109) + 1 });

    const inventory: Vehicle[] = [];
    let vid = 0;
    for (const m of MAKES) {
      for (const model of m.models) {
        vid += 1;
        inventory.push({
          id: `veh-${vid}`,
          make: m.make,
          model: model.model,
          year: 2024 + Math.floor(this.rng() * 2),
          powertrain: model.powertrain,
          ratedEconomy: model.rated,
          odometerKm: Math.floor(15000 + this.rng() * 60000),
          odometerTamperFlag: false,
          inspectionPassed: true,
          priceNzd: model.price,
          listed: true,
        });
      }
    }

    this.world = {
      now: 0,
      mvtrNumber: opts.mvtrNumber ?? "MVTR-12345",
      inventory,
      inbox: [],
      handled: [],
      rejected: [],
      fuel: this.oracle.snapshot(),
      alerts: {
        cccfaBlocks: 0,
        fairTradingBlocks: 0,
        odometerBlocks: 0,
        consentBlocks: 0,
      },
    };
  }

  tick() {
    this.world.now += 1;
    this.world.fuel = this.oracle.step();
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnEnquiry());
    }
  }

  handle(enquiryId: string): boolean {
    const e = this.world.inbox.find((x) => x.id === enquiryId);
    if (!e) return false;
    this.world.handled.push(e);
    this.world.inbox = this.world.inbox.filter((x) => x.id !== enquiryId);
    return true;
  }

  reject(enquiryId: string): boolean {
    const e = this.world.inbox.find((x) => x.id === enquiryId);
    if (!e) return false;
    this.world.rejected.push(e);
    this.world.inbox = this.world.inbox.filter((x) => x.id !== enquiryId);
    return true;
  }

  drop(enquiryId: string) {
    this.world.inbox = this.world.inbox.filter((x) => x.id !== enquiryId);
  }

  // ── Demo scenario injectors ────────────────────────────────

  injectFuelShock() {
    this.oracle.injectStraitOfHormuzShock();
    this.world.fuel = this.oracle.snapshot();
  }

  injectMisleadingEconomyQuote() {
    const veh = this.world.inventory.find((v) => v.powertrain !== "ev");
    if (!veh) return;
    this.counter += 1;
    this.world.inbox.push({
      id: `enq-${this.counter}`,
      name: "Suspicious Lead",
      email: "lead@example.com",
      kind: "quote_fuel_economy",
      vehicleId: veh.id,
      quotedLPer100km: Math.max(1, veh.ratedEconomy - 2.5),
      arrivedAt: this.world.now,
    });
    this.world.alerts.fairTradingBlocks += 1;
  }

  injectUndisclosedFinance() {
    const veh = this.world.inventory[0];
    this.counter += 1;
    this.world.inbox.push({
      id: `enq-${this.counter}`,
      name: "Finance Lead",
      email: "finance@example.com",
      kind: "quote_finance",
      vehicleId: veh.id,
      cccfaDisclosuresAttached: false,
      arrivedAt: this.world.now,
    });
    this.world.alerts.cccfaBlocks += 1;
  }

  injectTamperedVehicle() {
    const veh = this.world.inventory[Math.floor(this.rng() * this.world.inventory.length)];
    veh.odometerTamperFlag = true;
    this.counter += 1;
    this.world.inbox.push({
      id: `enq-${this.counter}`,
      name: "Unsuspecting Buyer",
      email: "buyer@example.com",
      kind: "close_sale",
      vehicleId: veh.id,
      arrivedAt: this.world.now,
    });
    this.world.alerts.odometerBlocks += 1;
  }

  reset() {
    this.world.now = 0;
    this.world.inbox = [];
    this.world.handled = [];
    this.world.rejected = [];
    this.world.alerts = {
      cccfaBlocks: 0,
      fairTradingBlocks: 0,
      odometerBlocks: 0,
      consentBlocks: 0,
    };
    for (const v of this.world.inventory) {
      v.odometerTamperFlag = false;
      v.inspectionPassed = true;
      v.listed = true;
    }
    this.oracle.reset();
    this.world.fuel = this.oracle.snapshot();
    this.counter = 0;
  }

  // ── Internals ────────────────────────────────────────────

  private spawnEnquiry(): CustomerEnquiry {
    this.counter += 1;
    const veh = this.world.inventory[Math.floor(this.rng() * this.world.inventory.length)];
    const kindRoll = this.rng();
    let kind: ArataikiTaskKind;
    if (kindRoll < 0.35) kind = "quote_fuel_economy";
    else if (kindRoll < 0.55) kind = "book_test_drive";
    else if (kindRoll < 0.8) kind = "quote_finance";
    else if (kindRoll < 0.95) kind = "close_sale";
    else kind = "share_with_partner";

    return {
      id: `enq-${this.counter}`,
      name: NAMES[Math.floor(this.rng() * NAMES.length)],
      email: `lead${this.counter}@example.com`,
      kind,
      vehicleId: veh.id,
      cccfaDisclosuresAttached: kind === "quote_finance" ? this.rng() > 0.12 : undefined,
      quotedLPer100km:
        kind === "quote_fuel_economy" && veh.powertrain !== "ev"
          ? veh.ratedEconomy + (this.rng() - 0.6) * 0.3
          : undefined,
      customerOptIn: kind === "share_with_partner" ? this.rng() > 0.4 : undefined,
      arrivedAt: this.world.now,
    };
  }
}
