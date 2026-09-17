import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AssemblWorldHero } from './AssemblWorldHero';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('homepage complete still view', () => {
  it('renders every product input, output and link before JavaScript or WebGL', () => {
    const html = renderToStaticMarkup(createElement(AssemblWorldHero));
    for (const output of [
      'An opportunity worth reviewing.',
      'Prepared work with evidence — when DO is open for you.',
      'Something people can see and try.',
    ])
      expect(html).toContain(output);
    expect(html).toContain('About DO');
    expect(html).toContain('Public try-it DO tools are paused');
    expect(html).not.toContain('Open Meeting or Household');
    expect(html).not.toContain('name="brief"');
    expect(html).toContain('https://assembl-pursuit.katecoveny.chatgpt.site');
    expect(html).toContain('href="/pursuit"');
    expect(html).toContain('href="/do"');
    expect(html).toContain('href="/creative-studio"');
  });
});
