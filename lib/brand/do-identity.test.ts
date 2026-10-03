import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { DO_IDENTITY as colours } from './do-identity';
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}
function contrast(a: string, b: string) {
  const levels = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (levels[0] + .05) / (levels[1] + .05);
}
describe('DO readable controls and tiny identity', () => {
  it.each(['chalk', 'lilac', 'paper'] as const)('body copy passes AA on %s', surface => {
    expect(contrast(colours.ink, colours[surface])).toBeGreaterThanOrEqual(4.5);
  });
  it.each(['plum', 'hover', 'active'] as const)('primary label passes AA in %s state', state => {
    expect(contrast(colours.paper, colours[state])).toBeGreaterThanOrEqual(4.5);
  });
  it('browser favicon keeps an opaque visible stroke and dot, with fresh web URLs', async () => {
    const { data, info } = await sharp('public/do/icons/do-32.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(info.width).toBe(32); expect(info.height).toBe(32);
    for (const [x, y] of [[9, 16], [14, 16]]) {
      const offset = (y * info.width + x) * info.channels;
      // The canonical inner dot is rose glass, not a black vector dot.
      const rgb = [...data.subarray(offset, offset + 3)];
      expect(Math.max(...rgb.map((channel, i) => Math.abs(channel - [255, 253, 251][i])))).toBeGreaterThan(20);
    }
    const layout = readFileSync('app/do/layout.tsx', 'utf8');
    expect(layout).toContain('do-16.png?v=glass-v1'); expect(layout).toContain('do-32.png?v=glass-v1');
    const manifest = JSON.parse(readFileSync('public/do/manifest.webmanifest', 'utf8'));
    expect(manifest.icons.every((icon: { src: string }) => icon.src.endsWith('?v=glass-v1'))).toBe(true);
  });
  it('tiny D and dot remain distinguishable against the canvas', () => {
    expect(contrast(colours.plum, colours.chalk)).toBeGreaterThanOrEqual(3);
  });
});


describe('DO daylight app field', () => {
  it('keeps every default shell background on canonical paper', () => {
    const sheet = postcss.parse(readFileSync('app/do/do-visual-atmosphere.css', 'utf8'));
    const fields: string[] = [];
    sheet.walkRules(rule => {
      if (!rule.selectors.includes('.do-app-shell')) return;
      rule.walkDecls(declaration => {
        if (declaration.prop === '--do-atmo-paper') expect(declaration.value.toUpperCase()).toBe(colours.paper);
        if (declaration.prop === 'background') fields.push(declaration.value);
        if (declaration.prop === 'background-image') expect(declaration.value).toBe('none');
      });
    });
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) expect(field).toBe('var(--do-atmo-paper)');
  });
  it('preserves the personal field exception and original glass D', () => {
    const sheet = postcss.parse(readFileSync('app/do/do-visual-atmosphere.css', 'utf8'));
    const personal: string[] = [];
    sheet.walkRules(rule => {
      if (rule.selector === '.do-app-shell:has([data-do-identity="assembled-glass"])') {
        rule.walkDecls('background', declaration => { personal.push(declaration.value); });
      }
    });
    expect(personal).toEqual(['transparent']);
    const hero = readFileSync('components/do/DoGlassHero.tsx', 'utf8');
    expect(hero).toContain('<GlassIdentity kind="do"');
  });
});
