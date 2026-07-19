/**
 * Deterministic 3D avatar per agent slug. Every marketplace slug maps to a
 * stable shape + palette + seed so the same agent always renders the same
 * avatar. Curated overrides for the flagship agents (per the LOCKED CANON
 * roster in lib/marketplace/agents.ts); everything else auto-derives from
 * the slug hash so a new agent slots in without a code change.
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
 * Curated overrides for slugs that live in the current marketplace registry.
 * Keep this list aligned with lib/marketplace/agents.ts — new slugs still
 * work without an entry here (the hash-based default is sensible), but the
 * flagship agents deserve a hand-picked look.
 */
const CURATED: Record<string, Partial<AgentAvatarSpec>> = {
  // Category tiles (start-here, family, business, creative, trades, health, build)
  'start-here':    { shape: 'sphere',      palette: 'chrome' },
  family:          { shape: 'sphere',      palette: 'gold' },
  business:        { shape: 'torus',       palette: 'ocean' },
  creative:        { shape: 'wobble',      palette: 'rose' },
  trades:          { shape: 'cube',        palette: 'copper' },
  health:          { shape: 'icosahedron', palette: 'emerald' },
  build:           { shape: 'torus-knot',  palette: 'chrome' },

  // Flagship named agents
  atlas:           { shape: 'torus',       palette: 'ocean' },
  keeper:          { shape: 'sphere',      palette: 'gold' },
  echo:            { shape: 'sphere',      palette: 'chrome' },
  hui:             { shape: 'torus',       palette: 'pearl' },
  toro:            { shape: 'torus',       palette: 'copper' },
  pilot:           { shape: 'torus-knot',  palette: 'chrome' },
  prism:           { shape: 'icosahedron', palette: 'pearl' },
  muse:            { shape: 'wobble',      palette: 'rose' },
  auaha:           { shape: 'wobble',      palette: 'rose' },
  quill:           { shape: 'sphere',      palette: 'pearl' },

  // Health / construction pack
  aroha:           { shape: 'sphere',      palette: 'rose' },
  pai:             { shape: 'icosahedron', palette: 'emerald' },
  arai:            { shape: 'wobble',      palette: 'obsidian' },
  ata:             { shape: 'torus-knot',  palette: 'chrome' },
  rawa:            { shape: 'cube',        palette: 'copper' },
  kaupapa:         { shape: 'torus-knot',  palette: 'ocean' },
  whakaae:         { shape: 'icosahedron', palette: 'gold' },
  kaiako:          { shape: 'cube',        palette: 'pearl' },

  // Kete / verticals
  arataki:         { shape: 'torus',       palette: 'copper' },
  pikau:           { shape: 'sphere',      palette: 'ocean' },
  hoko:            { shape: 'cube',        palette: 'gold' },
  'hoko-cga':      { shape: 'cube',        palette: 'gold' },
  voyage:          { shape: 'sphere',      palette: 'ocean' },
  saffron:         { shape: 'wobble',      palette: 'gold' },
  aura:            { shape: 'sphere',      palette: 'pearl' },
  gateway:         { shape: 'torus',       palette: 'chrome' },
  cellar:          { shape: 'cube',        palette: 'obsidian' },

  // Family / personal
  awhi:            { shape: 'sphere',      palette: 'rose' },
  dawn:            { shape: 'sphere',      palette: 'pearl' },
  'fridge-to-list':{ shape: 'cube',        palette: 'copper' },
  'school-notice': { shape: 'cube',        palette: 'pearl' },
  'panui-parser':  { shape: 'torus-knot',  palette: 'obsidian' },
  'ako-licence':   { shape: 'cube',        palette: 'ocean' },

  // Business ops
  chief:           { shape: 'torus-knot',  palette: 'obsidian' },
  front:           { shape: 'sphere',      palette: 'chrome' },
  sweep:           { shape: 'wobble',      palette: 'chrome' },
  switch:          { shape: 'torus',       palette: 'gold' },
  pipeline:        { shape: 'torus-knot',  palette: 'chrome' },
  treasury:        { shape: 'cube',        palette: 'gold' },
  'invoice-tidy':  { shape: 'cube',        palette: 'copper' },
  'travel-logs':   { shape: 'torus',       palette: 'ocean' },
  'social-manager':{ shape: 'wobble',      palette: 'rose' },
  roster:          { shape: 'cube',        palette: 'pearl' },
  counter:         { shape: 'sphere',      palette: 'obsidian' },

  // Trades / food / maritime
  'food-temp-logs':   { shape: 'cube',        palette: 'emerald' },
  'stock-count':      { shape: 'cube',        palette: 'copper' },
  'compliance-check': { shape: 'icosahedron', palette: 'ocean' },
  'tide-weather':     { shape: 'sphere',      palette: 'ocean' },
  'catch-log':        { shape: 'torus',       palette: 'ocean' },

  // Animal / conservation
  'vet-small-animal':   { shape: 'sphere',      palette: 'rose' },
  'vet-large-animal':   { shape: 'sphere',      palette: 'copper' },
  'vet-equine':         { shape: 'sphere',      palette: 'obsidian' },
  'vet-exotic':         { shape: 'wobble',      palette: 'emerald' },
  'zoo-vet':            { shape: 'wobble',      palette: 'emerald' },
  'wildbase-recovery':  { shape: 'icosahedron', palette: 'emerald' },
  'spca-workflow':      { shape: 'sphere',      palette: 'gold' },
  'rescue-coordination':{ shape: 'sphere',      palette: 'copper' },
  'doggy-daycare':      { shape: 'sphere',      palette: 'gold' },
  'kakapo-recovery':    { shape: 'icosahedron', palette: 'emerald' },
  'kiwi-conservation':  { shape: 'sphere',      palette: 'emerald' },
  'species-recovery':   { shape: 'icosahedron', palette: 'emerald' },

  // Meta — the "assembl" agent itself (homepage + build-an-agent)
  assembl:         { shape: 'sphere',      palette: 'chrome' },
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
  if (CURATED[slug]) return CURATED[slug];
  // Fall back to the first hyphen-segment (e.g. `hoko-cga` → `hoko`).
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
