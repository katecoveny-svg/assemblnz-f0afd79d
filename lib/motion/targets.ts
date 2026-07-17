import { FORM_EXTENTS, ROLE_RATIOS } from '@/lib/motion/scene-config';
import { SCENE_SEEDS, mulberry32, type Rng } from '@/lib/motion/seeded-rng';
import type { TargetForm } from '@/lib/motion/visual-state';

/**
 * Target forms for the Living Interface — every form is a DESIGNED
 * composition built from explicit curves and anchors, never a sphere,
 * Gaussian cloud or central attractor.
 *
 * Sampling happens ONCE per (form, count, scale): results are memoised in a
 * module-level cache of typed arrays, so morphs and re-renders reuse the
 * same Float32Array and nothing is resampled per frame. All randomness is
 * seeded (see seeded-rng.ts) so refreshes and screenshots reproduce.
 *
 * Particle roles are fixed by index across all forms:
 *   [0, S)     structural — crisp anchors on the spines
 *   [S, S+P)   supporting — restrained variation around the curves
 *   [S+P, n)   atmospheric — loose, wide, never centre-clustered
 */

export type Roles = { structural: number; supporting: number; atmospheric: number };

export function rolesFor(count: number): Roles {
  const structural = Math.floor(count * ROLE_RATIOS.structural);
  const supporting = Math.floor(count * ROLE_RATIOS.supporting);
  return { structural, supporting, atmospheric: count - structural - supporting };
}

type Vec3 = [number, number, number];

/* ── tiny uniform Catmull-Rom sampler (keeps three out of this module) ──── */

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * p1 - 2 * p2 + v0 + v1) * t3 +
    (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
    v0 * t +
    p1
  );
}

/** Sample a Catmull-Rom curve through pts at t ∈ [0, 1] (clamped ends). */
function sampleCurve(pts: Vec3[], t: number): Vec3 {
  const n = pts.length - 1;
  const s = Math.min(0.9999, Math.max(0, t)) * n;
  const seg = Math.floor(s);
  const local = s - seg;
  const a = pts[Math.max(0, seg - 1)];
  const b = pts[seg];
  const c = pts[Math.min(n, seg + 1)];
  const d = pts[Math.min(n, seg + 2)];
  return [
    catmullRom(a[0], b[0], c[0], d[0], local),
    catmullRom(a[1], b[1], c[1], d[1], local),
    catmullRom(a[2], b[2], c[2], d[2], local),
  ];
}

/* ── shared atmospheric halo: wide, sparse, with an exclusion core so it can
      never fog the centre of the sculpture into a blob ─────────────────── */

function fillAtmosphere(
  out: Float32Array,
  from: number,
  to: number,
  scale: number,
  rand: Rng,
) {
  const rx = FORM_EXTENTS.atmosphere * scale * 0.72;
  const ry = FORM_EXTENTS.height * scale * 0.78;
  const core = FORM_EXTENTS.width * scale * 0.17;
  for (let i = from; i < to; i++) {
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 8; tries++) {
      x = (rand() * 2 - 1) * rx;
      y = (rand() * 2 - 1) * ry;
      if (Math.hypot(x, y) > core) break;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = -3 + rand() * 5;
  }
}

/* ── wing — the kōtuku sweep: tapering feather curves from a shared
      shoulder, raked forward like a wing in glide ───────────────────────── */

