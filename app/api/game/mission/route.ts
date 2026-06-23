/**
 * Complete a mission → mark it done and pay out the points.
 *
 * POST { missionId } → { ok, awarded, points, level, ... }
 *
 * The update is guarded on `completed = false` so a mission can only ever pay
 * out once, even on a double-tap. Daily missions pay 'daily-mission', weekly pay
 * 'weekly-mission' (the authoritative values live in award_points).
 */
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { missionId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, reason: 'invalid body' }, { status: 400 });
  }
  const missionId = String(body.missionId ?? '');
  if (!missionId) return Response.json({ ok: false, reason: 'missing missionId' }, { status: 400 });

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return Response.json({ ok: true, signedIn: false, awarded: 0 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: true, signedIn: false, awarded: 0 });

  // Flip it to completed only if it is currently open (and belongs to the user).
  const { data: flipped } = await supabase
    .from('missions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', missionId)
    .eq('user_id', user.id)
    .eq('completed', false)
    .select('kind')
    .single();

  if (!flipped) {
    // Already completed or not found — no double payout.
    return Response.json({ ok: true, signedIn: true, awarded: 0, alreadyDone: true });
  }

  const action = flipped.kind === 'weekly' ? 'weekly-mission' : 'daily-mission';
  const { data, error } = await supabase.rpc('award_points', { _action: action, _meta: {} });
  if (error) return Response.json({ ok: false, signedIn: true, reason: error.message });

  const result = (data ?? {}) as Record<string, unknown>;
  return Response.json({
    ok: true,
    signedIn: true,
    awarded: result.awarded ?? 0,
    points: result.points ?? 0,
    level: result.level ?? 'beginner',
    streak: result.streak ?? 0,
    leveledUp: result.leveled_up ?? false,
    newBadges: result.new_badges ?? [],
  });
}
