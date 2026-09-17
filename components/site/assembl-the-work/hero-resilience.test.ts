import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AssemblWorldHero } from './AssemblWorldHero';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('homepage complete still view', () => {
  it('renders all current product outputs and public links before WebGL', () => {
    const html = renderToStaticMarkup(createElement(AssemblWorldHero));
    for (const output of ['An opportunity worth reviewing.', 'Prepared work with the next action clear.', 'Something people can see, try and understand.']) expect(html).toContain(output);
    for (const href of ['/pursuit', '/do', '/creative-studio']) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('The complete work loop');
    expect(html).toContain('View Pursuit scene');
    expect(html).toContain('View DO scene');
    expect(html).toContain('View Studio scene');
    expect(html).toContain('not live agent activity');
    expect(html).not.toContain('name="brief"');
    expect(html).not.toContain('/do/meetings');
    expect(html).not.toContain('/do/household');
  });
});
