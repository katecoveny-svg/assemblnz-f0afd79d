/**
 * Species packs for Generative assembly.
 *
 * Each species is data: a silhouette (the engine builds it from these
 * numbers), a motion (wingbeat, fin or pulse), flock behaviour, a size range
 * and a palette of canon tones. Adding a species is one entry here.
 *
 * Silhouettes are stylised studies drawn from the species' proportions, not
 * field-guide illustrations. Tones are placed on the plum canon, so a tūī is
 * a dark bird with a pale throat, not its real iridescent blue-green.
 *
 * Part order for tones matches the engine: body, cap or dorsal, inner wing or
 * pectoral, outer wing, tail or fluke, bill or snout.
 */

import { toneOnDark, toneOnLight, toneRgb, type Tone } from './canon';

export type SpeciesId =
  | 'tara' | 'kereru' | 'piwakawaka' | 'tui' | 'kotuku' | 'takapu'
  | 'tamure' | 'kahawai' | 'aihe' | 'starling' | 'corvid' | 'plankton';

export type Motion = 'bird' | 'fish' | 'dolphin' | 'mote';

export interface SpeciesShape {
  body: 'bird' | 'swimmer' | 'mote';
  /** bird */ span?: number; chord?: number; tail?: 'fork' | 'fan' | 'wedge' | 'round'; neck?: number; bill?: number; sweep?: number;
  /** swimmer */ depth?: number; width?: number; dorsal?: number; pectoral?: number; flukes?: boolean; snout?: number;
  /** all */ length?: number; girth?: number; size?: number;
}

export interface Species {
  id: SpeciesId;
  /** Name shown in the studio. Te reo Māori names carry their macrons. */
  name: string;
  /** Plain-English gloss shown beside the name. */
  gloss: string;
  group: 'birds' | 'sea' | 'flocks';
  shape: SpeciesShape;
  motion: Motion;
  /** Wingbeat, tail-beat or pulse rate in radians per second of engine time. */
  beat: number;
  /** Stroke amplitude, 1 is the homepage tern. */
  amp: number;
  /** Default flock size and how fast the resting cloud mills. */
  flock: { count: number; spin: number };
  /** Relative size range for the studio's size slider. */
  size: { min: number; max: number; default: number };
  /** Tones on the plum canon for a plum ground: [upper, under] per part. */
  tones: { upper: Tone[]; under: Tone[] };
  /** Which ground the species reads best on by default. */
  ground: 'plum' | 'paper' | 'chalk';
}

const T = (t: number, rose = 0): Tone => ({ t, rose });
const same = (tones: Tone[]) => ({ upper: tones, under: tones });

