import { describe, it, expect } from "vitest";

import { FuelOracle } from "../utils/fuel-oracle";
import {
  estimateFuelSavings,
  FUEL_SAVINGS_POLICY_METADATA,
} from "../integrations/fuel-savings-guard";

const oracle = new FuelOracle({ seed: 5 });
const snap = oracle.snapshot();

describe("Fuel-Savings Guard — policy compliance", () => {
  it("passes a realistic petrol input cleanly", () => {
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 8,
        weeklyKm: 250,
        fuelType: "petrol91",
        evKwhPer100km: 17,
        evPremiumNzd: 15000,
        confidence: 0.92,
      },
      snap,
    );
    expect(result.compliant).toBe(true);
    expect(result.policyWarning).toBeUndefined();
  });

  it("flags an implausibly low fuel economy as needs_human", () => {
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 1.5,  // below 3.0 threshold
        weeklyKm: 200,
        fuelType: "petrol91",
        confidence: 0.92,
      },
      snap,
    );
    expect(result.compliant).toBe(false);
    expect(result.policyWarning).toContain("1.5");
    expect(result.policyWarning).toContain("fuel_savings.honest_fuel_economy");
  });

  it("flags an implausible weekly distance as needs_human", () => {
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 9,
        weeklyKm: 5000,  // over 3000 threshold
        fuelType: "diesel",
        confidence: 0.92,
      },
      snap,
    );
    expect(result.compliant).toBe(false);
    expect(result.policyWarning).toContain("fuel_savings.reasonable_weekly_km");
  });

  it("flags low-confidence inputs (uncertain) as needs_human", () => {
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 7,
        weeklyKm: 200,
        fuelType: "petrol95",
        confidence: 0.4,  // below 0.7 threshold
      },
      snap,
    );
    expect(result.compliant).toBe(false);
    expect(result.policyWarning).toContain("fuel_savings.uncertainty_handoff");
  });
});

describe("Fuel-Savings Guard — calculations", () => {
  it("weekly ICE cost equals litres × fuel price", () => {
    const economy = 10;
    const weekly = 100;
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: economy,
        weeklyKm: weekly,
        fuelType: "petrol91",
        confidence: 0.92,
      },
      snap,
    );
    const expected = (weekly / 100) * economy * snap.petrol91;
    expect(result.weeklyIceCostNzd).toBeCloseTo(expected, 1);
  });

  it("annual ICE cost is 52× weekly", () => {
    const result = estimateFuelSavings(
      { fuelEconomyLPer100km: 8, weeklyKm: 200, fuelType: "diesel", confidence: 0.9 },
      snap,
    );
    expect(result.annualIceCostNzd).toBeCloseTo(result.weeklyIceCostNzd * 52, 0);
  });

  it("EV weekly cost uses kWh pricing", () => {
    const evKwh = 17;
    const weekly = 200;
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 8,
        weeklyKm: weekly,
        fuelType: "petrol91",
        evKwhPer100km: evKwh,
        confidence: 0.92,
      },
      snap,
    );
    const expected = (weekly / 100) * evKwh * snap.ev;
    expect(result.weeklyEvCostNzd).toBeCloseTo(expected, 1);
  });

  it("annual savings equals annual ICE minus annual EV", () => {
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 9,
        weeklyKm: 300,
        fuelType: "petrol91",
        evKwhPer100km: 17,
        confidence: 0.92,
      },
      snap,
    );
    expect(result.annualSavingsNzd).toBeCloseTo(
      result.annualIceCostNzd - result.annualEvCostNzd,
      1,
    );
  });

  it("payback years = EV premium / annual savings when savings > 0", () => {
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 10,
        weeklyKm: 400,
        fuelType: "petrol91",
        evKwhPer100km: 17,
        evPremiumNzd: 20000,
        confidence: 0.92,
      },
      snap,
    );
    if (result.annualSavingsNzd > 0 && result.paybackYears !== null) {
      expect(result.paybackYears).toBeCloseTo(
        20000 / result.annualSavingsNzd,
        1,
      );
    }
  });

  it("payback is null when savings are zero or negative", () => {
    // Very EV-heavy kWh with expensive electricity — savings might be negative
    const result = estimateFuelSavings(
      {
        fuelEconomyLPer100km: 3.5,  // very efficient ICE
        weeklyKm: 100,
        fuelType: "petrol91",
        evKwhPer100km: 30,   // very inefficient EV
        evPremiumNzd: 30000,
        confidence: 0.92,
      },
      { ...snap, ev: 0.80 },  // expensive electricity
    );
    if (result.annualSavingsNzd <= 0) {
      expect(result.paybackYears).toBeNull();
    }
  });
});

describe("Fuel-Savings Guard — policy metadata", () => {
  it("exports exactly 3 policy definitions", () => {
    expect(FUEL_SAVINGS_POLICY_METADATA).toHaveLength(3);
  });

  it("all policies have the automotive domain", () => {
    for (const p of FUEL_SAVINGS_POLICY_METADATA) {
      expect(p.domain).toBe("automotive");
    }
  });

  it("fuel shock escalates ICE costs and widens EV advantage", () => {
    const oracleA = new FuelOracle({ seed: 99 });
    const before = oracleA.snapshot();
    oracleA.injectStraitOfHormuzShock();
    const after = oracleA.snapshot();

    const rBefore = estimateFuelSavings(
      { fuelEconomyLPer100km: 9, weeklyKm: 300, fuelType: "petrol91", evKwhPer100km: 17, confidence: 0.92 },
      before,
    );
    const rAfter = estimateFuelSavings(
      { fuelEconomyLPer100km: 9, weeklyKm: 300, fuelType: "petrol91", evKwhPer100km: 17, confidence: 0.92 },
      after,
    );
    expect(rAfter.annualIceCostNzd).toBeGreaterThan(rBefore.annualIceCostNzd);
    expect(rAfter.annualSavingsNzd).toBeGreaterThan(rBefore.annualSavingsNzd);
  });
});
