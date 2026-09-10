import { describe, expect, it } from 'vitest';
import { ARC_DEMO_VIOLATIONS } from '@/lib/arc/demo-violations';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

describe('Arc PREVIEW demo data', () => {
  it('labels every pin as DEMO with NZ-class codes', () => {
    expect(ARC_DEMO_VIOLATIONS.length).toBeGreaterThanOrEqual(3);
    for (const v of ARC_DEMO_VIOLATIONS) {
      expect(v.demo).toBe(true);
      expect(v.code.length).toBeGreaterThan(3);
      expect(v.position.x).toBeGreaterThan(0);
      expect(v.position.x).toBeLessThanOrEqual(100);
      expect(v.position.y).toBeGreaterThan(0);
      expect(v.position.y).toBeLessThanOrEqual(100);
    }
  });

  it('keeps preview copy free of partnership claims and retired product labels', () => {
    const blob = JSON.stringify(ARC_PREVIEW).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/\btoa\b/);
    expect(blob).not.toMatch(/heron/);
    expect(blob).not.toMatch(/bearplus/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).toContain('independent concept');
    expect(blob).not.toContain('architecture work that cites');
    expect(ARC_PREVIEW.heroLine.toLowerCase()).toContain('check the plan');
    expect(ARC_PREVIEW.tiers.map((t) => t.name)).toEqual([
      'Look',
      'Practice',
      'Studio',
      'Enterprise',
    ]);
  });
});
