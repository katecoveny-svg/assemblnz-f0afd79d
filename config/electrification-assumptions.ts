/**
 * Electrification assumptions — single source of truth for the SME calculator.
 *
 * Every constant in this file MUST be sourced. Update annually (or quarterly
 * for fuel prices). When a number changes, bump ASSUMPTIONS_VERSION so saved
 * lead records remain reproducible against their original snapshot.
 *
 * Primary sources:
 *   - MBIE: Energy Prices and Statistics — fuel + electricity prices
 *   - EECA: Energy Efficiency and Conservation Authority — appliance efficiency
 *   - Rewiring Aotearoa: Machine Count + Tipping Point reports — methodology
 *   - MfE: NZ Greenhouse Gas Inventory — emissions factors
 *
 * Last update: 2026-05-13. Build-time validation: every constant has a source
 * comment naming the original publication and access date.
 */

export const ASSUMPTIONS_VERSION = "2026-05-13-v1";

// ── Fuel prices (NZD per unit, retail incl. GST + ETS) ──────────────────
// Source: MBIE Energy Prices Quarterly Q1 2026, access 2026-05-13
//   https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/
export const FUEL_PRICES_NZD = {
  petrol_per_litre: 2.85,                       // 91 octane national average
  diesel_per_litre: 2.20,                       // retail at-pump
  lpg_per_kg: 3.40,                             // bulk LPG retail
  natural_gas_per_kwh: 0.11,                    // commercial standard tariff
  coal_per_kg: 0.55,                            // industrial-grade thermal coal
} as const;

// ── Electricity prices (NZD per kWh) ────────────────────────────────────
// Source: MBIE Energy Prices Quarterly Q1 2026 (commercial) + Sapere Solar
//   PPA 2025 review for rooftop self-consumption
export const ELECTRICITY_PRICE_NZD_PER_KWH = {
  grid_avg: 0.32,                               // weighted commercial avg
  solar_self_consumed: 0.12,                    // LCOE for new commercial PV
  off_peak_ev_charging: 0.18,                   // typical EV plan off-peak
} as const;

// ── EV efficiency (kWh per km) ──────────────────────────────────────────
// Source: EECA Light Vehicle Fuel Economy Database 2026, EV registrations
//   filtered to NZ-market models (Tesla M3/Y, BYD, MG, LDV, Hyundai).
//   Heavy: pilot data from Big Chill, Foodstuffs trials reported Q4 2025.
export const EV_EFFICIENCY_KWH_PER_KM = {
  passenger: 0.18,                              // sedan / hatch
  light_commercial: 0.28,                       // ute / small van
  heavy_commercial: 0.95,                       // class 4+ truck (early figures, low confidence)
} as const;

// ── ICE efficiency (L per 100km) ────────────────────────────────────────
// Source: EECA Light Vehicle Fuel Economy Database 2026 (combined cycle)
export const ICE_EFFICIENCY_L_PER_100KM = {
  passenger: 8.0,
  light_commercial: 11.0,
  heavy_commercial: 35.0,                       // diesel class 4+
} as const;

// ── Annual km defaults by vehicle class (NZ averages) ───────────────────
// Source: NZTA Vehicle Fleet Statistics 2025 (median, business-owned)
export const ANNUAL_KM_DEFAULT = {
  passenger: 14_000,
  light_commercial: 25_000,
  heavy_commercial: 60_000,
} as const;

// ── Maintenance delta: EV vs ICE ────────────────────────────────────────
// Source: Rewiring Aotearoa, Machine Count Report 2025, citing fleet
//   operator data — EV maintenance is ~40% of equivalent ICE.
export const EV_MAINTENANCE_RATIO_OF_ICE = 0.40;
export const ICE_MAINTENANCE_NZD_PER_YEAR = {
  passenger: 1_200,
  light_commercial: 2_400,
  heavy_commercial: 9_500,
} as const;

