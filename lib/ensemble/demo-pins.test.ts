import { describe, expect, it } from 'vitest';
import { ENSEMBLE_DEMO_PINS } from '@/lib/ensemble/demo-pins';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

describe('Ensemble PREVIEW demo data', () => {
  it('labels every pin as DEMO with ASA / Fair Trading codes', () => {
    expect(ENSEMBLE_DEMO_PINS.length).toBeGreaterThanOrEqual(3);
    for (const v of ENSEMBLE_DEMO_PINS) {
      expect(v.demo).toBe(true);
      expect(v.code.length).toBeGreaterThan(2);
      expect(v.position.x).toBeGreaterThan(0);
      expect(v.position.x).toBeLessThanOrEqual(100);
      expect(v.position.y).toBeGreaterThan(0);
      expect(v.position.y).toBeLessThanOrEqual(100);
    }
    const blob = ENSEMBLE_DEMO_PINS.map((f) => f.code).join(' ');
    expect(blob).toMatch(/ASA/);
    expect(blob).toMatch(/FTA|Fair Trading/i);
  });

  it('keeps preview copy free of partnership claims and retired product labels', () => {
    const blob = JSON.stringify(ENSEMBLE_PREVIEW).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/\bauaha\b/);
    expect(blob).not.toMatch(/\bprism\b/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).toContain('independent concept');
    expect(blob).toContain('concept');
    expect(blob).toContain('demo');
    expect(ENSEMBLE_PREVIEW.tiers.map((t) => t.name)).toEqual([
      'Look',
      'Practice',
      'Studio',
      'Enterprise',
    ]);
  });

  it('frames pricing as hours back', () => {
    expect(ENSEMBLE_PREVIEW.tiers.every((t) => typeof t.hoursBack === 'number')).toBe(true);
    expect(ENSEMBLE_PREVIEW.hoursBack.toLowerCase()).toContain('hours back');
  });

  it('keeps title-block cue wording in meta', () => {
    expect(ENSEMBLE_PREVIEW.metaTitle.toLowerCase()).toContain('ensemble');
    expect(ENSEMBLE_PREVIEW.metaTitle.toLowerCase()).toContain('creative');
    expect(ENSEMBLE_PREVIEW.metaTitle.toLowerCase()).toContain('concept');
    expect(ENSEMBLE_PREVIEW.metaTitle.toLowerCase()).toContain('demo');
  });
});
