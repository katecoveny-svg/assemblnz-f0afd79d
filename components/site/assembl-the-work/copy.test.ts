import { describe, expect, it } from 'vitest';
import { REVIEW, HERO, NAV, PRODUCTS, START } from './copy';

describe('assembl-the-work homepage copy', () => {
  it('locks the master line and bans keep-it', () => {
    expect(HERO.headline).toBe('assembl the work.');
    expect(HERO.subhead).toBe('find it. DO it. show it.');
    expect(HERO.loopLine).toBe('use one. connect two. run the whole loop.');
    expect(HERO.loopLine.toLowerCase()).not.toContain('keep it');
  });

  it('emphasises DO in nav and products', () => {
    expect(NAV.products.find((p) => p.label === 'DO')?.emphasis).toBe(true);
    expect(NAV.cta.href).toBe('#do-input');
    expect(PRODUCTS.items.find((p) => p.id === 'do')?.hero).toBe(true);
    expect(START.primary.href).toBe('#do-input');
  });

  it('avoids bare AI and banned slop in public labels', () => {
    const blob = JSON.stringify({ REVIEW, HERO, PRODUCTS, START }).toLowerCase();
    expect(blob).not.toMatch(/\bai\b/);
    expect(blob).not.toContain('seamless');
    expect(blob).not.toContain('quietly');
    expect(blob).not.toContain('unlock');
    expect(REVIEW.columns.map((c) => c.name)).toEqual(['Choose the context', 'Inspect the work', 'Approve the next step']);
  });
});
