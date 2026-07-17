/**
 * Deterministic PRNG for the Living Interface particle scene.
 *
 * Every random draw in the scene comes from a seeded mulberry32 stream so
 * refreshes feel related (the sculpture always assembles the same way) and
 * screenshots reproduce pixel-for-pixel. Never use Math.random in scene code.
 */

export type Rng = () => number;

/** mulberry32 — small, fast, good distribution for visual work. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Named seeds so each buffer draws from its own stable stream. */
export const SCENE_SEEDS = {
  scatter: 20260701,
  wing: 20260713,
  network: 20260721,
  agents: 20260722,
  particle: 20260718,
} as const;
