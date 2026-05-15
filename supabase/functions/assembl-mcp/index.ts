import { Hono } from "https://deno.land/x/hono@v4.3.6/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SmeElectrificationInput = {
  business_type: "hospitality" | "construction" | "freight" | "retail" | "automotive_fleet" | "creative" | "ece" | "professional_other";
  region: string;
  monthly_fuel_spend_nzd: number;
  fuel_types: Array<"petrol" | "diesel" | "lpg" | "natural_gas" | "coal">;
  vehicle_count: number;
  vehicle_type?: "passenger" | "light_commercial" | "heavy_commercial" | "mixed";
  premises_type: "own_freehold" | "lease_long_term" | "lease_short_term";
  rooftop_solar_suitable: "yes" | "no" | "unsure";
  monthly_electricity_spend_nzd: number;
};

const ELECTRIFY_ASSUMPTIONS_VERSION = "2026-05-13-v1";
const FUEL_PRICES_NZD = {
  petrol_per_litre: 2.85,
  diesel_per_litre: 2.20,
  lpg_per_kg: 3.40,
  natural_gas_per_kwh: 0.11,
  coal_per_kg: 0.55,
} as const;
const ELECTRICITY_PRICE_NZD_PER_KWH = {
  grid_avg: 0.32,
  solar_self_consumed: 0.12,
  off_peak_ev_charging: 0.18,
} as const;
const EV_EFFICIENCY_KWH_PER_KM = { passenger: 0.18, light_commercial: 0.28, heavy_commercial: 0.95 } as const;
const ICE_EFFICIENCY_L_PER_100KM = { passenger: 8.0, light_commercial: 11.0, heavy_commercial: 35.0 } as const;
const ANNUAL_KM_DEFAULT = { passenger: 14_000, light_commercial: 25_000, heavy_commercial: 60_000 } as const;
const ICE_MAINTENANCE_NZD_PER_YEAR = { passenger: 1_200, light_commercial: 2_400, heavy_commercial: 9_500 } as const;
const EV_MAINTENANCE_RATIO_OF_ICE = 0.40;
const HEAT_PUMP_COP = { process_heat: 4.0 } as const;
const FOSSIL_HEAT_EFFICIENCY = { natural_gas_boiler: 0.85, lpg_boiler: 0.82, coal_boiler: 0.70 } as const;
const EMISSIONS_FACTORS_KG_CO2E = {
  petrol_per_litre: 2.31,
  diesel_per_litre: 2.68,
  natural_gas_per_kwh: 0.20,
  lpg_per_kg: 2.94,
  coal_per_kg: 2.42,
  nz_grid_electricity_per_kwh: 0.073,
} as const;
const CAPEX_NZD = {
  ev_passenger: 55_000,
  ev_light_commercial: 75_000,
  ev_heavy_truck: 220_000,
  heat_pump_process_heat_kw: 1_800,
  rooftop_solar_per_kw_installed: 1_800,
} as const;
const FINANCE_RATE_ANNUAL = { current_commercial: 0.055, cheap_green_loan: 0.01 } as const;
const SWITCH_PRIORITY_BASE = {
  ev_passenger: 9,
  ev_light_commercial: 9,
  ev_heavy_truck: 7,
  heat_pump_process_heat: 8,
  rooftop_solar: 7,
} as const;
const LEASE_PENALTY_MULTIPLIER = { own_freehold: 1, lease_long_term: 0.8, lease_short_term: 0.4 } as const;

function roundCurrency(value: number): number {
  return Math.round(value);
}

function vehicleClassFor(type: SmeElectrificationInput["vehicle_type"]): "passenger" | "light_commercial" | "heavy_commercial" {
  if (type === "heavy_commercial") return "heavy_commercial";
  if (type === "light_commercial" || type === "mixed") return "light_commercial";
  return "passenger";
}

function vehicleAnnualKm(type: SmeElectrificationInput["vehicle_type"], count: number): number {
  if (!type || count === 0) return 0;
  if (type === "mixed") {
    return Math.round((ANNUAL_KM_DEFAULT.passenger * 0.6 + ANNUAL_KM_DEFAULT.light_commercial * 0.4) * count);
  }
  return ANNUAL_KM_DEFAULT[type] * count;
}

