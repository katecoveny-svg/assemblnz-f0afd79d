/**
 * Deterministic pseudo-random helpers.
 *
 * The particulate field must be identical on server and client (SSR
 * hydration), so nothing in this package ever calls Math.random() at
 * render time — every field is generated from a fixed seed.
 */

/** mulberry32 — tiny, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rough gaussian (sum of three uniforms, centred on 0, ~[-1.5, 1.5]). */
export function gauss(rand: () => number): number {
  return rand() + rand() + rand() - 1.5;
}
