import { describe, expect, it } from 'vitest';
import { DEMOS, SUPERSEDED, url } from './catalogue';
describe('canonical discovery with preserved references', () => {
  it('supports an explicit canonical host while retaining legacy slug URL behavior', () => {
    expect(url('concept')).toBe('https://assembling-concept.pages.dev');
    expect(url({ slug: 'example', canonicalTarget: 'https://example.org/concept' })).toBe('https://example.org/concept');
    expect(() => url({ slug: 'example', canonicalTarget: 'javascript:alert(1)' })).toThrow('HTTPS');
    expect(() => url({ slug: 'example', canonicalTarget: 'https://user:password@example.org' })).toThrow('HTTPS');
  });
  it('has one current Woolworths concept with dated access and honest provider limits', () => {
    const woolworths = DEMOS.filter(d => /Woolworths|Everyday Rewards/i.test(d.company));
    expect(woolworths).toHaveLength(1);
    expect(url(woolworths[0])).toBe('https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards');
    expect(woolworths[0].verification).toMatchObject({ observedAt: '2026-10-12', access: 'public' });
    expect(woolworths[0].caution).toContain('credential-blocked');
    expect(woolworths[0].caution).toContain('Not production-ready');
    expect(woolworths[0].has.agent).toBe(true);
    expect(woolworths[0].verification?.readiness).toContain('provider behavior verified');
    expect(woolworths[0].verification?.behavior).toContain('reviewer removed milk');
    expect(woolworths[0].caution).toContain('remain simulated');
    expect(woolworths[0].verification?.readiness).not.toContain('provider success unverified');
  });
  it('keeps earlier links as references and points each to the explicit canonical replacement', () => {
    for (const slug of ['everyday-rewards', 'woolworths-rewards', 'concept', 'woolworths-cine']) {
      const ref = SUPERSEDED.find(s => s.slug === slug);
      expect(ref).toBeDefined();
      expect(url(ref!)).toBe(`https://assembling-${slug}.pages.dev`);
      expect(ref?.replacedByTarget).toBe(url(DEMOS[0]));
    }
  });
});
