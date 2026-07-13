import * as THREE from 'three';
import type { FormationName, HeroParticleSettings } from './config';

/**
 * Formation target generators — every formation is a DESIGNED composition
 * built from explicit paths and surfaces, never a sphere, Gaussian cloud or
 * central attractor. Each generator fills the same-length Float32Array so
 * one particle population morphs between states.
 *
 * Particle roles are fixed by index across all formations:
 *   [0, S)          structural — crisp anchors on the spines
 *   [S, S+P)        supporting — restrained variation around the curves
 *   [S+P, count)    atmospheric — loose, wide, never centre-clustered
 */

/** Deterministic PRNG so regenerated formations are stable frame to frame. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Roles = { structural: number; supporting: number; atmospheric: number };

export function rolesFor(cfg: HeroParticleSettings): Roles {
  const structural = Math.floor(cfg.particleCount * cfg.structuralRatio);
  const supporting = Math.floor(cfg.particleCount * cfg.supportingRatio);
  return {
    structural,
    supporting,
    atmospheric: cfg.particleCount - structural - supporting,
  };
}

/** Atmospheric halo shared by all formations: a wide, sparse ellipse with an
 *  exclusion core so it can never fog the centre of the sculpture. */
function fillAtmosphere(
  out: Float32Array,
  from: number,
  to: number,
  cfg: HeroParticleSettings,
  rand: () => number,
) {
  const rx = cfg.atmosphericSpread * 0.72;
  const ry = cfg.formationHeight * 0.78;
  const core = cfg.formationWidth * 0.17;
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
    out[i * 3 + 2] = -3 + rand() * 5; // z −3.0 … 2.0
  }
}

/* ── kōtuku wing — 18–28 tapering feather curves from a shared shoulder ── */
export function createWingTargets(cfg: HeroParticleSettings, count: number, roles: Roles): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(20260713);
  const W = cfg.formationWidth;
  const H = cfg.formationHeight;
  const FEATHERS = 13;

  const shoulder = new THREE.Vector3(-W * 0.42, -H * 0.3, 0);

  // Build each feather as a CatmullRom spine; keep the curves apart so white
  // space stays visible between neighbours.
  const feathers: THREE.CatmullRomCurve3[] = [];
  const lengths: number[] = [];
  for (let f = 0; f < FEATHERS; f++) {
    const t = f / (FEATHERS - 1);
    // fan: low secondaries near the body → long raked primaries at the tip
    const angle = -0.3 + Math.pow(t, 0.9) * 1.3; // radians above +x
    const len = W * (0.32 + 0.64 * Math.pow(Math.sin(0.3 + t * 1.3), 1.5));
    const droop = 0.24 + 0.5 * t;
    const dir = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
    const perp = new THREE.Vector2(-dir.y, dir.x);
    // roots march along the leading edge — never a single-point clump
    const origin = shoulder
      .clone()
      .add(new THREE.Vector3(dir.x * W * (0.05 + 0.17 * t), dir.y * W * (0.05 + 0.17 * t), 0));
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 4; k++) {
      const s = k / 4;
      const along = len * s;
      // droop down through the middle, lift at the tip — a wing in glide
      const bend = Math.sin(s * Math.PI * 0.92) * -droop + Math.pow(s, 2.4) * droop * 0.85;
      pts.push(
        new THREE.Vector3(
          origin.x + dir.x * along + perp.x * bend,
          origin.y + dir.y * along + perp.y * bend,
          (t - 0.5) * cfg.depthSpread * 0.75,
        ),
      );
    }
    feathers.push(new THREE.CatmullRomCurve3(pts));
    lengths.push(len);
  }
  const totalLen = lengths.reduce((a, b) => a + b, 0);

  // structural: sparse crisp beads along every spine
  let i = 0;
  for (let f = 0; f < FEATHERS && i < roles.structural; f++) {
    const n = Math.max(6, Math.round((roles.structural * lengths[f]) / totalLen));
    for (let k = 0; k < n && i < roles.structural; k++, i++) {
      const s = k / (n - 1);
      const p = feathers[f].getPoint(s);
      out[i * 3] = p.x;
      out[i * 3 + 1] = p.y;
      out[i * 3 + 2] = p.z + (rand() - 0.5) * 0.08;
    }
  }
  // any structural remainder joins the leading edge
  for (; i < roles.structural; i++) {
    const p = feathers[FEATHERS - 1].getPoint(rand());
    out[i * 3] = p.x;
    out[i * 3 + 1] = p.y;
    out[i * 3 + 2] = p.z;
  }

  // supporting: hug the spines tightly — each curve must stay one readable
  // dotted line, so the gaps between feathers stay white
  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const f = Math.floor(rand() * FEATHERS);
    const s = rand();
    // gentle taper toward the tip + hard thinning near the crowded root
    if (rand() < 0.55 * s) continue;
    if (s < 0.3 && rand() < 0.85) continue;
    const p = feathers[f].getPoint(s);
    const spread = 0.006 * W * (1 - s * 0.4);
    out[i * 3] = p.x + (rand() - 0.5) * spread;
    out[i * 3 + 1] = p.y + (rand() - 0.5) * spread;
    out[i * 3 + 2] = p.z + (rand() - 0.5) * 0.35;
    i++;
  }

  fillAtmosphere(out, supportEnd, count, cfg, rand);
  return out;
}