function emissionsForFuel(annualSpendNzd: number, fuelType: SmeElectrificationInput["fuel_types"][number]): number {
  if (fuelType === "petrol") return (annualSpendNzd / FUEL_PRICES_NZD.petrol_per_litre) * EMISSIONS_FACTORS_KG_CO2E.petrol_per_litre;
  if (fuelType === "diesel") return (annualSpendNzd / FUEL_PRICES_NZD.diesel_per_litre) * EMISSIONS_FACTORS_KG_CO2E.diesel_per_litre;
  if (fuelType === "lpg") return (annualSpendNzd / FUEL_PRICES_NZD.lpg_per_kg) * EMISSIONS_FACTORS_KG_CO2E.lpg_per_kg;
  if (fuelType === "natural_gas") return (annualSpendNzd / FUEL_PRICES_NZD.natural_gas_per_kwh) * EMISSIONS_FACTORS_KG_CO2E.natural_gas_per_kwh;
  return (annualSpendNzd / FUEL_PRICES_NZD.coal_per_kg) * EMISSIONS_FACTORS_KG_CO2E.coal_per_kg;
}

function calculateSmeElectrification(input: SmeElectrificationInput) {
  const steps: Array<{
    order: number;
    machine: string;
    estimated_capex_nzd: number;
    estimated_annual_saving_nzd: number;
    payback_years: number | null;
    rationale: string;
    priority_score: number;
  }> = [];

  if (input.vehicle_count > 0) {
    const vClass = vehicleClassFor(input.vehicle_type);
    const annualKm = vehicleAnnualKm(input.vehicle_type, input.vehicle_count);
    const annualLitres = (annualKm * ICE_EFFICIENCY_L_PER_100KM[vClass]) / 100;
    const fuelPrice = vClass === "passenger" ? FUEL_PRICES_NZD.petrol_per_litre : FUEL_PRICES_NZD.diesel_per_litre;
    const annualIceFuelCost = annualLitres * fuelPrice;
    const annualEvEnergyCost = annualKm * EV_EFFICIENCY_KWH_PER_KM[vClass] *
      (ELECTRICITY_PRICE_NZD_PER_KWH.off_peak_ev_charging * 0.7 + ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg * 0.3);
    const annualMaintIce = ICE_MAINTENANCE_NZD_PER_YEAR[vClass] * input.vehicle_count;
    const annualMaintEv = annualMaintIce * EV_MAINTENANCE_RATIO_OF_ICE;
    const annualSaving = annualIceFuelCost - annualEvEnergyCost + annualMaintIce - annualMaintEv;
    const capexUnit = vClass === "passenger"
      ? CAPEX_NZD.ev_passenger
      : vClass === "light_commercial"
      ? CAPEX_NZD.ev_light_commercial
      : CAPEX_NZD.ev_heavy_truck;
    const capex = capexUnit * input.vehicle_count;
    steps.push({
      order: 0,
      machine: `Replace ${input.vehicle_count} ${vClass.replace("_", " ")} ${input.vehicle_count > 1 ? "vehicles" : "vehicle"} with electric equivalents`,
      estimated_capex_nzd: capex,
      estimated_annual_saving_nzd: roundCurrency(annualSaving),
      payback_years: annualSaving > 0 ? Math.round((capex / annualSaving) * 10) / 10 : null,
      rationale: `Fuel plus maintenance savings vs ${vClass.replace("_", " ")} internal-combustion vehicles`,
      priority_score: (vClass === "heavy_commercial" ? SWITCH_PRIORITY_BASE.ev_heavy_truck : vClass === "light_commercial" ? SWITCH_PRIORITY_BASE.ev_light_commercial : SWITCH_PRIORITY_BASE.ev_passenger) * LEASE_PENALTY_MULTIPLIER[input.premises_type],
    });
  }

  const thermalFuels = input.fuel_types.filter((fuel) => ["lpg", "natural_gas", "coal"].includes(fuel));
  if (thermalFuels.length > 0) {
    const dominantFuel = thermalFuels[0];
    const annualThermalFuelSpend = input.monthly_fuel_spend_nzd * 12 * (input.vehicle_count > 0 ? 0.4 : 1);
    const fossilEfficiency = dominantFuel === "natural_gas"
      ? FOSSIL_HEAT_EFFICIENCY.natural_gas_boiler
      : dominantFuel === "lpg"
      ? FOSSIL_HEAT_EFFICIENCY.lpg_boiler
      : FOSSIL_HEAT_EFFICIENCY.coal_boiler;
    const annualElectricCost = (annualThermalFuelSpend * fossilEfficiency * ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg) /
      (HEAT_PUMP_COP.process_heat * 0.11);
    const annualSaving = annualThermalFuelSpend - annualElectricCost;
    const capex = CAPEX_NZD.heat_pump_process_heat_kw * 30;
    if (annualThermalFuelSpend >= 500) {
      steps.push({
        order: 0,
        machine: `Replace ${dominantFuel.replace("_", " ")} heat with commercial heat pump`,
        estimated_capex_nzd: capex,
        estimated_annual_saving_nzd: roundCurrency(annualSaving),
        payback_years: annualSaving > 0 ? Math.round((capex / annualSaving) * 10) / 10 : null,
        rationale: `Heat pump COP ${HEAT_PUMP_COP.process_heat} vs ${dominantFuel.replace("_", " ")} boiler`,
        priority_score: SWITCH_PRIORITY_BASE.heat_pump_process_heat * LEASE_PENALTY_MULTIPLIER[input.premises_type],
      });
    }
  }

  let solar_recommendation = {
    recommended: false,
    estimated_kw_size: 0,
    estimated_capex_nzd: 0,
    estimated_annual_saving_nzd: 0,
    payback_years: null as number | null,
    reason: "Short-term lease or rooftop not suitable",
  };
  if (input.premises_type !== "lease_short_term" && input.rooftop_solar_suitable !== "no") {
    const annualKwh = (input.monthly_electricity_spend_nzd * 12) / ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg;
    const solarTargetKw = Math.max(5, Math.round((annualKwh * 0.5) / 1400));
    const capex = solarTargetKw * CAPEX_NZD.rooftop_solar_per_kw_installed;
    const annualSaving = solarTargetKw * 1400 * 0.7 * ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg +
      solarTargetKw * 1400 * 0.3 * ELECTRICITY_PRICE_NZD_PER_KWH.solar_self_consumed;
    solar_recommendation = {
      recommended: true,
      estimated_kw_size: solarTargetKw,
      estimated_capex_nzd: capex,
      estimated_annual_saving_nzd: roundCurrency(annualSaving),
      payback_years: annualSaving > 0 ? Math.round((capex / annualSaving) * 10) / 10 : null,
      reason: `${solarTargetKw}kW system covers about half of annual electricity consumption`,
    };
    steps.push({
      order: 0,
      machine: `Install ${solarTargetKw}kW rooftop solar`,
      estimated_capex_nzd: capex,
      estimated_annual_saving_nzd: roundCurrency(annualSaving),
      payback_years: solar_recommendation.payback_years,
      rationale: solar_recommendation.reason,
      priority_score: SWITCH_PRIORITY_BASE.rooftop_solar * LEASE_PENALTY_MULTIPLIER[input.premises_type],
    });
  }

  steps.sort((a, b) => b.priority_score - a.priority_score || (a.payback_years ?? Infinity) - (b.payback_years ?? Infinity));
  steps.forEach((step, index) => step.order = index + 1);
  const totalAnnualSaving = steps.reduce((sum, step) => sum + step.estimated_annual_saving_nzd, 0);
  const totalCapex = steps.reduce((sum, step) => sum + step.estimated_capex_nzd, 0);
  const annualSavingsCurrent = totalAnnualSaving - totalCapex * FINANCE_RATE_ANNUAL.current_commercial;
  const annualSavingsCheap = totalAnnualSaving - totalCapex * FINANCE_RATE_ANNUAL.cheap_green_loan;
  const annualSpendByFuel = input.monthly_fuel_spend_nzd * 12;
  const co2eKgAvoided = input.fuel_types.length
    ? input.fuel_types.map((fuel) => emissionsForFuel(annualSpendByFuel / input.fuel_types.length, fuel)).reduce((a, b) => a + b, 0)
    : 0;
  const replacementKwh = (annualSpendByFuel * 0.5) / ELECTRICITY_PRICE_NZD_PER_KWH.grid_avg;
  const co2eKgAdded = replacementKwh * EMISSIONS_FACTORS_KG_CO2E.nz_grid_electricity_per_kwh;

  return {
    annual_savings_current_finance_nzd: roundCurrency(annualSavingsCurrent),
    annual_savings_cheap_finance_nzd: roundCurrency(annualSavingsCheap),
    payback_years: totalAnnualSaving > 0 ? Math.round((totalCapex / totalAnnualSaving) * 10) / 10 : null,
    ten_year_savings_nzd: roundCurrency(totalAnnualSaving * 10 - totalCapex),
    co2e_avoided_tonnes: Math.round(Math.max(0, (co2eKgAvoided - co2eKgAdded) / 1000) * 10) / 10,
    upfront_capex_estimate_nzd: totalCapex,
    recommended_sequence: steps.map(({ priority_score, ...step }) => step),
    solar_recommendation,
    assumptions_version: ELECTRIFY_ASSUMPTIONS_VERSION,
    assumptions_used: [
      "MBIE Energy Prices Q1 2026",
      "EECA Light Vehicle Fuel Economy Database 2026",
      "EECA Heat Pump Performance Brief 2024",
      "MfE NZ Greenhouse Gas Inventory 2024",
      "Rewiring Aotearoa Machine Count Report 2025",
      "NZTA Vehicle Fleet Statistics 2025",
    ],
    disclaimer: "Estimate only. Use as a starting point before quotes, finance, tax, electrical, and fleet advice.",
  };
}