export const SPECIES: Species[] = [
  {
    id: 'tara', name: 'tara', gloss: 'white-fronted tern, the homepage flock', group: 'birds',
    shape: { body: 'bird', chord: 1.25, tail: 'fork' }, motion: 'bird', beat: 12, amp: 1,
    flock: { count: 900, spin: 0.2 }, size: { min: 0.5, max: 1.8, default: 0.9 },
    tones: { upper: [T(0.94), T(0.04), T(0.8), T(0.62), T(0.93), T(0.06)], under: [T(0.97), T(0.04), T(0.96), T(0.85), T(0.96), T(0.06)] },
    ground: 'plum',
  },
  {
    id: 'kereru', name: 'kererū', gloss: 'NZ wood pigeon, heavy and slow-winged', group: 'birds',
    shape: { body: 'bird', span: 0.9, chord: 1.5, tail: 'fan', girth: 1.4, length: 1.1, bill: 0.6 }, motion: 'bird', beat: 7, amp: 0.85,
    flock: { count: 240, spin: 0.12 }, size: { min: 0.8, max: 2.2, default: 1.5 },
    tones: { upper: [T(0.34, 0.35), T(0.28, 0.2), T(0.3, 0.3), T(0.22, 0.2), T(0.26, 0.2), T(0.55, 0.8)], under: [T(0.97), T(0.3, 0.2), T(0.5, 0.3), T(0.4, 0.2), T(0.45, 0.2), T(0.55, 0.8)] },
    ground: 'chalk',
  },
  {
    id: 'piwakawaka', name: 'pīwakawaka', gloss: 'fantail, small and quick to turn', group: 'birds',
    shape: { body: 'bird', span: 0.72, chord: 1.35, tail: 'fan', length: 0.85, bill: 0.4 }, motion: 'bird', beat: 17, amp: 1.1,
    flock: { count: 420, spin: 0.45 }, size: { min: 0.5, max: 1.4, default: 0.9 },
    tones: { upper: [T(0.3, 0.45), T(0.12), T(0.28, 0.3), T(0.2, 0.2), T(0.18, 0.2), T(0.1)], under: [T(0.7, 0.6), T(0.12), T(0.6, 0.4), T(0.5, 0.3), T(0.94), T(0.1)] },
    ground: 'paper',
  },
  {
    id: 'tui', name: 'tūī', gloss: 'dark honeyeater with a pale throat tuft', group: 'birds',
    shape: { body: 'bird', span: 0.95, chord: 1.3, tail: 'round', length: 1.05, bill: 0.8 }, motion: 'bird', beat: 11, amp: 1,
    flock: { count: 320, spin: 0.3 }, size: { min: 0.6, max: 1.8, default: 1.1 },
    tones: { upper: [T(0.1, 0.15), T(0.95), T(0.12, 0.2), T(0.08, 0.1), T(0.08, 0.1), T(0.05)], under: [T(0.16, 0.2), T(0.95), T(0.2, 0.25), T(0.12, 0.15), T(0.12, 0.1), T(0.05)] },
    ground: 'chalk',
  },
  {
    id: 'kotuku', name: 'kōtuku', gloss: 'white heron, long neck and slow wingbeat', group: 'birds',
    shape: { body: 'bird', span: 1.4, chord: 1.45, tail: 'round', neck: 1, bill: 2.2, length: 1.15 }, motion: 'bird', beat: 4.5, amp: 0.8,
    flock: { count: 160, spin: 0.08 }, size: { min: 1, max: 2.6, default: 1.8 },
    tones: same([T(0.98), T(0.97), T(0.97), T(0.95), T(0.97), T(0.55, 0.9)]),
    ground: 'plum',
  },
  {
    id: 'takapu', name: 'tākapu', gloss: 'Australasian gannet, dark-tipped wings', group: 'birds',
    shape: { body: 'bird', span: 1.35, chord: 1.2, tail: 'wedge', bill: 1.5, length: 1.1, sweep: 1.2 }, motion: 'bird', beat: 8, amp: 0.75,
    flock: { count: 300, spin: 0.18 }, size: { min: 0.8, max: 2, default: 1.4 },
    tones: { upper: [T(0.96), T(0.8, 0.5), T(0.94), T(0.1), T(0.9), T(0.7, 0.3)], under: [T(0.98), T(0.85, 0.4), T(0.97), T(0.15), T(0.95), T(0.7, 0.3)] },
    ground: 'plum',
  },
  {
    id: 'tamure', name: 'tāmure', gloss: 'snapper, deep-bodied and rose', group: 'sea',
    shape: { body: 'swimmer', length: 1, depth: 1.7, width: 0.8, dorsal: 1.3, pectoral: 1 }, motion: 'fish', beat: 6, amp: 1,
    flock: { count: 360, spin: 0.22 }, size: { min: 0.6, max: 1.8, default: 1.2 },
    tones: { upper: [T(0.5, 0.85), T(0.4, 0.7), T(0.65, 0.6), T(0.6, 0.6), T(0.45, 0.7), T(0.55, 0.8)], under: [T(0.85, 0.5), T(0.45, 0.7), T(0.8, 0.4), T(0.7, 0.4), T(0.6, 0.6), T(0.7, 0.5)] },
    ground: 'plum',
  },
  {
    id: 'kahawai', name: 'kahawai', gloss: 'sea trout, slender, schools fast', group: 'sea',
    shape: { body: 'swimmer', length: 1.25, depth: 0.9, width: 0.8, dorsal: 0.8, pectoral: 0.7 }, motion: 'fish', beat: 9, amp: 0.9,
    flock: { count: 520, spin: 0.35 }, size: { min: 0.5, max: 1.5, default: 1 },
    tones: { upper: [T(0.3), T(0.2), T(0.5), T(0.45), T(0.25), T(0.35)], under: [T(0.92), T(0.25), T(0.85), T(0.8), T(0.5), T(0.6)] },
    ground: 'chalk',
  },
  {
    id: 'aihe', name: 'aihe', gloss: 'common dolphin, a small travelling pod', group: 'sea',
    shape: { body: 'swimmer', length: 1.7, depth: 1, width: 1, dorsal: 1.4, pectoral: 1.2, flukes: true, snout: 1 }, motion: 'dolphin', beat: 3.2, amp: 1.2,
    flock: { count: 90, spin: 0.1 }, size: { min: 1, max: 3, default: 2 },
    tones: { upper: [T(0.22), T(0.15), T(0.3), T(0.28), T(0.2), T(0.25)], under: [T(0.9), T(0.2), T(0.75), T(0.7), T(0.5), T(0.8)] },
    ground: 'plum',
  },
  {
    id: 'starling', name: 'starling', gloss: 'murmuration, dense and fast', group: 'flocks',
    shape: { body: 'bird', span: 0.8, chord: 1.4, tail: 'round', length: 0.85, bill: 0.7 }, motion: 'bird', beat: 15, amp: 1,
    flock: { count: 1200, spin: 0.38 }, size: { min: 0.4, max: 1.2, default: 0.75 },
    tones: same([T(0.08), T(0.06), T(0.1), T(0.07), T(0.07), T(0.55, 0.5)]),
    ground: 'chalk',
  },
  {
    id: 'corvid', name: 'corvid', gloss: 'rook and crow, broad fingered wings', group: 'flocks',
    shape: { body: 'bird', span: 1.1, chord: 1.6, tail: 'round', bill: 1.2, girth: 1.2 }, motion: 'bird', beat: 9, amp: 0.9,
    flock: { count: 260, spin: 0.16 }, size: { min: 0.8, max: 2, default: 1.3 },
    tones: same([T(0.05), T(0.04), T(0.07), T(0.05), T(0.05), T(0.1)]),
    ground: 'paper',
  },
  {
    id: 'plankton', name: 'plankton', gloss: 'motes that drift and pulse', group: 'flocks',
    shape: { body: 'mote', size: 0.7 }, motion: 'mote', beat: 5, amp: 1,
    flock: { count: 1400, spin: 0.25 }, size: { min: 0.3, max: 1.2, default: 0.6 },
    tones: { upper: [T(0.95), T(0.8, 0.6), T(0.9, 0.3), T(0.85), T(0.7, 0.7), T(0.9)], under: [T(0.95), T(0.8, 0.6), T(0.9, 0.3), T(0.85), T(0.7, 0.7), T(0.9)] },
    ground: 'plum',
  },
];

export function speciesById(id: string | null | undefined): Species {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0];
}

/** A light species is one whose body reads pale on plum (tern, kōtuku); a dark one reads on paper (corvid, starling). */
export function isLightSpecies(sp: Species): boolean {
  return sp.tones.upper[0].t > 0.5;
}

/**
 * Engine options for a species on a given ground. A light species on a light
 * ground, or a dark species on plum, is flipped along the canon ramp so the
 * flock stays legible; otherwise its tones are used as written.
 */
export function engineSpecies(sp: Species, lightGround: boolean) {
  const lightSp = isLightSpecies(sp);
  const flip = (t: Tone): Tone => (lightGround && lightSp ? toneOnLight(t) : !lightGround && !lightSp ? toneOnDark(t) : t);
  const map = (tones: Tone[]) => tones.map((t) => toneRgb(flip(t)));
  return {
    ...sp.shape,
    motion: sp.motion,
    beat: sp.beat,
    amp: sp.amp,
    upper: map(sp.tones.upper),
    under: map(sp.tones.under),
  };
}
