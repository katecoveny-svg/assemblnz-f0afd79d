/**
 * Daily + weekly mission templates and the deterministic picker.
 *
 * Atlas "writes today's mission" by choosing from these pools, seeded by the
 * user + date so the mission is stable across a day and varies day to day. A
 * mission is completed from /journey; completion awards the daily/weekly points
 * via award_points (the mission's own `action` is the in-app activity it nudges,
 * but completion always pays out 'daily-mission' / 'weekly-mission').
 *
 * Isomorphic.
 */

export type MissionTemplate = {
  title: string;
  detail: string;
  /** the activity it nudges (hint for the UI; payout is daily/weekly-mission). */
  action: string;
  /** minimum level index (0=beginner) this mission can appear at. */
  minLevel?: number;
};

export const DAILY_MISSIONS: MissionTemplate[] = [
  { title: 'Spot the slop', detail: 'Find one AI-written sentence that reads like slop — “leverage”, “seamless”, “robust” — and rewrite it plainly.', action: 'spot-slop' },
  { title: 'Name one task', detail: 'Pick one thing you repeated this week that felt slow or admin-heavy. Tell Atlas about it.', action: 'diagnostic-complete' },
  { title: 'Try a new agent', detail: 'Open an agent you have not used yet and give it a real task.', action: 'use-agent' },
  { title: 'Rewrite a prompt', detail: 'Take a prompt you used and make it clearer — say the goal, the input, and the output you want.', action: 'spot-slop' },
  { title: 'Say no once', detail: 'Notice one place AI is the wrong tool today, and say so. Knowing the limits is the skill.', action: 'say-no' },
  { title: 'Two-minute brief', detail: 'Ask 9am Brief to map your day before the kettle boils.', action: 'use-agent' },
  { title: 'Privacy check', detail: 'Look at one task that touches other people’s details. Would the Privacy Act 2020 apply? Atlas can talk it through.', action: 'privacy-lesson', minLevel: 1 },
];

export const WEEKLY_MISSIONS: MissionTemplate[] = [
  { title: 'Build a Pilot draft', detail: 'Take your best automation idea to Pilot and draft an agent for it. You do not have to ship it.', action: 'build-first-agent', minLevel: 1 },
  { title: 'Save thirty minutes', detail: 'Use an agent on a real task this week and tell us where the half hour went.', action: 'use-agent' },
  { title: 'Finish the Privacy Act lesson', detail: 'Work through the Privacy Act 2020 mini-lesson with Atlas — safe adoption starts here.', action: 'privacy-lesson' },
  { title: 'Bring a colleague', detail: 'Help one workmate map their week with Atlas. Adoption spreads person to person.', action: 'help-colleague', minLevel: 2 },
];

/** A small stable hash for date+user seeding (no Math.random — must be stable). */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Pick today's daily mission for a user+date+level (stable within the day). */
export function pickDaily(seed: number, levelIndex: number): MissionTemplate {
  const pool = DAILY_MISSIONS.filter((m) => (m.minLevel ?? 0) <= levelIndex);
  return pool[seed % pool.length];
}

/** Pick this week's weekly mission. */
export function pickWeekly(seed: number, levelIndex: number): MissionTemplate {
  const pool = WEEKLY_MISSIONS.filter((m) => (m.minLevel ?? 0) <= levelIndex);
  return pool[seed % pool.length];
}