function buildWing(out: Float32Array, count: number, scale: number) {
  const rand = mulberry32(SCENE_SEEDS.wing);
  const roles = rolesFor(count);
  const W = FORM_EXTENTS.width * scale;
  const H = FORM_EXTENTS.height * scale;
  const depth = FORM_EXTENTS.depth * scale;
  const FEATHERS = 13;

  const shoulder: Vec3 = [-W * 0.42, -H * 0.3, 0];
  const feathers: Vec3[][] = [];
  const lengths: number[] = [];

  for (let f = 0; f < FEATHERS; f++) {
    const t = f / (FEATHERS - 1);
    // fan: low secondaries near the body → long raked primaries at the tip
    const angle = -0.3 + Math.pow(t, 0.9) * 1.3;
    const len = W * (0.32 + 0.64 * Math.pow(Math.sin(0.3 + t * 1.3), 1.5));
    const droop = 0.24 + 0.5 * t;
    const dir = [Math.cos(angle), Math.sin(angle)];
    const perp = [-dir[1], dir[0]];
    // roots march along the leading edge — never a single-point clump
    const root = W * (0.05 + 0.17 * t);
    const origin: Vec3 = [shoulder[0] + dir[0] * root, shoulder[1] + dir[1] * root, 0];
    const pts: Vec3[] = [];
    for (let k = 0; k <= 4; k++) {
      const s = k / 4;
      const along = len * s;
      // droop through the middle, lift at the tip — a wing in glide
      const bend = Math.sin(s * Math.PI * 0.92) * -droop + Math.pow(s, 2.4) * droop * 0.85;
      pts.push([
        origin[0] + dir[0] * along + perp[0] * bend,
        origin[1] + dir[1] * along + perp[1] * bend,
        (t - 0.5) * depth * 0.75,
      ]);
    }
    feathers.push(pts);
    lengths.push(len);
  }
  const totalLen = lengths.reduce((a, b) => a + b, 0);

  // structural: sparse crisp beads along every spine
  let i = 0;
  for (let f = 0; f < FEATHERS && i < roles.structural; f++) {
    const n = Math.max(6, Math.round((roles.structural * lengths[f]) / totalLen));
    for (let k = 0; k < n && i < roles.structural; k++, i++) {
      const p = sampleCurve(feathers[f], k / (n - 1));
      out[i * 3] = p[0];
      out[i * 3 + 1] = p[1];
      out[i * 3 + 2] = p[2] + (rand() - 0.5) * 0.08;
    }
  }
  for (; i < roles.structural; i++) {
    const p = sampleCurve(feathers[FEATHERS - 1], rand());
    out[i * 3] = p[0];
    out[i * 3 + 1] = p[1];
    out[i * 3 + 2] = p[2];
  }

  // supporting: hug the spines so each curve stays one readable dotted line
  // and the gaps between feathers stay white
  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const f = Math.floor(rand() * FEATHERS);
    const s = rand();
    if (rand() < 0.55 * s) continue; // taper toward the tip
    if (s < 0.3 && rand() < 0.85) continue; // thin the crowded root
    const p = sampleCurve(feathers[f], s);
    const spread = 0.006 * W * (1 - s * 0.4);
    out[i * 3] = p[0] + (rand() - 0.5) * spread;
    out[i * 3 + 1] = p[1] + (rand() - 0.5) * spread;
    out[i * 3 + 2] = p[2] + (rand() - 0.5) * 0.35;
    i++;
  }

  fillAtmosphere(out, supportEnd, count, scale, rand);
}

/* ── network — the ordered genome node field: nine node clusters on a calm
      offset lattice, thin connective runs between neighbours ─────────────── */

const NETWORK_NODES: Array<[number, number]> = [
  [-0.38, 0.3], [0.0, 0.36], [0.38, 0.28],
  [-0.42, -0.02], [-0.03, 0.02], [0.4, -0.04],
  [-0.34, -0.34], [0.02, -0.38], [0.36, -0.3],
];

/** Neighbour pairs (indices into NETWORK_NODES) — a lattice, not a web. */
const NETWORK_LINKS: Array<[number, number]> = [
  [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],
  [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8],
];

