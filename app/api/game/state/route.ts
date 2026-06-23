/**
 * Game state for /journey — the whole scene in one read.
 *
 * Returns the player's points, level, streak, badges, today's daily mission
 * (generated if missing), the towns on their map (agents installed/used), recent
 * activity, and derived stats. Anonymous visitors get a display-only guest state
 * so /journey renders for everyone (with a prompt to sign in to save progress).
 */
import { createClient } from '@/lib/supabase/server';
import { LEVELS, levelForPoints, nextLevel, levelProgress, BADGES, ACTION_BY_KEY } from '@/lib/game/points';
import { pickDaily, seedFrom } from '@/lib/game/missions';

export const dynamic = 'force-dynamic';

type Badge = { id: string; awarded_at?: string };

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function guestState() {
  const today = utcToday();
  const tmpl = pickDaily(seedFrom(`guest:${today}`), 0);
  return {
    signedIn: false,
    points: 0,
    level: 'beginner',
    levelProgress: 0,
    nextLevel: LEVELS[1],
    streak: 0,
    badges: [] as { id: string; label: string; note: string }[],
    towns: [] as { slug: string; uses: number }[],
    activity: [] as { action: string; label: string; points: number; at: string }[],
    stats: { hoursSaved: 0, tasksAutomated: 0, agentsBuilt: 0 },
    mission: { id: null, title: tmpl.title, detail: tmpl.detail, points: 50, completed: false },
  };
}

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return Response.json(guestState());
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json(guestState());

  const { data: profile } = await supabase
    .from('profiles')
    .select('points, level, badges, streak')
    .eq('id', user.id)
    .single();

  const points: number = profile?.points ?? 0;
  const rawBadges: Badge[] = Array.isArray(profile?.badges) ? (profile!.badges as Badge[]) : [];
  const level = levelForPoints(points);

  // Ensure today's daily mission exists.
  const today = utcToday();
  const levelIndex = LEVELS.findIndex((l) => l.key === level.key);
  const tmpl = pickDaily(seedFrom(`${user.id}:${today}`), Math.max(0, levelIndex));
  await supabase
    .from('missions')
    .upsert(
      {
        user_id: user.id,
        kind: 'daily',
        for_date: today,
        title: tmpl.title,
        detail: tmpl.detail,
        action: tmpl.action,
        points: 50,
      },
      { onConflict: 'user_id,kind,for_date', ignoreDuplicates: true },
    );
  const { data: mission } = await supabase
    .from('missions')
    .select('id, title, detail, points, completed')
    .eq('user_id', user.id)
    .eq('kind', 'daily')
    .eq('for_date', today)
    .single();

  // Recent activity + towns from the ledger.
  const { data: events } = await supabase
    .from('point_events')
    .select('action, points, meta, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(120);

  const rows = events ?? [];
  const townUses = new Map<string, number>();
  let tasksAutomated = 0;
  let agentsBuilt = 0;
  for (const e of rows) {
    if (e.action === 'use-agent' || e.action === 'install-agent') {
      const slug = (e.meta as Record<string, unknown> | null)?.agent;
      if (typeof slug === 'string' && slug) townUses.set(slug, (townUses.get(slug) ?? 0) + 1);
    }
    if (e.action === 'use-agent') tasksAutomated += 1;
    if (e.action === 'build-first-agent' || e.action === 'ship-personal') agentsBuilt += 1;
  }

  return Response.json({
    signedIn: true,
    points,
    level: level.key,
    levelProgress: levelProgress(points),
    nextLevel: nextLevel(points),
    streak: profile?.streak ?? 0,
    badges: rawBadges
      .filter((b) => BADGES[b.id])
      .map((b) => ({ id: b.id, label: BADGES[b.id].label, note: BADGES[b.id].note })),
    towns: [...townUses.entries()].map(([slug, uses]) => ({ slug, uses })).sort((a, b) => b.uses - a.uses),
    activity: rows.slice(0, 12).map((e) => ({
      action: e.action,
      label: ACTION_BY_KEY[e.action]?.label ?? e.action,
      points: e.points,
      at: e.created_at,
    })),
    stats: {
      hoursSaved: Math.round(tasksAutomated * 0.25 * 10) / 10, // ~15 min per real task
      tasksAutomated,
      agentsBuilt,
    },
    mission: mission
      ? { id: mission.id, title: mission.title, detail: mission.detail, points: mission.points, completed: mission.completed }
      : null,
  });
}
