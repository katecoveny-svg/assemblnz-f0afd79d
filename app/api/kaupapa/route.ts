/**
 * POST /api/kaupapa — create a new kaupapa
 *
 * Accepts a form POST from /internal/kaupapa/new. Calculates XP value
 * (time_saved * 10 + small complexity bonus by risk_level) and inserts.
 *
 * Auth: required. RLS enforces requested_by === auth.email().
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COMPLEXITY_BONUS: Record<"low" | "medium" | "high", number> = {
  low: 5,
  medium: 25,
  high: 75,
};

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const form = await req.formData();

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const beneficiary = String(form.get("beneficiary") ?? "").trim() || null;
  const hours = Number(form.get("estimated_hours_saved_per_week") ?? 0);
  const riskLevel = String(form.get("risk_level") ?? "low") as "low" | "medium" | "high";
  const builtBy = String(form.get("built_by") ?? "").trim() || null;

  if (!title || !description) {
    return NextResponse.json({ error: "title and description required" }, { status: 400 });
  }
  if (!["low", "medium", "high"].includes(riskLevel)) {
    return NextResponse.json({ error: "invalid risk_level" }, { status: 400 });
  }

  const xpValue = Math.round(hours * 10 + COMPLEXITY_BONUS[riskLevel]);

  const { error } = await supabase.from("kaupapa").insert({
    title,
    description,
    requested_by: user.email,
    beneficiary,
    estimated_hours_saved_per_week: hours,
    risk_level: riskLevel,
    status: builtBy ? "in_progress" : "open",
    built_by: builtBy,
    xp_value: xpValue,
  });

  if (error) {
    console.error("kaupapa insert failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/internal/kaupapa", req.url), { status: 303 });
}
