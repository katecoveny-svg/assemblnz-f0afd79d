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
    expect(html).not.toContain('name="brief"');
    expect(html).not.toContain('What do you need done?');
    expect(html).toContain('https://assembl-pursuit.katecoveny.chatgpt.site');
    expect(html).not.toContain('href="/pursuit"');
    expect(html).toContain('href="/do"');
    expect(html).toContain('href="/creative-studio"');
    expect(html).not.toContain('href="/studio"');
    expect(html).not.toContain('/pursuit/playground');
    expect(html).not.toContain('/do/office');
    expect(html).not.toContain('/do/tasks');
  });
});
