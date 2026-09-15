import { describe, expect, it } from 'vitest';
import { COMPARE, HERO, NAV, PRODUCTS, START } from './copy';

describe('assembl-the-work PREVIEW copy', () => {
  it('locks the master line and bans keep-it', () => {
    expect(HERO.headline).toBe('assembl the work.');
    expect(HERO.subhead).toBe('find it. DO it. show it.');
    expect(HERO.loopLine).toBe('use one. connect two. run the whole loop.');
    expect(HERO.loopLine.toLowerCase()).not.toContain('keep it');
  });

  it('emphasises DO in nav and products', () => {
    expect(NAV.products.find((p) => p.label === 'DO')?.emphasis).toBe(true);
    expect(NAV.cta.href).toBe('/do');
    expect(PRODUCTS.items.find((p) => p.id === 'do')?.hero).toBe(true);
    expect(PRODUCTS.items.find((p) => p.id === 'do')?.verb).toContain('execute');
    expect(START.primary.href).toBe('/do');
  });

  it('avoids bare AI and banned slop in comparison labels', () => {
    const blob = JSON.stringify({ COMPARE, HERO, PRODUCTS, START }).toLowerCase();
    expect(blob).not.toMatch(/\bai\b/);
    expect(blob).not.toContain('seamless');
    expect(blob).not.toContain('quietly');
    expect(blob).not.toContain('unlock');
    expect(COMPARE.columns.map((c) => c.name)).toEqual(['Copilots', 'Automation', 'assembl']);
  });
});
