import { describe, expect, it } from 'vitest';
import { GATEWAY_DEMO_PINS } from '@/lib/gateway/demo-pins';
import { GATEWAY_PREVIEW } from '@/lib/gateway/preview-copy';

describe('Gateway PREVIEW demo data', () => {
  it('labels every pin as DEMO with NZ customs-class codes', () => {
    expect(GATEWAY_DEMO_PINS.length).toBeGreaterThanOrEqual(3);
    for (const v of GATEWAY_DEMO_PINS) {
      expect(v.demo).toBe(true);
      expect(v.code.length).toBeGreaterThan(3);
      expect(v.position.x).toBeGreaterThan(0);
      expect(v.position.x).toBeLessThanOrEqual(100);
      expect(v.position.y).toBeGreaterThan(0);
      expect(v.position.y).toBeLessThanOrEqual(100);
    }
    const blob = GATEWAY_DEMO_PINS.map((f) => `${f.code} ${f.title} ${f.summary}`).join(' ');
    expect(blob).toMatch(/Tariff|Customs|Biosecurity/);
    expect(blob.toLowerCase()).toMatch(/entry|origin|hs|valuation|biosecurity/);
  });

  it('keeps preview copy free of partnership claims and retired product labels', () => {
    const blob = JSON.stringify(GATEWAY_PREVIEW).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/\btoa\b/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).toContain('independent concept');
    expect(blob).toContain('concept');
    expect(blob).toContain('demo');
    expect(blob).toMatch(/draft-only|nothing lodges/);
    expect(blob).not.toContain('pins on the plate');
    expect(blob).not.toContain('border work that cites');
    expect(blob).not.toContain('flat-lay');
    expect(GATEWAY_PREVIEW.heroLine.toLowerCase()).toContain('review the entry');
    expect(GATEWAY_PREVIEW.modelTitle.toLowerCase()).toMatch(/tap a flag|entry pack/);
    expect(GATEWAY_PREVIEW.tiers.map((t) => t.name)).toEqual([
      'Look',
      'Practice',
      'Studio',
      'Enterprise',
    ]);
  });

  it('frames pricing as hours back', () => {
    expect(GATEWAY_PREVIEW.hoursBack).toMatch(/hours back/i);
    expect(GATEWAY_PREVIEW.pricingTitle.toLowerCase()).toContain('not live');
  });

  it('keeps chat scripted and draft-only', () => {
    expect(GATEWAY_PREVIEW.chatSupport.toLowerCase()).toContain('no model call');
    expect(GATEWAY_PREVIEW.chatFooter.toLowerCase()).toMatch(/draft-only|nothing lodges/);
    expect(GATEWAY_PREVIEW.chatOpeners.length).toBeGreaterThanOrEqual(3);
    for (const o of GATEWAY_PREVIEW.chatOpeners) {
      expect(o.a.toLowerCase()).toMatch(/awaiting human approval|nothing sends/);
    }
  });
});
