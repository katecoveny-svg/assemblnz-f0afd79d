import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = crypto.randomUUID();
  const url = new URL(`/insurance/results/${id}`, req.url);

  for (const key of [
    "tenure",
    "region",
    "floorAreaSqm",
    "houseSumInsured",
    "contentsSumInsured",
    "dependants",
    "workFromHome",
    "vehicleCount",
    "vehicleValue",
    "vehicleCover",
    "annualIncome",
    "mortgageBalance",
    "lifeCover",
    "soleEarner",
    "savings",
    "kiwiSaverBalance",
    "incomeProtectionMonthly",
  ]) {
    const value = form.get(key);
    if (value !== null) url.searchParams.set(key, String(value));
  }

  return NextResponse.redirect(url, { status: 303 });
}
