/**
 * Access gating — limits per surface and tier.
 *
 * Discoverability without entitlement: anyone can try a tool or a chat, but the
 * anonymous allowance is small. Capturing an email (with IPP 3A consent) raises
 * the allowance; a paid login removes it. See lib/gating/server.ts.
 *
 * Modelling note: the brief frames the anonymous cap as "per session" and the
 * email cap as "per day". We implement both as a per-UTC-day window keyed on a
 * long-lived cookie + IP hash — simpler, harder to game, and still surfaces the
 * limit clearly. Paid tiers are never counted.
 */

export type SurfaceKind = 'hapai' | 'chat' | 'agent' | 'workflow';
export type GateTier = 'anon' | 'email' | 'paid';

type Caps = { anon: number; email: number };

export const SURFACE_LIMITS: Record<SurfaceKind, Caps> = {
  hapai: { anon: 1, email: 5 }, // 1 run per tool, 5 runs/day once captured
  chat: { anon: 10, email: 30 }, // /c/[kete] messages
  agent: { anon: 5, email: 20 }, // /c/[kete]?agent=X per-agent messages
  workflow: { anon: 1, email: 3 }, // workflow runs
};

/** The cap for a tier on a surface. Paid is unlimited. */
export function limitFor(kind: SurfaceKind, tier: GateTier): number {
  if (tier === 'paid') return Number.POSITIVE_INFINITY;
  return SURFACE_LIMITS[kind][tier];
}

export const GATE_COOKIE_ID = 'assembl_gid'; // long-lived anonymous identity
export const GATE_COOKIE_CAPTURED = 'assembl_captured'; // '1' once email captured
export const GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** IPP 3A consent line shown at the point of capture. */
export const IPP3A_CONSENT_LINE =
  'I agree assembl can email me about these tools. We collect your email to lift your usage limit and send occasional updates; you can opt out any time. See our Privacy Statement.';