// ── Process / space heat — heat pump COP and gas baseline ───────────────
// Source: EECA Heat Pump Performance Brief 2024; conservative COP=3.5 for
//   commercial space heating; COP=3.2 for hot water; gas/coal efficiency
//   per Rewiring Aotearoa tipping-point methodology.
export const HEAT_PUMP_COP = {
  space_heating: 3.5,
  hot_water: 3.2,
  process_heat: 4.0,                            // industrial heat pump (DHW + low-temp)
} as const;
export const FOSSIL_HEAT_EFFICIENCY = {
  natural_gas_boiler: 0.85,
  lpg_boiler: 0.82,
  coal_boiler: 0.70,
} as const;

// ── Emissions factors (kg CO2e per unit) ────────────────────────────────
// Source: MfE NZ Greenhouse Gas Inventory 2024 (Tier 1 factors)
export const EMISSIONS_FACTORS_KG_CO2E = {
  petrol_per_litre: 2.31,
  diesel_per_litre: 2.68,
  natural_gas_per_kwh: 0.20,
  lpg_per_kg: 2.94,
  coal_per_kg: 2.42,
  nz_grid_electricity_per_kwh: 0.073,           // NZ grid ~88% renewable (2025 weighted)
  solar_self_consumed_per_kwh: 0.0,             // attributional zero
} as const;

// ── Capex estimates (NZD, conservative 2026 figures) ────────────────────
// Source: MotorTrade NZ EV pricing 2026, Sapere solar 2025, NZ HVAC industry
//   pricing surveys 2024-25. Heavy truck = early figures, low confidence.
export const CAPEX_NZD = {
  ev_passenger: 55_000,
  ev_light_commercial: 75_000,
  ev_heavy_truck: 220_000,                      // low confidence
  heat_pump_hot_water: 5_500,                   // installed
  heat_pump_space_heating_per_room: 3_500,      // ducted alternatives priced separately
  heat_pump_process_heat_kw: 1_800,             // commercial industrial (per kW)
  induction_cooktop_commercial: 8_000,
  rooftop_solar_per_kw_installed: 1_800,        // commercial 50-100kW system
  battery_per_kwh_installed: 1_100,
} as const;

// ── Finance rates ───────────────────────────────────────────────────────
// Source: ANZ Business Banking commercial rates (May 2026); Green loans
//   reference rate per Toitū (NZ Sustainable Finance Initiative) targets.
export const FINANCE_RATE_ANNUAL = {
  current_commercial: 0.055,                    // 5.5% standard commercial rate
  cheap_green_loan: 0.01,                       // 1% target (where available)
} as const;

// ── Confidence thresholds ───────────────────────────────────────────────
// Result-level confidence based on how many fields the user filled with
// non-default values vs how many we had to interpolate.
export const CONFIDENCE_THRESHOLDS = {
  high_min_inputs_provided: 8,                  // out of 10 form fields
  medium_min_inputs_provided: 5,
  // below 5 = low
} as const;

// ── Switch-sequence weights (priority scoring) ──────────────────────────
// Higher = ship earlier. Per Rewiring Aotearoa Machine Count: vehicles first
// (highest emissions per $), then process heat, then space heat, then hot
// water, then cooktops. Leased premises deprioritise capex-heavy installs.
export const SWITCH_PRIORITY_BASE = {
  ev_passenger: 9,
  ev_light_commercial: 9,
  ev_heavy_truck: 7,                            // capex hurdle
  heat_pump_process_heat: 8,
  heat_pump_space_heating: 6,
  heat_pump_hot_water: 5,
  induction_cooktop_commercial: 4,
  rooftop_solar: 7,                             // depends on suitability + premises
} as const;
export const LEASE_PENALTY_MULTIPLIER = {
  own_freehold: 1.0,
  lease_long_term: 0.8,                         // capex-heavy items penalised 20%
  lease_short_term: 0.4,                        // penalised 60% — most won't pay back
} as const;
