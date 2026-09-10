import { describe, expect, it } from 'vitest';
import { FORGE_DEMO_FLAGS } from '@/lib/forge/demo-flags';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

describe('Forge PREVIEW demo data', () => {
  it('labels every bay flag as DEMO with NZTA / CCCFA codes', () => {
    expect(FORGE_DEMO_FLAGS.length).toBeGreaterThanOrEqual(3);
    for (const v of FORGE_DEMO_FLAGS) {
      expect(v.demo).toBe(true);
      expect(v.code.length).toBeGreaterThan(3);
      expect(v.bay.length).toBeGreaterThan(2);
      expect(v.summary.toLowerCase()).not.toContain('floor plate');
    }
    const blob = FORGE_DEMO_FLAGS.map((f) => f.code).join(' ');
    expect(blob).toMatch(/WoF/);
    expect(blob).toMatch(/CoF/);
    expect(blob).toMatch(/CCCFA/);
  });

  it('keeps preview copy free of partnership claims, floor plates, and retired labels', () => {
    const blob = JSON.stringify(FORGE_PREVIEW).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/\btoa\b/);
    expect(blob).not.toMatch(/contact energy/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).not.toContain('floor plate');
    expect(blob).not.toContain('workshop work that cites');
    expect(blob).toContain('independent concept');
    expect(blob).toContain('arataki');
    expect(blob).toContain('demo');
    expect(FORGE_PREVIEW.heroLine.toLowerCase()).toContain('flag bay');
    expect(FORGE_PREVIEW.aratakiHref).toBe('/agents/arataki');
    expect(FORGE_PREVIEW.tiers.map((t) => t.name)).toEqual([
      'Look',
      'Practice',
      'Studio',
      'Enterprise',
    ]);
  });

  it('frames pricing as hours back', () => {
    expect(FORGE_PREVIEW.tiers.every((t) => typeof t.hoursBack === 'number')).toBe(true);
    expect(FORGE_PREVIEW.hoursBack.toLowerCase()).toContain('hours back');
  });
});
