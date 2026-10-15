import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CANON, hexToRgb, isCanonMix, mixCanon, toneOnDark, toneOnLight, toneRgb } from './canon';
import { SPECIES, engineSpecies, isLightSpecies, speciesById } from './species';
import { ASSEMBLY_FAMILY, FORMATIONS, formationAt } from './families/assembly';
import { BOIDS_PALETTES } from './families/boids';
import { BACKGROUNDS } from './backgrounds';
import { receiptFor } from './receipt';

type Rgb = [number, number, number];

/** On the canon: a two-token mix, or a point in the plum, paper and dusty rose triangle (species tones). */
function onCanon(hex: string): boolean {
  if (isCanonMix(hex, 3 / 255)) return true;
  const c = hexToRgb(hex), p = hexToRgb(CANON.plum), w = hexToRgb(CANON.paper), r = hexToRgb(CANON.rose);
  for (let t = 0; t <= 1.0001; t += 0.005) {
    const base = p.map((x, i) => x + (w[i] - x) * t) as Rgb;
    for (let k = 0; k <= 1.0001; k += 0.01) {
      if (base.every((x, i) => Math.abs(x + (r[i] - x) * k - c[i]) <= 3 / 255)) return true;
    }
  }
  return false;
}

describe('plum canon', () => {
  it('mixes stay on the canon and the ramp ends are the tokens', () => {
    expect(isCanonMix(mixCanon('plum', 'paper', 0.37))).toBe(true);
    expect(toneRgb({ t: 0 }).map((v) => Math.round(v * 255))).toEqual(hexToRgb(CANON.plum).map((v) => Math.round(v * 255)));
    expect(toneRgb({ t: 1 }).map((v) => Math.round(v * 255))).toEqual(hexToRgb(CANON.paper).map((v) => Math.round(v * 255)));
    expect(isCanonMix('#1F5A6E')).toBe(false); // old teal
    expect(isCanonMix('#D4AF37')).toBe(false); // gold
  });

  it('flips tones for contrast: light parts darken on a light ground, dark parts lift on plum', () => {
    expect(toneOnLight({ t: 0.95 }).t).toBeLessThan(0.2);
    expect(toneOnDark({ t: 0.05 }).t).toBeGreaterThan(0.5);
  });

  it('every universal background and its inks are canon tokens', () => {
    for (const b of BACKGROUNDS) for (const c of [b.ground, b.ink, b.inkSoft]) expect(Object.values(CANON)).toContain(c);
  });
});

describe('species registry', () => {
  it('holds the twelve species with their te reo names and macrons', () => {
    expect(SPECIES.map((s) => s.name)).toEqual(['tara', 'kererū', 'pīwakawaka', 'tūī', 'kōtuku', 'tākapu', 'tāmure', 'kahawai', 'aihe', 'starling', 'corvid', 'plankton']);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
  });

  it('gives every species six part tones, a motion and a size range that holds its default', () => {
    for (const sp of SPECIES) {
      expect(sp.tones.upper).toHaveLength(6);
      expect(sp.tones.under).toHaveLength(6);
      expect(['bird', 'fish', 'dolphin', 'mote']).toContain(sp.motion);
      expect(sp.size.default).toBeGreaterThanOrEqual(sp.size.min);
      expect(sp.size.default).toBeLessThanOrEqual(sp.size.max);
      for (const t of [...sp.tones.upper, ...sp.tones.under]) {
        expect(t.t).toBeGreaterThanOrEqual(0);
        expect(t.t).toBeLessThanOrEqual(1);
      }
    }
  });

  it('keeps a flock legible on any ground', () => {
    const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    for (const sp of SPECIES) {
      for (const [lightGround, ground] of [[true, CANON.paper], [false, CANON.plum]] as const) {
        const body = engineSpecies(sp, lightGround).upper[0];
        expect(Math.abs(lum(body) - lum(hexToRgb(ground))), `${sp.id} on ${ground}`).toBeGreaterThan(0.25);
      }
    }
    expect(isLightSpecies(speciesById('kotuku'))).toBe(true);
    expect(isLightSpecies(speciesById('corvid'))).toBe(false);
  });

  it('falls back to the homepage tern for an unknown id', () => {
    expect(speciesById('moa').id).toBe('tara');
  });
});

describe('assembly family', () => {
  it('offers one preset per species and every formation the engine knows, plus free text', () => {
    expect(ASSEMBLY_FAMILY.presets.map((p) => p.id)).toEqual(SPECIES.map((s) => s.id));
    expect(FORMATIONS.map((f) => f.id)).toEqual(expect.arrayContaining(['word', 'amark', 'DO', 'text', 'cloud', 'signal', 'pin', 'bubble', 'tick', 'frame', 'sparkle', 'padlock', 'seal']));
    expect(formationAt(99)).toBe('seal');
    expect(formationAt(-3)).toBe('word');
  });

  it('writes a receipt naming family, species, formation and seed', () => {
    const preset = ASSEMBLY_FAMILY.presets.find((p) => p.id === 'kotuku')!;
    expect(receiptFor(ASSEMBLY_FAMILY, preset, { formation: 1 }, 8471, '')).toBe('assembly · kōtuku · a mark · seed 8471');
    const word = FORMATIONS.findIndex((f) => f.id === 'text');
    expect(receiptFor(ASSEMBLY_FAMILY, preset, { formation: word }, 12, 'kia ora')).toBe('assembly · kōtuku · "kia ora" · seed 12');
  });

  it('draws the 2D flocking presets from the species palettes', () => {
    for (const p of Object.values(BOIDS_PALETTES)) for (const c of [p.ground, p.body, p.trail]) expect(onCanon(c), c).toBe(true);
  });
});

describe('studio colours', () => {
  it('every hex colour in the families, renderers and studio libraries is on the plum canon', () => {
    const root = join(__dirname, '..', '..');
    const files = [
      ...readdirSync(join(root, 'lib/generative-art/families')).map((f) => join(root, 'lib/generative-art/families', f)),
      ...readdirSync(join(root, 'components/studios/families')).map((f) => join(root, 'components/studios/families', f)),
      join(root, 'lib/generative-art/presets.ts'),
      join(root, 'lib/generative-art/backgrounds.ts'),
      join(root, 'lib/generative-art/watermark.ts'),
    ];
    const off: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/#[0-9A-Fa-f]{6}\b/g)) if (!onCanon(m[0])) off.push(`${f.split('/').pop()} ${m[0]}`);
    }
    expect(off).toEqual([]);
  });
});
