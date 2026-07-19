/**
 * Deterministic 3D avatar per agent slug. Every agent maps to a stable
 * shape + palette + seed so the same agent always renders the same
 * avatar (Franklin the dachshund is always the emerald icosahedron; Kate
 * always sees Kaiako as the pearl cube; etc.).
 *
 * Consumers pass their own slug — no shared registry the code base has
 * to keep in sync.
 */

import { CHROME_PALETTES, CHROME_SHAPES, type ChromePalette, type ChromeShape } from '@/lib/generative-art/families/chrome';

export interface AgentAvatarSpec {
  shape: ChromeShape;
  palette: ChromePalette;
  seed: number;
  ior: number;
  roughness: number;
  dispersion: number;
  wobble: number;
  spin: number;
}

/**
 * Curated overrides for agents whose brand identity is fixed. Keep this
 * small — the general path just hashes the slug so a new agent gets a
 * sensible default without needing an entry here.
 */
const CURATED: Record<string, Partial<AgentAvatarSpec>> = {
  keeper:     { shape: 'sphere',      palette: 'gold' },
  kaiako:     { shape: 'cube',        palette: 'pearl' },
  pai:        { shape: 'icosahedron', palette: 'emerald' },
  arai:       { shape: 'wobble',      palette: 'obsidian' },
  ata:        { shape: 'torus-knot',  palette: 'chrome' },
  atlas:      { shape: 'torus',       palette: 'ocean' },
  aroha:      { shape: 'sphere',      palette: 'rose' },
  rawa:       { shape: 'cube',        palette: 'copper' },
  kaupapa:    { shape: 'torus-knot',  palette: 'ocean' },
  whakaee:    { shape: 'icosahedron', palette: 'gold' },
  dash:       { shape: 'torus',       palette: 'gold' },
  auaha:      { shape: 'wobble',      palette: 'rose' },
  echo:       { shape: 'sphere',      palette: 'chrome' },
  hui:        { shape: 'torus',       palette: 'pearl' },
  aria:       { shape: 'sphere',      palette: 'pearl' },
  pack:       { shape: 'wobble',      palette: 'gold' },
  franklin:   { shape: 'icosahedron', palette: 'emerald' },
  aironaut:   { shape: 'torus-knot',  palette: 'gold' },
  mana:       { shape: 'cube',        palette: 'obsidian' },
  toro:       { shape: 'torus',       palette: 'copper' },
};

function hashString(s: string): number {
  // FNV-1a 32-bit. Stable across runtimes; suitable for deriving small
  // integer picks from a slug.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickCurated(slug: string): Partial<AgentAvatarSpec> | undefined {
  // Match by exact key first, then by prefix (e.g. `pai-quality` → `pai`).
  if (CURATED[slug]) return CURATED[slug];
  const first = slug.split('-')[0];
  if (first && CURATED[first]) return CURATED[first];
  return undefined;
}

export function avatarSpecFor(slug: string): AgentAvatarSpec {
  const norm = slug.trim().toLowerCase();
  const hash = hashString(norm);
  const shape = CHROME_SHAPES[hash % CHROME_SHAPES.length].id;
  const palette = CHROME_PALETTES[(hash >>> 5) % CHROME_PALETTES.length].id;
  const seed = hash & 0xffff;

  const spec: AgentAvatarSpec = {
    shape,
    palette,
    seed,
    ior: 1.5,
    roughness: 0.06,
    dispersion: 0.05,
    wobble: 0,
    spin: 0.45,
  };
  const override = pickCurated(norm);
  if (override) Object.assign(spec, override);
  return spec;
}

/** Index a spec back into slider values the ChromeCanvas expects. */
export function specToValues(spec: AgentAvatarSpec): Record<string, number> {
  const shapeIdx = CHROME_SHAPES.findIndex((s) => s.id === spec.shape);
  const paletteIdx = CHROME_PALETTES.findIndex((p) => p.id === spec.palette);
  return {
    shape: Math.max(0, shapeIdx),
    palette: Math.max(0, paletteIdx),
    ior: spec.ior,
    roughness: spec.roughness,
    dispersion: spec.dispersion,
    wobble: spec.wobble,
    spin: spec.spin,
  };
}
