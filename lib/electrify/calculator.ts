/**
 * Deterministic TCO calculator for the Electrify NZ SME tool.
 *
 * NOT an LLM call. Every output is reproducible from the input + the assumptions
 * version recorded with the saved lead row. If a future audit asks "how did you
 * arrive at $4,500 annual savings?", we re-run this function with the same
 * inputs and the same ASSUMPTIONS_VERSION and we get the same answer.
 *
 * Calling conventions:
 *   - All NZD figures returned are annual unless suffixed _ten_year / _per_month
 *   - All emissions returned in tonnes CO2e (kg / 1000) for human readability
 *   - confidence is 'high' / 'medium' / 'low' based on input completeness
 */

import {
  ASSUMPTIONS_VERSION,
  ANNUAL_KM_DEFAULT,
  CAPEX_NZD,
  CONFIDENCE_THRESHOLDS,
  ELECTRICITY_PRICE_NZD_PER_KWH,
  EMISSIONS_FACTORS_KG_CO2E,
  EV_EFFICIENCY_KWH_PER_KM,
  EV_MAINTENANCE_RATIO_OF_ICE,
  FINANCE_RATE_ANNUAL,
  FOSSIL_HEAT_EFFICIENCY,
  FUEL_PRICES_NZD,
  HEAT_PUMP_COP,
  ICE_EFFICIENCY_L_PER_100KM,
  ICE_MAINTENANCE_NZD_PER_YEAR,
  LEASE_PENALTY_MULTIPLIER,
  SWITCH_PRIORITY_BASE,
} from "@/config/electrification-assumptions";

// ── Types ────────────────────────────────────────────────────────────────

export type BusinessType =
  | "hospitality"
  | "construction"
  | "freight"
  | "retail"
  | "automotive_fleet"
  | "creative"
  | "ece"
  | "professional_other";

export type FuelType = "petrol" | "diesel" | "lpg" | "natural_gas" | "coal";
export type VehicleType = "passenger" | "light_commercial" | "heavy_commercial" | "mixed";
export type PremisesType = "own_freehold" | "lease_long_term" | "lease_short_term";

export interface ElectrifyInput {
  businessType: BusinessType;
  region: string;
  monthlyFuelSpendNzd: number;
  fuelTypes: FuelType[];
  vehicleCount: number;
  vehicleType?: VehicleType;
  premisesType: PremisesType;
  rooftopSolarSuitable: "yes" | "no" | "unsure";
  monthlyElectricitySpendNzd: number;
}

export interface SwitchStep {
  order: number;
  machine: string;
  estimatedCapexNzd: number;
  estimatedAnnualSavingNzd: number;
  paybackYears: number | null;        // null = "always profitable" or "negative payback"
  rationale: string;
  priorityScore: number;
}

export interface SolarRec {
  recommended: boolean;
  estimatedKwSize: number;
  estimatedCapexNzd: number;
  estimatedAnnualSavingNzd: number;
  paybackYears: number | null;
  reason: string;
}

export interface ElectrifyResult {
  annualSavingsCurrentNzd: number;
  annualSavingsCheapFinanceNzd: number;
  paybackYears: number | null;
  tenYearSavingsNzd: number;
  co2eAvoidedTonnes: number;
  upfrontCapexEstimateNzd: number;
  recommendedSequence: SwitchStep[];
  solarRecommendation: SolarRec | null;
  confidence: "high" | "medium" | "low";
  assumptionsVersion: string;
  assumptionsUsed: string[];          // human-readable list for the PDF footer
}

// ── Helpers ──────────────────────────────────────────────────────────────

function annualFuelCostByType(monthlyTotal: number, fuelTypes: FuelType[]): number {
  // Annualise; we don't know the split between fuel types so the total
  // monthly spend is the source of truth and fuelTypes informs emissions
  return monthlyTotal * 12;
}

function vehicleAnnualKm(type: VehicleType | undefined, count: number): number {
  if (!type || count === 0) return 0;
  if (type === "mixed") {
    // Treat mixed as 60% passenger + 40% light commercial
    return Math.round((ANNUAL_KM_DEFAULT.passenger * 0.6 + ANNUAL_KM_DEFAULT.light_commercial * 0.4) * count);
  }
  if (type === "passenger") return ANNUAL_KM_DEFAULT.passenger * count;
  if (type === "light_commercial") return ANNUAL_KM_DEFAULT.light_commercial * count;
  return ANNUAL_KM_DEFAULT.heavy_commercial * count;
}

function vehicleClassFor(type: VehicleType | undefined): "passenger" | "light_commercial" | "heavy_commercial" {
  if (type === "heavy_commercial") return "heavy_commercial";
  if (type === "light_commercial" || type === "mixed") return "light_commercial";
  return "passenger";
}

