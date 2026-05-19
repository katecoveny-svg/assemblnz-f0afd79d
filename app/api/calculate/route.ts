/**
 * POST /api/calculate — form post from /electrify
 *
 * 1. Parse + validate form
 * 2. Run the deterministic calculator
 * 3. Insert into electrify_leads (no email yet — captured at PDF step)
 * 4. Redirect to /electrify/results/[id]
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { calculateElectrification, type ElectrifyInput, type FuelType, type BusinessType, type VehicleType, type PremisesType } from "@/lib/electrify/calculator";

const RESULT_COOKIE_PREFIX = "assembl_electrify_result_";

export async function POST(req: Request) {
  const form = await req.formData();

  const routeType = (String(form.get("routeType") ?? "business") || "business") as
    | "business" | "household" | "landlord" | "new-build";
  const businessType = String(form.get("businessType") ?? "professional_other") as BusinessType;
  const region = String(form.get("region") ?? "").trim();
  const monthlyFuelSpendNzd = Number(form.get("monthlyFuelSpendNzd") ?? 0);
  const fuelTypes = form.getAll("fuelTypes").map(String) as FuelType[];
  const vehicleCount = Number(form.get("vehicleCount") ?? 0);
  const vehicleType = (form.get("vehicleType") ? String(form.get("vehicleType")) : undefined) as VehicleType | undefined;
  const premisesType = String(form.get("premisesType") ?? "own_freehold") as PremisesType;
  const rooftopSolarSuitable = String(form.get("rooftopSolarSuitable") ?? "unsure") as "yes" | "no" | "unsure";
  const monthlyElectricitySpendNzd = Number(form.get("monthlyElectricitySpendNzd") ?? 0);

  // Per-route extras (passed to calculator for tuning)
  const householdSize = String(form.get("householdSize") ?? "").trim();
  const rentalCount = Number(form.get("rentalCount") ?? 0);
  const tenancyLength = String(form.get("tenancyLength") ?? "").trim();
  const buildType = String(form.get("buildType") ?? "").trim();

  // Minimal validation — region + at least one fuel
  if (!region || fuelTypes.length === 0) {
    return NextResponse.json(
      { error: "Required field missing. Please complete the form." },
      { status: 400 }
    );
  }

  const input: ElectrifyInput = {
    businessType,
    region,
    monthlyFuelSpendNzd,
    fuelTypes,
    vehicleCount,
    vehicleType,
    premisesType,
    rooftopSolarSuitable,
    monthlyElectricitySpendNzd,
    routeType,
    householdSize,
    rentalCount,
    tenancyLength,
    buildType,
  };

  const result = calculateElectrification(input);
  const localResultId = crypto.randomUUID();
  const resultSnapshot = {
    id: localResultId,
    route_type: routeType,
    business_type: input.businessType,
    region: input.region,
    annual_savings_current_nzd: result.annualSavingsCurrentNzd,
    annual_savings_cheap_finance_nzd: result.annualSavingsCheapFinanceNzd,
    payback_years: result.paybackYears,
    ten_year_savings_nzd: result.tenYearSavingsNzd,
    co2e_avoided_tonnes: result.co2eAvoidedTonnes,
    upfront_capex_estimate_nzd: result.upfrontCapexEstimateNzd,
    recommended_sequence: result.recommendedSequence,
    solar_recommendation: result.solarRecommendation,
    result_confidence: result.confidence,
    assumptions_version: result.assumptionsVersion,
  };

  function redirectWithSnapshot(id: string) {
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const response = NextResponse.redirect(new URL(`/electrify/results/${id}`, origin), { status: 303 });
    response.cookies.set(`${RESULT_COOKIE_PREFIX}${id}`, encodeURIComponent(JSON.stringify({ ...resultSnapshot, id })), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });
    return response;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return redirectWithSnapshot(localResultId);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data, error } = await supabase
    .from("electrify_leads")
    .insert({
      route_type: routeType,
      business_type: input.businessType,
      region: input.region,
      monthly_fuel_spend_nzd: input.monthlyFuelSpendNzd,
      fuel_types: input.fuelTypes,
      vehicle_count: input.vehicleCount,
      vehicle_type: input.vehicleType,
      premises_type: input.premisesType,
      rooftop_solar_suitable: input.rooftopSolarSuitable,
      monthly_electricity_spend_nzd: input.monthlyElectricitySpendNzd,
      annual_savings_current_nzd: result.annualSavingsCurrentNzd,
      annual_savings_cheap_finance_nzd: result.annualSavingsCheapFinanceNzd,
      payback_years: result.paybackYears,
      ten_year_savings_nzd: result.tenYearSavingsNzd,
      co2e_avoided_tonnes: result.co2eAvoidedTonnes,
      upfront_capex_estimate_nzd: result.upfrontCapexEstimateNzd,
      recommended_sequence: result.recommendedSequence,
      solar_recommendation: result.solarRecommendation,
      result_confidence: result.confidence,
      assumptions_version: result.assumptionsVersion,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("electrify lead insert failed", error);
    return redirectWithSnapshot(localResultId);
  }

  return redirectWithSnapshot(data.id);
}