/* ── school — a flowing S-band of small fish streaks ────────────────────── */
export function createSchoolTargets(cfg: HeroParticleSettings, count: number, roles: Roles): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(20260714);
  const W = cfg.formationWidth;
  const H = cfg.formationHeight;
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-W * 0.46, -H * 0.22, 0),
    new THREE.Vector3(-W * 0.18, H * 0.16, 0.4),
    new THREE.Vector3(W * 0.12, -H * 0.1, -0.4),
    new THREE.Vector3(W * 0.44, H * 0.26, 0.2),
  ]);
  const FISH = 62;
  const fish: Array<{ p: THREE.Vector3; d: THREE.Vector3 }> = [];
  for (let f = 0; f < FISH; f++) {
    const s = 0.04 + 0.92 * (f / (FISH - 1));
    const centre = path.getPoint(s);
    const tangent = path.getTangent(s);
    const off = new THREE.Vector3((rand() - 0.5) * 0.5, (rand() - 0.5) * H * 0.34, (rand() - 0.5) * cfg.depthSpread);
    fish.push({ p: centre.clone().add(off), d: tangent });
  }
  const bodyLen = W * 0.055;

  let i = 0;
  // structural: head + tail of every fish
  for (let f = 0; f < FISH && i + 1 < roles.structural; f++) {
    const { p, d } = fish[f];
    out[i * 3] = p.x;
    out[i * 3 + 1] = p.y;
    out[i * 3 + 2] = p.z;
    i++;
    out[i * 3] = p.x - d.x * bodyLen;
    out[i * 3 + 1] = p.y - d.y * bodyLen;
    out[i * 3 + 2] = p.z;
    i++;
  }
  for (; i < roles.structural; i++) {
    const p = path.getPoint(rand());
    out[i * 3] = p.x;
    out[i * 3 + 1] = p.y + (rand() - 0.5) * 0.3;
    out[i * 3 + 2] = p.z;
  }
  // supporting: short streaks along each body
  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const { p, d } = fish[Math.floor(rand() * FISH)];
    const s = rand();
    out[i * 3] = p.x - d.x * bodyLen * s + (rand() - 0.5) * 0.03;
    out[i * 3 + 1] = p.y - d.y * bodyLen * s + (rand() - 0.5) * 0.03;
    out[i * 3 + 2] = p.z + (rand() - 0.5) * 0.15;
    i++;
  }
  fillAtmosphere(out, supportEnd, count, cfg, rand);
  return out;
}

/* ── Matariki — the nine stars, each a tight core with a thin halo ──────── */
const MATARIKI_STARS: Array<[number, number]> = [
  [0.02, 0.42], [-0.3, 0.28], [0.3, 0.32], [-0.13, 0.12], [0.16, 0.1],
  [-0.38, -0.06], [0.02, -0.12], [0.36, -0.05], [-0.16, -0.34],
];

export function createMatarikiTargets(cfg: HeroParticleSettings, count: number, roles: Roles): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(20260715);
  const W = cfg.formationWidth;
  const H = cfg.formationHeight;

  let i = 0;
  for (let star = 0; star < 9; star++) {
    const [sx, sy] = MATARIKI_STARS[star];
    const cx = sx * W;
    const cy = sy * H * 1.35;
    const n = Math.floor(roles.structural / 9);
    for (let k = 0; k < n && i < roles.structural; k++, i++) {
      const r = rand() * 0.05 * W * 0.2;
      const a = rand() * Math.PI * 2;
      out[i * 3] = cx + Math.cos(a) * r;
      out[i * 3 + 1] = cy + Math.sin(a) * r;
      out[i * 3 + 2] = (rand() - 0.5) * 0.5;
    }
  }
  for (; i < roles.structural; i++) out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = 0;

  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const star = Math.floor(rand() * 9);
    const [sx, sy] = MATARIKI_STARS[star];
    // halo thins with radius — 1/r falloff, capped
    const r = (0.03 + Math.pow(rand(), 2.2) * 0.16) * W * 0.6;
    const a = rand() * Math.PI * 2;
    out[i * 3] = sx * W + Math.cos(a) * r;
    out[i * 3 + 1] = sy * H * 1.35 + Math.sin(a) * r * 0.85;
    out[i * 3 + 2] = (rand() - 0.5) * cfg.depthSpread * 0.7;
    i++;
  }
  fillAtmosphere(out, supportEnd, count, cfg, rand);
  return out;
}

