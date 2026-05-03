// ═══════════════════════════════════════════════════════════════
// AAAIP — Fuel Oracle
//
// Deterministic, seedable simulator of NZ fuel prices for every
// pilot that needs to reason about operating cost. Produces a
// fresh price snapshot on every tick and supports event injection
// for things like the March 2026 Strait of Hormuz shock
// (petrol +30%, diesel +74%) referenced in the AAAIP revenue
// analysis.
//
// This utility is shared between:
//   - Arataki (dealer inventory optimiser, TCO calculator)
//   - Pikau   (fuel-efficient route optimisation)
//   - Any consumer "Fuel Savings Assistant" that plugs in later.
// ═══════════════════════════════════════════════════════════════

export type FuelKind = "petrol91" | "petrol95" | "diesel" | "ev";

export interface FuelPriceSnapshot {
  /** Timestamp in tick-units (same clock the sim uses). */
  tick: number;
  /** Current prices in NZD per litre (or NZD per kWh for EV). */
  petrol91: number;
  petrol95: number;
  diesel: number;
  /** EV charging cost in NZD per kWh at a public DC charger. */
  ev: number;
  /** Active volatility events driving the price. */
  events: string[];
}

export interface TcoInputs {
  /** Annual kilometres driven. */
  annualKm: number;
  /** Years of ownership to project. */
  years: number;
  /** Vehicle fuel economy in L/100km (ignored for EV). */
  lPer100km?: number;
  /** EV energy use in kWh/100km (ignored for ICE). */
  kwhPer100km?: number;
  /** Purchase price in NZD. */
  purchaseNzd: number;
  /** Annual service + rego + insurance in NZD. */
  annualFixedNzd: number;
}

export interface TcoResult {
  totalNzd: number;
  fuelNzd: number;
  purchaseNzd: number;
  fixedNzd: number;
  perKmNzd: number;
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export interface FuelBaseprices {
  petrol91: number;
  petrol95: number;
  diesel: number;
  ev: number;
}

/** Base-case NZ fuel prices (Q1 2026 equilibrium, NZD). Used as fallback. */
const DEFAULT_BASE: FuelBaseprices = {
  petrol91: 2.85,
  petrol95: 3.05,
  diesel: 2.40,
  ev: 0.35, // public DC charger, NZD per kWh
};


export interface FuelOracleOptions {
  seed?: number;
  /** Starting multiplier on every fuel (1.0 = baseline). */
  startMultiplier?: number;
  /**
   * Override base prices with live data from getNzFuelPrices().
   * If provided, the oracle uses these as its equilibrium anchor instead of
   * the hardcoded Q1 2026 defaults. Pass in from the nz-fuel-prices data source.
   */
  liveBase?: FuelBaseprices;
}

export class FuelOracle {
  private readonly rng: () => number;
  private readonly base: FuelBaseprices;
  private tick = 0;
  /** Running multipliers on base prices. Independent per fuel kind. */
  private multipliers: Record<FuelKind, number> = {
    petrol91: 1,
    petrol95: 1,
    diesel: 1,
    ev: 1,
  };
  /** Active events that currently bias prices. */
  private activeEvents: string[] = [];

  constructor(opts: FuelOracleOptions = {}) {
    this.rng = makeRng(opts.seed ?? 97);
    this.base = opts.liveBase ?? DEFAULT_BASE;
    const m = opts.startMultiplier ?? 1;
    for (const k of Object.keys(this.multipliers) as FuelKind[]) {
      this.multipliers[k] = m;
    }
  }

  /** Advance one tick and return the new snapshot. */
  step(): FuelPriceSnapshot {
    this.tick += 1;
    // Gentle mean-reverting drift so prices walk back to baseline
    // after a shock without a hard reset.
    for (const k of Object.keys(this.multipliers) as FuelKind[]) {
      const drift = (this.rng() - 0.5) * 0.01;
      const meanRevert = (1 - this.multipliers[k]) * 0.05;
      this.multipliers[k] = Math.max(
        0.5,
        Math.min(2.5, this.multipliers[k] + drift + meanRevert),
      );
    }
    return this.snapshot();
  }