// NZ Business Intelligence Tools
const TOOLS: Record<string, { description: string; parameters: any; handler: (args: any) => any }> = {
  nz_sme_electrification_savings: {
    description: "Estimate what a NZ small business could save by switching vehicles, heat, and rooftop solar to electric alternatives. Deterministic, source-attributed, and based on MBIE, EECA, MfE, NZTA, and Rewiring Aotearoa assumptions.",
    parameters: {
      type: "object",
      properties: {
        business_type: { type: "string", enum: ["hospitality", "construction", "freight", "retail", "automotive_fleet", "creative", "ece", "professional_other"] },
        region: { type: "string", description: "NZ region, e.g. Auckland, Waikato, Wellington, Canterbury" },
        monthly_fuel_spend_nzd: { type: "number", description: "Average monthly spend on petrol, diesel, LPG, gas, or coal" },
        fuel_types: { type: "array", items: { type: "string", enum: ["petrol", "diesel", "lpg", "natural_gas", "coal"] } },
        vehicle_count: { type: "number", description: "Number of business vehicles" },
        vehicle_type: { type: "string", enum: ["passenger", "light_commercial", "heavy_commercial", "mixed"], description: "Required when vehicle_count is above zero" },
        premises_type: { type: "string", enum: ["own_freehold", "lease_long_term", "lease_short_term"] },
        rooftop_solar_suitable: { type: "string", enum: ["yes", "no", "unsure"] },
        monthly_electricity_spend_nzd: { type: "number", description: "Average monthly electricity bill" },
      },
      required: ["business_type", "region", "monthly_fuel_spend_nzd", "fuel_types", "vehicle_count", "premises_type", "rooftop_solar_suitable", "monthly_electricity_spend_nzd"],
    },
    handler: (args) => calculateSmeElectrification(args as SmeElectrificationInput),
  },
  nz_employment_cost: {
    description: "Calculate the true annual cost of a NZ employee including KiwiSaver (3.5%), ACC, annual leave, sick leave, public holidays, recruitment",
    parameters: {
      type: "object",
      properties: {
        annual_salary: { type: "number", description: "Gross annual salary in NZD" },
        kiwisaver_rate: { type: "number", description: "Employer KiwiSaver rate (default 3.5)", default: 3.5 },
      },
      required: ["annual_salary"],
    },
    handler: ({ annual_salary, kiwisaver_rate = 3.5 }) => {
      const ks = annual_salary * (kiwisaver_rate / 100);
      const acc = annual_salary * 0.028;
      const annual_leave = annual_salary * (20 / 260);
      const sick_leave = annual_salary * (10 / 260);
      const public_holidays = annual_salary * (11.5 / 260);
      const recruitment = 2000;
      const total = annual_salary + ks + acc + annual_leave + sick_leave + public_holidays + recruitment;
      return {
        salary: annual_salary, kiwisaver: Math.round(ks), acc_levy: Math.round(acc),
        annual_leave_cost: Math.round(annual_leave), sick_leave_cost: Math.round(sick_leave),
        public_holiday_cost: Math.round(public_holidays), recruitment_amortised: recruitment,
        total_annual_cost: Math.round(total),
        percentage_above_salary: Math.round((total / annual_salary - 1) * 100) + "%",
      };
    },
  },
  nz_gst_calculator: {
    description: "Calculate NZ GST (15%). Convert between GST-inclusive and GST-exclusive amounts.",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number", description: "The dollar amount" },
        direction: { type: "string", enum: ["add_gst", "remove_gst"] },
      },
      required: ["amount", "direction"],
    },
    handler: ({ amount, direction }) => {
      if (direction === "add_gst") {
        return { exclusive: amount, gst: Math.round(amount * 0.15 * 100) / 100, inclusive: Math.round(amount * 1.15 * 100) / 100 };
      } else {
        const exclusive = Math.round(amount / 1.15 * 100) / 100;
        return { inclusive: amount, gst: Math.round((amount - exclusive) * 100) / 100, exclusive };
      }
    },
  },
  nz_minimum_wage_check: {
    description: "Check if an hourly rate meets NZ minimum wage requirements as of April 2026",
    parameters: {
      type: "object",
      properties: {
        hourly_rate: { type: "number", description: "The hourly rate in NZD to check" },
        worker_type: { type: "string", enum: ["adult", "starting_out", "training"], default: "adult" },
      },
      required: ["hourly_rate"],
    },
    handler: ({ hourly_rate, worker_type = "adult" }) => {
      const rates: Record<string, number> = { adult: 23.95, starting_out: 19.16, training: 19.16 };
      const minimum = rates[worker_type];
      const compliant = hourly_rate >= minimum;
      return {
        hourly_rate, worker_type, minimum_required: minimum, compliant,
        shortfall: compliant ? 0 : Math.round((minimum - hourly_rate) * 100) / 100,
        message: compliant ? "This rate meets the NZ minimum wage requirement." : `This rate is $${(minimum - hourly_rate).toFixed(2)}/hr below minimum wage.`,
      };
    },
  },
  nz_paye_calculator: {
    description: "Calculate NZ PAYE tax on annual income using 2026 tax brackets",
    parameters: {
      type: "object",
      properties: {
        annual_income: { type: "number", description: "Annual gross income in NZD" },
        includes_acc: { type: "boolean", default: true },
      },
      required: ["annual_income"],
    },
    handler: ({ annual_income, includes_acc = true }) => {
      let tax = 0;
      const brackets = [
        { limit: 14000, rate: 0.105 },
        { limit: 48000, rate: 0.175 },
        { limit: 70000, rate: 0.30 },
        { limit: 180000, rate: 0.33 },
        { limit: Infinity, rate: 0.39 },
      ];
      let remaining = annual_income;
      let prev = 0;
      for (const b of brackets) {
        const taxable = Math.min(remaining, b.limit - prev);
        if (taxable <= 0) break;
        tax += taxable * b.rate;
        remaining -= taxable;
        prev = b.limit;
      }
      const acc = includes_acc ? annual_income * 0.0153 : 0;
      return {
        gross_income: annual_income,
        paye: Math.round(tax),
        acc_levy: Math.round(acc),
        net_income: Math.round(annual_income - tax - acc),
        effective_rate: (tax / annual_income * 100).toFixed(1) + "%",
      };
    },
  },
  nz_food_safety_temp_check: {
    description: "Validate a food temperature against NZ Food Act 2014 safe temperature requirements",
    parameters: {
      type: "object",
      properties: {
        temperature_celsius: { type: "number" },
        food_type: { type: "string", enum: ["chiller", "freezer", "cooking", "hot_holding", "cooling"] },
      },
      required: ["temperature_celsius", "food_type"],
    },
    handler: ({ temperature_celsius, food_type }) => {
      const limits: Record<string, any> = {
        chiller: { max: 5, warning: 4, unit: "max" },
        freezer: { max: -15, warning: -18, unit: "max" },
        cooking: { min: 75, warning: 70, unit: "min" },
        hot_holding: { min: 65, warning: 60, unit: "min" },
        cooling: { max: 5, warning: 8, unit: "max" },
      };
      const limit = limits[food_type];
      let status: string;
      if (limit.unit === "max") {
        status = temperature_celsius <= limit.warning ? "pass" : temperature_celsius <= limit.max ? "warning" : "fail";
      } else {
        status = temperature_celsius >= limit.min ? "pass" : temperature_celsius >= limit.warning ? "warning" : "fail";
      }
      return { temperature_celsius, food_type, status, message: `${temperature_celsius}°C — ${status.toUpperCase()}` };
    },
  },
};

const app = new Hono();

app.options("/*", (c) => new Response(null, { headers: corsHeaders }));

// MCP-compatible endpoints
app.post("/*", async (c) => {
  const body = await c.req.json();
  const { method, params, id } = body;

  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (method === "initialize") {
    return c.json({
      jsonrpc: "2.0", id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "assembl-nz", version: "1.0.0" },
      },
    }, 200, headers);
  }

  if (method === "tools/list") {
    const tools = Object.entries(TOOLS).map(([name, t]) => ({
      name, description: t.description, inputSchema: t.parameters,
    }));
    return c.json({ jsonrpc: "2.0", id, result: { tools } }, 200, headers);
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    const tool = TOOLS[toolName];
    if (!tool) {
      return c.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } }, 200, headers);
    }
    try {
      const result = tool.handler(toolArgs);
      return c.json({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      }, 200, headers);
    } catch (e) {
      return c.json({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Unknown"}` }], isError: true },
      }, 200, headers);
    }
  }

  return c.json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } }, 200, headers);
});

// Health check
app.get("/*", (c) => c.json({ status: "ok", server: "assembl-nz", version: "1.0.0", tools: Object.keys(TOOLS) }, 200, corsHeaders));

Deno.serve(app.fetch);
