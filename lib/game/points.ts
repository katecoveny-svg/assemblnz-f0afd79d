/**
 * The game layer — canonical points, levels and badges.
 *
 * This is the single source of truth shared by Atlas (the adoption coach) and
 * Pilot (the agent builder). Both surfaces emit actions to `/api/game/award`;
 * the SECURITY DEFINER `award_points()` RPC owns the authoritative points (so a
 * client can never farm points by lying about the value). The values here are
 * mirrored into the `point_rules` table by migration 20260624120000 and used by
 * the UI for display. Keep the two in sync — the migration seeds from this list.
 *
 * Isomorphic: safe on the server and the client.
 */

/** A point-earning action. `dedupeKey` rules are enforced in the RPC. */
export type GameAction = {
  /** stable action id — the key passed to /api/game/award. */
  action: string;
  /** authoritative points awarded. */
  points: number;
  /** daily points cap for this action (null = uncapped). */
  dailyCap: number | null;
  /** once-ever per user (deduped on the action, or on action+meta for per-agent). */
  once: boolean;
  /** dedupe also on this meta key (e.g. 'agent' → once per agent installed). */
  dedupeMeta?: string;
  /** badge id awarded the first time this action fires (optional). */
  badge?: string;
  /** human label for the activity feed. */
  label: string;
};

/** The full action → points table (brief addendum, tunable). */
export const GAME_ACTIONS: GameAction[] = [
  { action: 'first-conversation', points: 50, dailyCap: null, once: true, badge: 'discover-1', label: 'First conversation with Atlas' },
  { action: 'install-agent', points: 100, dailyCap: null, once: true, dedupeMeta: 'agent', badge: 'first-install', label: 'Installed an agent' },
  { action: 'use-agent', points: 25, dailyCap: 200, once: false, badge: 'first-real-use', label: 'Used an agent for a real task' },
  { action: 'daily-mission', points: 50, dailyCap: null, once: false, label: 'Completed the daily mission' },
  { action: 'weekly-mission', points: 200, dailyCap: null, once: false, label: 'Completed the weekly mission' },
  { action: 'streak-7', points: 100, dailyCap: null, once: false, badge: 'streak-7', label: '7-day streak' },
  { action: 'streak-30', points: 500, dailyCap: null, once: false, badge: 'streak-30', label: '30-day streak' },
  { action: 'build-first-agent', points: 500, dailyCap: null, once: true, badge: 'first-build', label: 'Built your first agent in Pilot' },
  { action: 'ship-personal', points: 200, dailyCap: null, once: false, label: 'Shipped a Pilot agent to personal use' },
  { action: 'submit-marketplace', points: 1000, dailyCap: null, once: false, badge: 'first-publish', label: 'Submitted an agent + passed review' },
  { action: 'help-colleague', points: 150, dailyCap: null, once: false, badge: 'first-team-share', label: 'Helped a colleague onboard' },
  { action: 'say-no', points: 50, dailyCap: 150, once: false, label: 'Said no to a bad AI suggestion' },
  { action: 'spot-slop', points: 75, dailyCap: 150, once: false, badge: 'no-slop-spotted', label: 'Spotted AI slop in a self-review' },
  { action: 'privacy-lesson', points: 100, dailyCap: null, once: true, badge: 'privacy-pro', label: 'Completed the Privacy Act mini-lesson' },
  { action: 'tikanga-lesson', points: 100, dailyCap: null, once: true, badge: 'tikanga-aware', label: 'Completed the tikanga mini-lesson' },
  // Pilot build-step micro-rewards (the 13-step flow earns points as it goes).
  { action: 'pilot-tested', points: 100, dailyCap: null, once: false, label: 'Ran the generated tests in Pilot' },
  { action: 'pilot-launch-plan', points: 75, dailyCap: null, once: false, label: 'Generated a launch checklist' },
  { action: 'diagnostic-complete', points: 75, dailyCap: null, once: true, label: 'Mapped your week with Atlas' },
];

export const ACTION_BY_KEY: Record<string, GameAction> = Object.fromEntries(
  GAME_ACTIONS.map((a) => [a.action, a]),
);

/** A literacy level, points-gated. */
export type GameLevel = {
  key: string;
  label: string;
  /** points required to reach it. */
  at: number;
  /** what it unlocks / means (one line). */
  note: string;
};

/** Six levels, points-gated (brief addendum). */
export const LEVELS: GameLevel[] = [
  { key: 'beginner', label: 'Beginner', at: 0, note: 'Just arrived.' },
  { key: 'familiar', label: 'Familiar', at: 500, note: 'A few agents used, the basics grasped.' },
  { key: 'fluent', label: 'Fluent', at: 2000, note: 'Weekly use, and you know the limits.' },
  { key: 'builder', label: 'Builder', at: 5000, note: 'Building your own — a Pilot discount unlocks.' },
  { key: 'sensei', label: 'Sensei', at: 12000, note: 'You mentor others and can captain a team board.' },
  { key: 'kaitiaki', label: 'Kaitiaki', at: 25000, note: 'Custodian — you teach AI literacy across your org.' },
];

/** The level a points total sits in. */
export function levelForPoints(points: number): GameLevel {
  let current = LEVELS[0];
  for (const l of LEVELS) if (points >= l.at) current = l;
  return current;
}

/** The next level up, or null at the top. */
export function nextLevel(points: number): GameLevel | null {
  return LEVELS.find((l) => l.at > points) ?? null;
}

/** 0–1 progress through the current level band (1 at the top level). */
export function levelProgress(points: number): number {
  const cur = levelForPoints(points);
  const nxt = nextLevel(points);
  if (!nxt) return 1;
  return Math.max(0, Math.min(1, (points - cur.at) / (nxt.at - cur.at)));
}

/** Badge metadata for display (id → label + one-line description). */
export const BADGES: Record<string, { label: string; note: string }> = {
  'discover-1': { label: 'First step', note: 'Started your first conversation with Atlas.' },
  'first-install': { label: 'First install', note: 'Added your first agent.' },
  'first-real-use': { label: 'Real work', note: 'Used an agent for a real task.' },
  'first-build': { label: 'Builder', note: 'Built your first agent in Pilot.' },
  'first-publish': { label: 'Shipper', note: 'Submitted an agent that passed review.' },
  'first-team-share': { label: 'Team player', note: 'Helped a colleague get started.' },
  'privacy-pro': { label: 'Privacy pro', note: 'Completed the Privacy Act 2020 lesson.' },
  'tikanga-aware': { label: 'Tikanga aware', note: 'Completed the tikanga lesson.' },
  'no-slop-spotted': { label: 'No slop', note: 'Caught AI slop in a self-review.' },
  'streak-7': { label: '7-day streak', note: 'Showed up seven days running.' },
  'streak-30': { label: '30-day streak', note: 'A full month of practice.' },
  'streak-100': { label: '100-day streak', note: 'A hundred days. Kaitiaki energy.' },
  mentor: { label: 'Mentor', note: 'Helped three colleagues onboard.' },
  shipper: { label: 'Shipper x5', note: 'Shipped five agents.' },
  kaitiaki: { label: 'Kaitiaki', note: 'Custodian of AI literacy in your org.' },
};
