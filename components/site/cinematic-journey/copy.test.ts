import { describe, expect, it } from 'vitest';
import { CLOSE, FOOTER, HERO, INDUSTRIES, NAV } from '@/components/site/cinematic-journey/copy';

describe('cinematic homepage hrefs', () => {
  it('points Studio, Operator, Journeys and discuss at sellable destinations', () => {
    expect(NAV.studio.href).toBe('/generative-studio');
    expect(NAV.operator.href).toBe('https://demo.assembl.co.nz/admin/login');
    expect(NAV.journeys.href).toBe('/journeys');
    expect(NAV.discuss.href.startsWith('mailto:assembl@assembl.co.nz')).toBe(true);
  });

  it('keeps industry strip on live agent product pages (no /bundles dump)', () => {
    const hrefs = INDUSTRIES.items.map((i) => i.href);
    expect(hrefs).toEqual([
      '/agents/arc',
      '/agents/customs',
      '/agents/forge',
      '/agents/ensemble',
    ]);
    for (const href of hrefs) {
      expect(href.startsWith('/agents/')).toBe(true);
      expect(href.includes('bundle')).toBe(false);
      expect(href.includes('pricing')).toBe(false);
    }
  });

  it('anchors live-wait CTA on-page and journeys demos under /journeys', () => {
    expect(HERO.ctaPrimary.href).toBe('#industries');
    expect(HERO.ctaSecondary.href).toBe('#live-wait');
    expect(CLOSE.demos.href).toBe('/journeys');
  });

  it('mirrors Studio / Journeys / Operator in the footer', () => {
    expect(FOOTER.links.map((l) => l.href)).toEqual([
      '/generative-studio',
      '/journeys',
      'https://demo.assembl.co.nz/admin/login',
      'mailto:assembl@assembl.co.nz',
    ]);
  });
});
