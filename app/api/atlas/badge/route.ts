/**
 * Atlas gamification — award the "First step" badge and read level + badges.
 *
 * POST  → award the "First step" badge for the signed-in user's first Atlas
 *         conversation. Idempotent (the DB function dedupes). No-ops cleanly for
 *         anonymous visitors so the free surface never blocks on auth.
 * GET   → return the signed-in user's { level, badges } for display on /atlas.
 *
 * Badges live on public.profiles (migration 20260624090100). RLS + the
 * SECURITY DEFINER award_badge() function ensure a user only ever touches their
 * own row.
 */
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const FIRST_STEP = { id: 'first-step', label: 'First step' };

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return Response.json({ signedIn: false, level: 'beginner', badges: [] });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ signedIn: false, level: 'beginner', badges: [] });
  }

  const { data } = await supabase.from('profiles').select('level, badges').eq('id', user.id).single();
  return Response.json({
    signedIn: true,
    level: data?.level ?? 'beginner',
    badges: data?.badges ?? [],
  });
}

export async function POST() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    // Supabase env not configured (e.g. local dev without keys) — soft no-op.
    return Response.json({ awarded: false, signedIn: false, badges: [] });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Anonymous visitor — gamification is display-only until they sign in.
    return Response.json({ awarded: false, signedIn: false, badges: [] });
  }

  const { data, error } = await supabase.rpc('award_badge', {
    _badge_id: FIRST_STEP.id,
    _label: FIRST_STEP.label,
  });

  if (error) {
    return Response.json({ awarded: false, signedIn: true, error: error.message }, { status: 200 });
  }

  return Response.json({ awarded: true, signedIn: true, badges: data ?? [] });
}
