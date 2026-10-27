import { describe, expect, it } from 'vitest';
import { chromeMarkup, leadMarkup, trailMarkup, footerMarkup } from './markup';
describe('homepage product navigation scope', () => {
  it('keeps Lab alone in the top product navigation while preserving company and legal content', () => {
    const nav = chromeMarkup.match(/<nav aria-label="Primary"[\s\S]*?<\/nav>/)?.[0] ?? '';
    expect(nav.match(/href="[^"]+"/g)).toEqual(['href="/lab"']);
    expect(chromeMarkup).toContain('href="/contact"');
    expect(leadMarkup).toContain('href="#try"');
    expect(trailMarkup).toContain('href="/lab"');
    expect([chromeMarkup, leadMarkup, trailMarkup, footerMarkup].join('')).not.toMatch(/href="\/(?:do|pursuit|studio|creative-studio)(?:[/?#"])/);
    expect(footerMarkup).toContain('href="/legal/privacy"');
  });
});