function buildNetwork(out: Float32Array, count: number, scale: number) {
  const rand = mulberry32(SCENE_SEEDS.network);
  const roles = rolesFor(count);
  const W = FORM_EXTENTS.width * scale * 0.92;
  const H = FORM_EXTENTS.height * scale * 1.1;
  const depth = FORM_EXTENTS.depth * scale;

  const node = (n: number): Vec3 => [
    NETWORK_NODES[n][0] * W,
    NETWORK_NODES[n][1] * H,
    Math.sin(n * 2.1) * depth * 0.2,
  ];

  // structural: tight rings around each node core — ordered, calm
  let i = 0;
  const perNode = Math.floor(roles.structural / NETWORK_NODES.length);
  for (let n = 0; n < NETWORK_NODES.length; n++) {
    const [cx, cy, cz] = node(n);
    for (let k = 0; k < perNode && i < roles.structural; k++, i++) {
      const ring = k % 3;
      const r = (0.014 + ring * 0.012) * W;
      const a = (k / perNode) * Math.PI * 2 * (ring + 1) + n;
      out[i * 3] = cx + Math.cos(a) * r;
      out[i * 3 + 1] = cy + Math.sin(a) * r;
      out[i * 3 + 2] = cz + (rand() - 0.5) * 0.1;
    }
  }
  for (; i < roles.structural; i++) {
    const [cx, cy, cz] = node(4);
    out[i * 3] = cx + (rand() - 0.5) * 0.05 * W;
    out[i * 3 + 1] = cy + (rand() - 0.5) * 0.05 * W;
    out[i * 3 + 2] = cz;
  }

  // supporting: dotted runs along the lattice links, thinned mid-span
  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const [a, b] = NETWORK_LINKS[Math.floor(rand() * NETWORK_LINKS.length)];
    const s = rand();
    if (s > 0.2 && s < 0.8 && rand() < 0.45) continue; // sparse mid-span
    const pa = node(a);
    const pb = node(b);
    out[i * 3] = pa[0] + (pb[0] - pa[0]) * s + (rand() - 0.5) * 0.02 * W;
    out[i * 3 + 1] = pa[1] + (pb[1] - pa[1]) * s + (rand() - 0.5) * 0.02 * W;
    out[i * 3 + 2] = pa[2] + (pb[2] - pa[2]) * s + (rand() - 0.5) * 0.2;
    i++;
  }

  fillAtmosphere(out, supportEnd, count, scale, rand);
}

/* ── agents — particles flow toward a row of anchor points near where the
      homepage's content sits: five anchors, converging approach streams ──── */

const AGENT_ANCHORS = 5;

function buildAgents(out: Float32Array, count: number, scale: number) {
  const rand = mulberry32(SCENE_SEEDS.agents);
  const roles = rolesFor(count);
  const W = FORM_EXTENTS.width * scale;
  const H = FORM_EXTENTS.height * scale;
  const baseY = -H * 0.44;

  const anchorX = (n: number) => (n / (AGENT_ANCHORS - 1) - 0.5) * W * 0.84;

  // approach streams: one gentle curve per anchor from the upper field down
  const streams: Vec3[][] = [];
  for (let n = 0; n < AGENT_ANCHORS; n++) {
    const ax = anchorX(n);
    const lean = (n / (AGENT_ANCHORS - 1) - 0.5) * W * 0.36;
    streams.push([
      [ax + lean * 1.4, H * 0.52, (rand() - 0.5) * 0.8],
      [ax + lean * 0.5, H * 0.1, (rand() - 0.5) * 0.5],
      [ax + lean * 0.12, baseY + H * 0.28, 0],
      [ax, baseY + 0.05 * H, 0],
    ]);
  }

  // structural: tight anchor dots + a sparse baseline joining them
  let i = 0;
  const perAnchor = Math.floor((roles.structural * 0.7) / AGENT_ANCHORS);
  for (let n = 0; n < AGENT_ANCHORS; n++) {
    for (let k = 0; k < perAnchor && i < roles.structural; k++, i++) {
      const r = Math.sqrt(rand()) * 0.035 * W;
      const a = rand() * Math.PI * 2;
      out[i * 3] = anchorX(n) + Math.cos(a) * r;
      out[i * 3 + 1] = baseY + Math.sin(a) * r * 0.7;
      out[i * 3 + 2] = (rand() - 0.5) * 0.2;
    }
  }
  while (i < roles.structural) {
    const s = rand();
    out[i * 3] = (s - 0.5) * W * 0.84;
    out[i * 3 + 1] = baseY - H * 0.06 + (rand() - 0.5) * 0.02 * H;
    out[i * 3 + 2] = (rand() - 0.5) * 0.15;
    i++;
  }

  // supporting: beads along each approach stream, denser near the anchor
  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const n = Math.floor(rand() * AGENT_ANCHORS);
    const s = Math.pow(rand(), 0.62); // bias toward the anchor end
    const p = sampleCurve(streams[n], s);
    const spread = 0.05 * W * (1 - s * 0.85);
    out[i * 3] = p[0] + (rand() - 0.5) * spread;
    out[i * 3 + 1] = p[1] + (rand() - 0.5) * spread;
    out[i * 3 + 2] = p[2] + (rand() - 0.5) * 0.3;
    i++;
  }

  fillAtmosphere(out, supportEnd, count, scale, rand);
}

