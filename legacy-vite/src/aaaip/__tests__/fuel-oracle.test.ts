import { describe, it, expect } from "vitest";

import { FuelOracle } from "../utils/fuel-oracle";

describe("FuelOracle", () => {
  it("produces a baseline snapshot with all four fuels", () => {
    const oracle = new FuelOracle({ seed: 1 });
    const snap = oracle.snapshot();
    expect(snap.petrol91).toBeGreaterThan(0);
    expect(snap.petrol95).toBeGreaterThan(snap.petrol91);
    expect(snap.diesel).toBeGreaterThan(0);
    expect(snap.ev).toBeGreaterThan(0);
    expect(snap.ev).toBeLessThan(snap.petrol91);
    expect(snap.events).toEqual([]);
  });

  it("is deterministic for a given seed", () => {
    const a = new FuelOracle({ seed: 42 });
    const b = new FuelOracle({ seed: 42 });
    for (let i = 0; i < 20; i++) a.step();
    for (let i = 0; i < 20; i++) b.step();
    expect(a.snapshot()).toEqual(b.snapshot());
  });

  it("applies a Strait of Hormuz shock roughly matching the Mar 2026 figures", () => {
    const oracle = new FuelOracle({ seed: 7 });
    const before = oracle.snapshot();
    oracle.injectStraitOfHormuzShock();
    const after = oracle.snapshot();
    // Petrol up ~30%, diesel up ~74%, EV mostly flat
    expect(after.petrol91 / before.petrol91).toBeGreaterThan(1.25);
    expect(after.petrol91 / before.petrol91).toBeLessThan(1.4);
    expect(after.diesel / before.diesel).toBeGreaterThan(1.6);
    expect(after.diesel / before.diesel).toBeLessThan(1.85);
    expect(after.ev / before.ev).toBeLessThan(1.15);
    expect(after.events).toContain("strait_of_hormuz_shock");
  });

  it("computes a sensible 5-year ICE vs EV TCO comparison at baseline prices", () => {
    const oracle = new FuelOracle({ seed: 11 });
    const common = {
      annualKm: 14000,
      years: 5,
      annualFixedNzd: 2400,
    };
    const ice = oracle.tcoIce({
      ...common,
      fuelKind: "petrol91",
      lPer100km: 7,
      purchaseNzd: 45000,
    });
    const ev = oracle.tcoEv({
      ...common,
      kwhPer100km: 17,
      purchaseNzd: 55000,
    });
    // Both are positive, EV should save on fuel but cost more up-front.
    expect(ice.fuelNzd).toBeGreaterThan(ev.fuelNzd);
    expect(ev.purchaseNzd).toBeGreaterThan(ice.purchaseNzd);
    expect(ice.totalNzd).toBeGreaterThan(0);
    expect(ev.totalNzd).toBeGreaterThan(0);
    expect(ice.perKmNzd).toBeGreaterThan(ice.purchaseNzd / (common.annualKm * common.years) - 0.01);
  });

  it("produces a bigger EV advantage after a fuel shock", () => {
    const oracle = new FuelOracle({ seed: 23 });
    const common = {
      annualKm: 14000,
      years: 5,
      annualFixedNzd: 2400,
      purchaseNzd: 50000,
    };
    const iceBefore = oracle.tcoIce({ ...common, fuelKind: "diesel", lPer100km: 8 });
    const evBefore = oracle.tcoEv({ ...common, kwhPer100km: 17 });
    oracle.injectStraitOfHormuzShock();
    const iceAfter = oracle.tcoIce({ ...common, fuelKind: "diesel", lPer100km: 8 });
    const evAfter = oracle.tcoEv({ ...common, kwhPer100km: 17 });

    // ICE fuel cost jumps more than EV fuel cost after a diesel shock.
    expect(iceAfter.fuelNzd).toBeGreaterThan(iceBefore.fuelNzd);
    expect(evAfter.fuelNzd - evBefore.fuelNzd).toBeLessThan(iceAfter.fuelNzd - iceBefore.fuelNzd);
  });
});