function emissionsForFuel(annualSpendNzd: number, fuelType: FuelType): number {
  // Convert annual NZD spend → physical units → kg CO2e
  switch (fuelType) {
    case "petrol": {
      const litres = annualSpendNzd / FUEL_PRICES_NZD.petrol_per_litre;
      return litres * EMISSIONS_FACTORS_KG_CO2E.petrol_per_litre;
    }
    case "diesel": {
      const litres = annualSpendNzd / FUEL_PRICES_NZD.diesel_per_litre;
      return litres * EMISSIONS_FACTORS_KG_CO2E.diesel_per_litre;
    }
    case "lpg": {
      const kg = annualSpendNzd / FUEL_PRICES_NZD.lpg_per_kg;
      return kg * EMISSIONS_FACTORS_KG_CO2E.lpg_per_kg;
    }
    case "natural_gas": {
      const kwh = annualSpendNzd / FUEL_PRICES_NZD.natural_gas_per_kwh;
      return kwh * EMISSIONS_FACTORS_KG_CO2E.natural_gas_per_kwh;
    }
    case "coal": {
      const kg = annualSpendNzd / FUEL_PRICES_NZD.coal_per_kg;
      return kg * EMISSIONS_FACTORS_KG_CO2E.coal_per_kg;
    }
  }
}

// ── Vehicle switch ───────────────────────────────────────────────────────

function calculateVehicleSwitch(input: ElectrifyInput): SwitchStep | null {
  if (input.vehicleCount === 0) return null;

  const vClass = vehicleClassFor(input.vehicleType);
  const annualKm = vehicleAnnualKm(input.vehicleType, input.vehicleCount);

  // Current ICE annual fuel cost
  const litresPer100km = ICE_EFFICIENCY_L_PER_100KM[vClass];
  const annualLitres = (annualKm * litresPer100km) / 100;
  // Use diesel as conservative price for light/heavy, petrol for passenger
  const fuelPrice = vClass === "passenger"
    ? FUEL_PRICES_NZD.petrol_per_litre
    : FUEL_PRICES_NZD.diesel_per_litre;
  const annualIceFuelCost = annualLitres * fuelPrice;

  // EV equivalent annual energy cost
  const kwhPerKm = EV_EFFICIENCY_KWH_PER_KM[vClass];
  const annualKwh = annualKm * kwhPerKm;
  // Assume 70% off-peak, 30% grid average
  const avgElectricity =
    ELECTRICITY_PRICE_NZD_PER_KWH.off_peak_ev_charging * 0.7 +
    ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg * 0.3;
  const annualEvEnergyCost = annualKwh * avgElectricity;

  // Maintenance delta
  const annualMaintIce = ICE_MAINTENANCE_NZD_PER_YEAR[vClass] * input.vehicleCount;
  const annualMaintEv = annualMaintIce * EV_MAINTENANCE_RATIO_OF_ICE;

  const annualSaving =
    (annualIceFuelCost - annualEvEnergyCost) + (annualMaintIce - annualMaintEv);

  // Capex
  const capexUnit =
    vClass === "passenger"
      ? CAPEX_NZD.ev_passenger
      : vClass === "light_commercial"
      ? CAPEX_NZD.ev_light_commercial
      : CAPEX_NZD.ev_heavy_truck;
  const totalCapex = capexUnit * input.vehicleCount;

  const paybackYears = annualSaving > 0 ? totalCapex / annualSaving : null;

  return {
    order: 0, // assigned later
    machine: `Replace ${input.vehicleCount}× ${vClass.replace("_", " ")} ${input.vehicleCount > 1 ? "vehicles" : "vehicle"} with EVs`,
    estimatedCapexNzd: totalCapex,
    estimatedAnnualSavingNzd: Math.round(annualSaving),
    paybackYears: paybackYears ? Math.round(paybackYears * 10) / 10 : null,
    rationale: `Fuel + maintenance savings vs ${vClass.replace("_", " ")} ICE`,
    priorityScore:
      (vClass === "heavy_commercial"
        ? SWITCH_PRIORITY_BASE.ev_heavy_truck
        : vClass === "light_commercial"
        ? SWITCH_PRIORITY_BASE.ev_light_commercial
        : SWITCH_PRIORITY_BASE.ev_passenger) *
      LEASE_PENALTY_MULTIPLIER[input.premisesType],
  };
}

// ── Heat switch (process / space / hot water) ────────────────────────────

