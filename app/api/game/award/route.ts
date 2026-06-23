/**
 * The shared points emitter. Atlas and Pilot both POST here on every meaningful
 * action; the authoritative points live in the award_points() RPC (the client
 * cannot farm points by lying about a value — it only names the action).
 *
 * POST { action: string, meta?: object }
 *   → { ok, awarded, points, level, streak, leveledUp, newBadges }
 *
 * Anonymous visitors get a clean no-op ({ ok:true, signedIn:false }) so the free
 * surfaces never block on auth.
 */
import { createClient } from '@/lib/supabase/server';
import { ACTION_BY_KEY } from '@/lib/game/points';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { action?: string; meta?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, reason: 'invalid body' }, { status: 400 });
  }

  const action = String(body.action ?? '');
  if (!ACTION_BY_KEY[action]) {
    return Response.json({ ok: false, reason: 'unknown action' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return Response.json({ ok: true, signedIn: false, awarded: 0 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: true, signedIn: false, awarded: 0 });
  }

  const { data, error } = await supabase.rpc('award_points', {
    _action: action,
    _meta: body.meta ?? {},
  });

  if (error) {
    return Response.json({ ok: false, signedIn: true, reason: error.message }, { status: 200 });
  }

  const result = (data ?? {}) as Record<string, unknown>;
  return Response.json({
    ok: result.ok ?? true,
    signedIn: true,
    awarded: result.awarded ?? 0,
    points: result.points ?? 0,
    level: result.level ?? 'beginner',
    streak: result.streak ?? 0,
    leveledUp: result.leveled_up ?? false,
    newBadges: result.new_badges ?? [],
  });
}
