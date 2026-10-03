import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { HERO, PRODUCTS } from './copy';
import { AssemblWorldHero } from './AssemblWorldHero';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('homepage complete still view', () => {
  it('renders all current product outputs and public links before WebGL', () => {
    const html = renderToStaticMarkup(createElement(AssemblWorldHero));
    for (const output of ['Find the opportunity.', 'Your personal agent for getting things done.', 'Show what’s possible.']) expect(html).toContain(output);
    for (const href of ['/pursuit', '/do', '/creative-studio']) expect(html).toContain(`href="${href}"`);
    expect(html).toContain(HERO.subhead);
    const sceneMarkup = html.slice(0, html.indexOf('aria-label="The complete work loop"'));
    expect(sceneMarkup).not.toContain(HERO.subhead);
    expect(sceneMarkup).not.toContain('What each product does');
    expect(html).toContain('What each product does');
    for (const product of PRODUCTS.items) expect(html).toContain(product.body);
    expect(html).not.toContain('Improve workflows.');
    expect(html).toContain('The complete work loop');
    expect(html).toContain('View Pursuit scene');
    expect(html).toContain('View DO scene');
    expect(html).toContain('View Studio scene');
    expect(html).toContain('Interactive demo');
    expect(html).not.toContain('No live agent activity.');
    expect(html).toContain('Open DO: photo, talk or notes into useful work');
    expect(html).not.toContain('name="brief"');
    expect(html).not.toContain('/do/meetings');
    expect(html).not.toContain('/do/household');
  });
});
