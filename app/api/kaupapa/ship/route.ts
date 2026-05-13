/**
 * POST /api/kaupapa/ship — mark a kaupapa as shipped
 *
 * Form POST from the "I shipped this" button on the kaupapa list.
 * Auth: required. RLS allows update only if auth.email() === requested_by OR built_by.
 *
 * Side effects:
 *   - sets status = 'shipped' and shipped_at = now()
 *   - inserts a kaupapa_completions row attributed to the shipper
 *   - (TODO Week 2) bumps adoption_metrics.quests_shipped for current week
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = cookies();
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
  const kaupapaId = String(form.get("kaupapa_id") ?? "").trim();
  if (!kaupapaId) {
    return NextResponse.json({ error: "kaupapa_id required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("kaupapa")
    .update({ status: "shipped", shipped_at: now })
    .eq("id", kaupapaId);

  if (updateError) {
    console.error("kaupapa update failed", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: completionError } = await supabase
    .from("kaupapa_completions")
    .insert({ kaupapa_id: kaupapaId, completed_by: user.email });

  if (completionError) {
    console.error("kaupapa_completion insert failed", completionError);
    // Don't fail the request — kaupapa is already marked shipped
  }

  return NextResponse.redirect(new URL("/internal/kaupapa", req.url), { status: 303 });
}
