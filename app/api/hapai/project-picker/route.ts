import { NextResponse } from "next/server";
import type { HapaiFunction, HapaiTeamSize, HapaiTier } from "@/lib/hapai/project-recommender";

const TIERS = new Set(["akoranga", "kaimahi", "tohunga", "rangatira", "pou"]);
const FUNCTIONS = new Set(["ops", "hr", "marketing", "finance", "sales", "support", "other"]);
const SIZES = new Set(["solo", "small", "medium", "large"]);

export async function POST(req: Request) {
  const form = await req.formData();
  const tier = String(form.get("tier") ?? "kaimahi") as HapaiTier;
  const teamSize = String(form.get("teamSize") ?? "small") as HapaiTeamSize;
  const primaryFunction = String(form.get("primaryFunction") ?? "ops") as HapaiFunction;
  const focus = String(form.get("focus") ?? "").trim().slice(0, 500);

  if (!TIERS.has(tier) || !FUNCTIONS.has(primaryFunction) || !SIZES.has(teamSize)) {
    return NextResponse.json({ error: "Please complete the project picker." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const url = new URL(`/hapai/projects/results/${id}`, req.url);
  url.searchParams.set("tier", tier);
  url.searchParams.set("teamSize", teamSize);
  url.searchParams.set("primaryFunction", primaryFunction);
  if (focus) url.searchParams.set("focus", focus);

  return NextResponse.redirect(url, { status: 303 });
}
