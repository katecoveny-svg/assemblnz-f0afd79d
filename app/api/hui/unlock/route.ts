import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/hui/unlock  { email }
 * Email gate for anonymous Hui users after their first free run.
 *
 * Best-effort capture: writes to the hui_leads table when Supabase is
 * configured, but never blocks the user — if storage is unavailable the unlock
 * still succeeds so the flow keeps working.
 */

async function captureLead(email: string, source: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/hui_leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({ email, source, created_at: new Date().toISOString() }),
    });
  } catch (error) {
    console.warn("[hui/unlock] lead capture skipped", error);
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const source = String(body?.source ?? "hui-landing").trim().slice(0, 60);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  await captureLead(email, source);
  return NextResponse.json({ unlocked: true });
}
