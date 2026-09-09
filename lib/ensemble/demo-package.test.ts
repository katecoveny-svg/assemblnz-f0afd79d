import { describe, expect, it } from 'vitest';
import {
  ENSEMBLE_BRAND_BOARD,
  ENSEMBLE_MAKERS,
  ENSEMBLE_PACKAGE_STAGES,
} from '@/lib/ensemble/demo-package';
import { ENSEMBLE_PREVIEW, ENSEMBLE_STUDIO_LINKS } from '@/lib/ensemble/preview-copy';

describe('Ensemble creative front door DEMO data', () => {
  it('stages a DEMO creative package without floor-plate pins', () => {
    expect(ENSEMBLE_PACKAGE_STAGES.length).toBeGreaterThanOrEqual(4);
    for (const stage of ENSEMBLE_PACKAGE_STAGES) {
      expect(stage.demo).toBe(true);
      expect(stage.label.length).toBeGreaterThan(2);
      expect(stage.agent.length).toBeGreaterThan(2);
    }
  });

  it('labels every brand-board item as DEMO', () => {
    expect(ENSEMBLE_BRAND_BOARD.length).toBeGreaterThanOrEqual(5);
    for (const item of ENSEMBLE_BRAND_BOARD) {
      expect(item.demo).toBe(true);
      expect(item.agent.length).toBeGreaterThan(2);
    }
  });

  it('exposes makers and live studio craft links', () => {
    expect(ENSEMBLE_MAKERS.map((m) => m.slug)).toEqual([
      'auaha',
      'prism',
      'muse',
      'flux',
      'verse',
    ]);
    const hrefs = ENSEMBLE_STUDIO_LINKS.map((l) => l.href);
    expect(hrefs).toContain('/generative-studio');
    expect(hrefs).toContain('/pattern-studio');
    expect(hrefs).toContain('/ad-studio');
    expect(hrefs).toContain('/agents/auaha');
    expect(hrefs).toContain('/agents/prism');
    expect(hrefs).toContain('/agents/muse');
  });

  it('keeps preview copy free of partnership claims and retired product labels', () => {
    const blob = JSON.stringify(ENSEMBLE_PREVIEW).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).toContain('independent concept');
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

  it('keeps creative framing in meta', () => {
    expect(ENSEMBLE_PREVIEW.metaTitle.toLowerCase()).toContain('ensemble');
    expect(ENSEMBLE_PREVIEW.metaTitle.toLowerCase()).toContain('creative');
    expect(ENSEMBLE_PREVIEW.metaDescription.toLowerCase()).toContain('brief');
  });
});