function calculateHeatSwitch(input: ElectrifyInput): SwitchStep | null {
  // Skip if no thermal fuel in mix
  const thermalFuels = input.fuelTypes.filter((f) =>
    ["lpg", "natural_gas", "coal"].includes(f)
  );
  if (thermalFuels.length === 0) return null;

  // Crude split: if vehicles, 60% of fuel spend is vehicular, 40% thermal.
  // If no vehicles, 100% of fuel spend is thermal.
  const thermalFraction = input.vehicleCount > 0 ? 0.4 : 1.0;
  const annualThermalFuelSpend = input.monthlyFuelSpendNzd * 12 * thermalFraction;

  if (annualThermalFuelSpend < 500) return null; // too small to model

  // Map to the dominant thermal fuel for efficiency factor
  const dominantFuel = thermalFuels[0];
  const fossilEfficiency =
    dominantFuel === "natural_gas"
      ? FOSSIL_HEAT_EFFICIENCY.natural_gas_boiler
      : dominantFuel === "lpg"
      ? FOSSIL_HEAT_EFFICIENCY.lpg_boiler
      : FOSSIL_HEAT_EFFICIENCY.coal_boiler;

  // Useful heat delivered per year (kWh equivalent)
  // Approximate: fuel_spend / fuel_price * heat_content; but we already have $ so
  // collapse: new_electricity_cost = (annual_thermal_spend * fossil_eff / cop) * (electricity_price / fuel_price_ratio)
  // Simpler & defensible: cost ratio scales with cop/efficiency × electricity:fuel cost ratio.
  // We approximate the new annual electricity cost directly:
  const COP = HEAT_PUMP_COP.process_heat;
  // Effective fossil $ → equivalent electricity $ at NZ grid avg
  // (heat delivered same; electricity is COP× more efficient than fossil×fossil_eff)
  const annualElectricCost =
    (annualThermalFuelSpend * fossilEfficiency * ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg) /
    (COP * 0.11); // 0.11 = approx NZD per kWh of natural gas baseline

  const annualSaving = annualThermalFuelSpend - annualElectricCost;
  const estCapex = CAPEX_NZD.heat_pump_process_heat_kw * 30; // rough: assume 30kW pump for SME
  const paybackYears = annualSaving > 0 ? estCapex / annualSaving : null;

  return {
    order: 0,
    machine: `Replace ${dominantFuel.replace("_", " ")} heat with commercial heat pump (~30kW)`,
    estimatedCapexNzd: estCapex,
    estimatedAnnualSavingNzd: Math.round(annualSaving),
    paybackYears: paybackYears ? Math.round(paybackYears * 10) / 10 : null,
    rationale: `Heat pump COP=${COP} vs ${dominantFuel.replace("_", " ")} boiler ${(fossilEfficiency * 100).toFixed(0)}%`,
    priorityScore:
      SWITCH_PRIORITY_BASE.heat_pump_process_heat *
      LEASE_PENALTY_MULTIPLIER[input.premisesType],
  };
}

// ── Solar recommendation ─────────────────────────────────────────────────

function calculateSolar(input: ElectrifyInput): SolarRec {
  // If lease short-term OR rooftop unsuitable → recommend against
  if (input.premisesType === "lease_short_term") {
    return {
      recommended: false,
      estimatedKwSize: 0,
      estimatedCapexNzd: 0,
      estimatedAnnualSavingNzd: 0,
      paybackYears: null,
      reason: "Short-term lease — solar capex unlikely to pay back within tenancy",
    };
  }
  if (input.rooftopSolarSuitable === "no") {
    return {
      recommended: false,
      estimatedKwSize: 0,
      estimatedCapexNzd: 0,
      estimatedAnnualSavingNzd: 0,
      paybackYears: null,
      reason: "Rooftop not suitable per the user",
    };
  }

  // Size: cover ~50% of annual electricity consumption
  // electricity_consumption_kwh = monthly_spend * 12 / grid_avg_$/kwh
  const annualKwh = (input.monthlyElectricitySpendNzd * 12) / ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg;
  // Assume 1kW solar = ~1,400 kWh/year in NZ
  const solarTargetKw = Math.max(5, Math.round((annualKwh * 0.5) / 1400));
  const capex = solarTargetKw * CAPEX_NZD.rooftop_solar_per_kw_installed;
  const annualGen = solarTargetKw * 1400;
  // Self-consumed (70% of generation) saves at grid_avg; exported saves at solar LCOE
  const annualSaving =
    annualGen * 0.7 * ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg +
    annualGen * 0.3 * ELECTRICITY_PRICE_NZD_PER_KWH.solar_self_consumed;
  const paybackYears = annualSaving > 0 ? capex / annualSaving : null;

  return {
    recommended: true,
    estimatedKwSize: solarTargetKw,
    estimatedCapexNzd: capex,
    estimatedAnnualSavingNzd: Math.round(annualSaving),
    paybackYears: paybackYears ? Math.round(paybackYears * 10) / 10 : null,
    reason: `${solarTargetKw}kW system covers ~50% of annual electricity consumption`,
  };
}

// ── Confidence scoring ──────────────────────────────────────────────────