/* ── scatter — the dormant field the sculpture gathers from: a wide ring
      with depth, biased away from the centre (anticipation, not a blob) ─── */

function buildScatter(out: Float32Array, count: number, scale: number) {
  const rand = mulberry32(SCENE_SEEDS.scatter);
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = (2.5 + rand() * 4.6) * scale;
    out[i * 3] = Math.cos(angle) * radius + (rand() - 0.5) * 1.2;
    out[i * 3 + 1] = Math.sin(angle) * radius * 0.62 + (rand() - 0.5) * 1.0;
    out[i * 3 + 2] = (rand() - 0.5) * 5.0;
  }
}

/* ── cache: sample once, reuse the same typed array forever ─────────────── */

const targetCache = new Map<string, Float32Array>();

export function getTargets(form: TargetForm | 'scatter', count: number, scale = 1): Float32Array {
  const key = `${form}:${count}:${scale}`;
  const hit = targetCache.get(key);
  if (hit) return hit;
  const out = new Float32Array(count * 3);
  if (form === 'wing') buildWing(out, count, scale);
  else if (form === 'network') buildNetwork(out, count, scale);
  else if (form === 'agents') buildAgents(out, count, scale);
  else buildScatter(out, count, scale);
  targetCache.set(key, out);
  return out;
}

/* ── per-particle seeds, styles and courier lanes — role-based, fixed
      across forms so the SAME particles morph between states ──────────────── */

export type ParticleBuffers = {
  /** vec4 per particle: delay, invDuration, phase, drift. */
  seeds: Float32Array;
  /** vec2 per particle: size, alpha. */
  styles: Float32Array;
  /** vec2 per particle: lane index (−1 = not a courier), lane phase. */
  lanes: Float32Array;
};

const bufferCache = new Map<number, ParticleBuffers>();

/** Roughly 1 in 12 particles is a courier — the ones that travel the clear
 *  paths in `thinking` and form the exit stream in `acting`. */
const COURIER_MODULUS = 12;
export const COURIER_LANES = 3;

export function getParticleBuffers(count: number): ParticleBuffers {
  const hit = bufferCache.get(count);
  if (hit) return hit;

  const roles = rolesFor(count);
  const rand = mulberry32(SCENE_SEEDS.particle);
  const seeds = new Float32Array(count * 4);
  const styles = new Float32Array(count * 2);
  const lanes = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const u = rand();
    let delay: number;
    let size: number;
    let alpha: number;
    let drift: number;
    if (i < roles.structural) {
      delay = u * 0.14; // the skeleton arrives first
      size = 2.0 + rand() * 0.55;
      alpha = 0.86 + rand() * 0.14;
      drift = 0.006 + rand() * 0.005;
    } else if (i < roles.structural + roles.supporting) {
      delay = 0.1 + u * 0.26; // curves fill in second
      size = 1.15 + rand() * 0.35;
      alpha = 0.34 + rand() * 0.26;
      drift = 0.008 + rand() * 0.007;
    } else {
      delay = 0.3 + u * 0.18; // atmosphere settles last
      size = 0.9 + rand() * 0.25;
      alpha = 0.12 + rand() * 0.14;
      drift = 0.01 + rand() * 0.009;
    }
    seeds[i * 4] = delay;
    seeds[i * 4 + 1] = 1 / (0.45 + rand() * 0.22);
    seeds[i * 4 + 2] = rand() * Math.PI * 2;
    seeds[i * 4 + 3] = drift;
    styles[i * 2] = size;
    styles[i * 2 + 1] = alpha;

    const courier = i % COURIER_MODULUS === 3;
    lanes[i * 2] = courier ? i % COURIER_LANES : -1;
    lanes[i * 2 + 1] = rand();
  }

  const buffers = { seeds, styles, lanes };
  bufferCache.set(count, buffers);
  return buffers;
}
