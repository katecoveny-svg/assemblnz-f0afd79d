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
      'Useful notes or a chores board — ready for your review.',
      'Something people can see and try.',
    ])
      expect(html).toContain(output);
    expect(html).toContain('Open Meeting or Household');
    expect(html).toContain('name="brief"');
    expect(html).toContain('href="/pursuit"');
    expect(html).toContain('href="/do"');
    expect(html).toContain('href="/creative-studio"');
  });
});