  /** Current snapshot without advancing. */
  snapshot(): FuelPriceSnapshot {
    return {
      tick: this.tick,
      petrol91: round(this.base.petrol91 * this.multipliers.petrol91),
      petrol95: round(this.base.petrol95 * this.multipliers.petrol95),
      diesel: round(this.base.diesel * this.multipliers.diesel),
      ev: round(this.base.ev * this.multipliers.ev),
      events: [...this.activeEvents],
    };
  }

  /**
   * Inject a geopolitical fuel shock like the March 2026 Strait of
   * Hormuz blockade — petrol up ~30%, diesel up ~74%, EV mostly
   * unaffected.
   */
  injectStraitOfHormuzShock() {
    this.multipliers.petrol91 *= 1.30;
    this.multipliers.petrol95 *= 1.30;
    this.multipliers.diesel *= 1.74;
    this.multipliers.ev *= 1.05;
    if (!this.activeEvents.includes("strait_of_hormuz_shock")) {
      this.activeEvents.push("strait_of_hormuz_shock");
    }
  }

  /** Inject a domestic distribution disruption (refinery/pipeline). */
  injectRefineryOutage() {
    this.multipliers.petrol91 *= 1.15;
    this.multipliers.petrol95 *= 1.15;
    this.multipliers.diesel *= 1.18;
    if (!this.activeEvents.includes("refinery_outage")) {
      this.activeEvents.push("refinery_outage");
    }
  }

  /** Inject a carbon-price hike that raises ICE prices slightly. */
  injectCarbonPriceHike() {
    this.multipliers.petrol91 *= 1.06;
    this.multipliers.petrol95 *= 1.06;
    this.multipliers.diesel *= 1.08;
    if (!this.activeEvents.includes("carbon_price_hike")) {
      this.activeEvents.push("carbon_price_hike");
    }
  }

  clearEvents() {
    this.activeEvents = [];
  }

  reset() {
    this.tick = 0;
    this.multipliers = { petrol91: 1, petrol95: 1, diesel: 1, ev: 1 };
    this.activeEvents = [];
  }

  /**
   * Total cost of ownership over N years for an ICE vehicle.
   * Assumes the current fuel price is representative of the
   * projection window — callers can average a forecast if they
   * want more accuracy.
   */
  tcoIce(input: TcoInputs & { fuelKind: "petrol91" | "petrol95" | "diesel" }): TcoResult {
    const snap = this.snapshot();
    const price = snap[input.fuelKind];
    const lPer100 = input.lPer100km ?? 7;
    const litresPerYear = (input.annualKm / 100) * lPer100;
    const fuelNzd = litresPerYear * price * input.years;
    const fixedNzd = input.annualFixedNzd * input.years;
    const totalNzd = input.purchaseNzd + fuelNzd + fixedNzd;
    const perKmNzd = totalNzd / (input.annualKm * input.years);
    return {
      totalNzd: round(totalNzd, 0),
      fuelNzd: round(fuelNzd, 0),
      purchaseNzd: input.purchaseNzd,
      fixedNzd: round(fixedNzd, 0),
      perKmNzd: round(perKmNzd, 3),
    };
  }

  /** Total cost of ownership over N years for an EV. */
  tcoEv(input: TcoInputs): TcoResult {
    const snap = this.snapshot();
    const kwhPer100 = input.kwhPer100km ?? 17;
    const kwhPerYear = (input.annualKm / 100) * kwhPer100;
    const fuelNzd = kwhPerYear * snap.ev * input.years;
    const fixedNzd = input.annualFixedNzd * input.years;
    const totalNzd = input.purchaseNzd + fuelNzd + fixedNzd;
    const perKmNzd = totalNzd / (input.annualKm * input.years);
    return {
      totalNzd: round(totalNzd, 0),
      fuelNzd: round(fuelNzd, 0),
      purchaseNzd: input.purchaseNzd,
      fixedNzd: round(fixedNzd, 0),
      perKmNzd: round(perKmNzd, 3),
    };
  }
}

function round(n: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