/* ── braided rivers — channels that weave apart and back together ───────── */
export function createRiverTargets(cfg: HeroParticleSettings, count: number, roles: Roles): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(20260716);
  const W = cfg.formationWidth;
  const H = cfg.formationHeight;
  const CHANNELS = 6;

  const channelY = (c: number, x01: number) => {
    const base = (x01 - 0.5) * H * 0.5; // gentle diagonal
    const braid =
      Math.sin(x01 * Math.PI * (1.6 + c * 0.23) + c * 1.7) * H * 0.16 +
      Math.sin(x01 * Math.PI * 3.1 + c * 0.9) * H * 0.05;
    return base + braid;
  };

  let i = 0;
  for (let c = 0; c < CHANNELS && i < roles.structural; c++) {
    const n = Math.floor(roles.structural / CHANNELS);
    for (let k = 0; k < n && i < roles.structural; k++, i++) {
      const x01 = k / (n - 1);
      out[i * 3] = (x01 - 0.5) * W;
      out[i * 3 + 1] = channelY(c, x01);
      out[i * 3 + 2] = (c / (CHANNELS - 1) - 0.5) * cfg.depthSpread * 0.6;
    }
  }
  for (; i < roles.structural; i++) out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = 0;

  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    const c = Math.floor(rand() * CHANNELS);
    const x01 = rand();
    // thin the banks near both ends
    if ((x01 < 0.08 || x01 > 0.92) && rand() < 0.6) continue;
    out[i * 3] = (x01 - 0.5) * W + (rand() - 0.5) * 0.05;
    out[i * 3 + 1] = channelY(c, x01) + (rand() - 0.5) * H * 0.035;
    out[i * 3 + 2] = (c / (CHANNELS - 1) - 0.5) * cfg.depthSpread * 0.6 + (rand() - 0.5) * 0.3;
    i++;
  }
  fillAtmosphere(out, supportEnd, count, cfg, rand);
  return out;
}

/* ── genome — a calm double helix with sparse rungs ─────────────────────── */
export function createGenomeTargets(cfg: HeroParticleSettings, count: number, roles: Roles): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(20260717);
  const W = cfg.formationWidth;
  const H = cfg.formationHeight;
  const A = H * 0.34;
  const k = (Math.PI * 3.1) / W;

  const strand = (x: number, phase: number): [number, number] => [
    A * Math.sin(k * x + phase),
    A * Math.cos(k * x + phase) * (cfg.depthSpread / (H * 0.9)),
  ];

  let i = 0;
  const perStrand = Math.floor(roles.structural / 2);
  for (let sIdx = 0; sIdx < 2; sIdx++) {
    for (let kk = 0; kk < perStrand && i < roles.structural; kk++, i++) {
      const x = (kk / (perStrand - 1) - 0.5) * W * 0.92;
      const [y, z] = strand(x, sIdx * Math.PI);
      out[i * 3] = x;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = z;
    }
  }
  for (; i < roles.structural; i++) out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = 0;

  const supportEnd = roles.structural + roles.supporting;
  while (i < supportEnd) {
    if (rand() < 0.3) {
      // a rung — only some cross-links exist, sampled sparsely
      const x = (Math.floor(rand() * 12) / 11 - 0.5) * W * 0.86;
      const [y1, z1] = strand(x, 0);
      const [y2, z2] = strand(x, Math.PI);
      const s = rand();
      out[i * 3] = x;
      out[i * 3 + 1] = y1 + (y2 - y1) * s;
      out[i * 3 + 2] = z1 + (z2 - z1) * s;
    } else {
      const x = (rand() - 0.5) * W * 0.92;
      const [y, z] = strand(x, rand() < 0.5 ? 0 : Math.PI);
      out[i * 3] = x + (rand() - 0.5) * 0.04;
      out[i * 3 + 1] = y + (rand() - 0.5) * 0.05;
      out[i * 3 + 2] = z + (rand() - 0.5) * 0.05;
    }
    i++;
  }
  fillAtmosphere(out, supportEnd, count, cfg, rand);
  return out;
}

export function createTargets(
  name: FormationName,
  cfg: HeroParticleSettings,
): Float32Array {
  const roles = rolesFor(cfg);
  const count = cfg.particleCount;
  switch (name) {
    case 'wing':
      return createWingTargets(cfg, count, roles);
    case 'school':
      return createSchoolTargets(cfg, count, roles);
    case 'matariki':
      return createMatarikiTargets(cfg, count, roles);
    case 'rivers':
      return createRiverTargets(cfg, count, roles);
    case 'genome':
      return createGenomeTargets(cfg, count, roles);
  }
}

/** Per-particle animation seeds + visual style — role-based, fixed across
 *  formations so one population morphs cleanly between states. */
export function createSeedsAndStyles(cfg: HeroParticleSettings) {
  const roles = rolesFor(cfg);
  const count = cfg.particleCount;
  const rand = mulberry32(20260718);
  const seeds = new Float32Array(count * 4); // delay, invDuration, phase, drift
  const styles = new Float32Array(count * 2); // size, alpha

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
    seeds[i * 4 + 1] = 1 / (0.45 + rand() * 0.22); // duration 0.45–0.67
    seeds[i * 4 + 2] = rand() * Math.PI * 2;
    seeds[i * 4 + 3] = drift;
    styles[i * 2] = size;
    styles[i * 2 + 1] = alpha;
  }
  return { seeds, styles };
}