function calculateConfidence(input: ElectrifyInput): "high" | "medium" | "low" {
  let filled = 0;
  if (input.businessType) filled++;
  if (input.region) filled++;
  if (input.monthlyFuelSpendNzd > 0) filled++;
  if (input.fuelTypes.length > 0) filled++;
  if (input.vehicleCount >= 0) filled++;
  if (input.vehicleType) filled++;
  if (input.premisesType) filled++;
  if (input.rooftopSolarSuitable !== "unsure") filled++;
  if (input.monthlyElectricitySpendNzd > 0) filled++;

  if (filled >= CONFIDENCE_THRESHOLDS.high_min_inputs_provided) return "high";
  if (filled >= CONFIDENCE_THRESHOLDS.medium_min_inputs_provided) return "medium";
  return "low";
}

// ── Main entry point ────────────────────────────────────────────────────

export function calculateElectrification(input: ElectrifyInput): ElectrifyResult {
  const steps: SwitchStep[] = [];

  const vehicleStep = calculateVehicleSwitch(input);
  if (vehicleStep) steps.push(vehicleStep);

  const heatStep = calculateHeatSwitch(input);
  if (heatStep) steps.push(heatStep);

  const solar = calculateSolar(input);
  if (solar.recommended) {
    steps.push({
      order: 0,
      machine: `Install ${solar.estimatedKwSize}kW rooftop solar`,
      estimatedCapexNzd: solar.estimatedCapexNzd,
      estimatedAnnualSavingNzd: solar.estimatedAnnualSavingNzd,
      paybackYears: solar.paybackYears,
      rationale: solar.reason,
      priorityScore:
        SWITCH_PRIORITY_BASE.rooftop_solar * LEASE_PENALTY_MULTIPLIER[input.premisesType],
    });
  }

  // Sort by priority desc, then payback asc
  steps.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    const aPb = a.paybackYears ?? Number.POSITIVE_INFINITY;
    const bPb = b.paybackYears ?? Number.POSITIVE_INFINITY;
    return aPb - bPb;
  });
  steps.forEach((s, i) => (s.order = i + 1));

  // Aggregate
  const totalAnnualSaving = steps.reduce((acc, s) => acc + s.estimatedAnnualSavingNzd, 0);
  const totalCapex = steps.reduce((acc, s) => acc + s.estimatedCapexNzd, 0);

  // Annual finance cost (current vs cheap)
  const annualFinanceCurrent = totalCapex * FINANCE_RATE_ANNUAL.current_commercial;
  const annualFinanceCheap = totalCapex * FINANCE_RATE_ANNUAL.cheap_green_loan;

  const annualSavingsCurrent = totalAnnualSaving - annualFinanceCurrent;
  const annualSavingsCheap = totalAnnualSaving - annualFinanceCheap;

  // Payback (simple — fleet level, not per item)
  const payback = totalAnnualSaving > 0 ? totalCapex / totalAnnualSaving : null;

  // CO2e — annual emissions avoided
  const annualSpendByFuel = input.monthlyFuelSpendNzd * 12;
  const co2eKgAvoided = input.fuelTypes
    .map((f) => emissionsForFuel(annualSpendByFuel / input.fuelTypes.length, f))
    .reduce((a, b) => a + b, 0);
  // Subtract the grid electricity emissions for the equivalent EV / heat pump load
  const replacementKwh = (annualSpendByFuel * 0.5) / ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg;
  const co2eKgAdded = replacementKwh * EMISSIONS_FACTORS_KG_CO2E.nz_grid_electricity_per_kwh;
  const co2eTonnes = Math.max(0, (co2eKgAvoided - co2eKgAdded) / 1000);

  const assumptionsUsed = [
    "MBIE Energy Prices Q1 2026",
    "EECA Light Vehicle Fuel Economy Database 2026",
    "EECA Heat Pump Performance Brief 2024",
    "MfE NZ Greenhouse Gas Inventory 2024",
    "Rewiring Aotearoa Machine Count Report 2025",
    "NZTA Vehicle Fleet Statistics 2025",
    "ANZ Business Banking commercial rates May 2026",
  ];

  return {
    annualSavingsCurrentNzd: Math.round(annualSavingsCurrent),
    annualSavingsCheapFinanceNzd: Math.round(annualSavingsCheap),
    paybackYears: payback ? Math.round(payback * 10) / 10 : null,
    tenYearSavingsNzd: Math.round(totalAnnualSaving * 10 - totalCapex),
    co2eAvoidedTonnes: Math.round(co2eTonnes * 10) / 10,
    upfrontCapexEstimateNzd: totalCapex,
    recommendedSequence: steps,
    solarRecommendation: solar,
    confidence: calculateConfidence(input),
    assumptionsVersion: ASSUMPTIONS_VERSION,
    assumptionsUsed,
  };
}
