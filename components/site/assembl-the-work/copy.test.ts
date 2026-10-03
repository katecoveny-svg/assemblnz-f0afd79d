import { describe, expect, it } from 'vitest';
import { REVIEW, HERO, HOME_META, POSITIONING, NAV, PRODUCTS, START } from './copy';

describe('assembl-the-work homepage copy', () => {
  it('keeps the company offer broad and avoids retired slogans', () => {
    expect(HERO.headline).toBe('Assemble useful work.');
    expect(HERO.subhead).toBe('We bring strategy, design and AI together to help businesses find opportunities, create better customer experiences and get useful work done.');
    expect(HOME_META.description).toBe(HERO.subhead);
    expect(POSITIONING.company).toBe(HERO.subhead);
    expect(HERO.loopLine).toBe('Start with one product. Bring them together when the work calls for it.');
    expect(HERO.loopLine.toLowerCase()).not.toContain('keep it');
  });

  it('emphasises DO in nav and products', () => {
    expect(NAV.products.find((p) => p.label === 'DO')?.emphasis).toBe(true);
    expect(NAV.cta.href).toBe('#products');
    expect(PRODUCTS.items.find((p) => p.id === 'do')?.hero).toBe(true);
    expect(START.primary.href).toBe('/pursuit');
  });

  it('avoids bare AI and banned slop in public labels', () => {
    // Kate explicitly approved AI in this exact company sentence.
    // All other public labels retain the bare-AI guard.
    const blob = JSON.stringify({ REVIEW, HERO, PRODUCTS, START }, (_key, value) =>
      value === POSITIONING.company ? '[approved company explanation]' : value).toLowerCase();
    expect(blob).not.toMatch(/\bai\b/);
    expect(blob).not.toContain('seamless');
    expect(blob).not.toContain('quietly');
    expect(blob).not.toContain('unlock');
    expect(REVIEW.columns.map((c) => c.name)).toEqual(['Choose the context', 'Inspect the work', 'Approve the next step']);
  });
});
