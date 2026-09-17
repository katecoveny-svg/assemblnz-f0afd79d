import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LivingBrief, ProductDoors, StudioGallery } from './ImmersiveExperience';
import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';

describe('immersive public experience', () => {
  it('renders useful example content and native controls before JavaScript', () => {
    const html = renderToStaticMarkup(createElement(LivingBrief));
    expect(html).toContain('Watch the work');
    expect(html).toContain('A reason to act.');
    expect(html).toContain('Work loop stage');
    expect(html).toContain('No accounts connected. Nothing is sent or published.');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('<canvas');
    expect(html).not.toContain('<form');
  });
  it('keeps public stories separate from exact existing private workspaces', () => {
    const html = renderToStaticMarkup(createElement(ProductDoors));
    for (const href of ['/pursuit', '/do', '/creative-studio', PRODUCT_DESTINATIONS.pursuit.workspace, PRODUCT_DESTINATIONS.studio.workspace]) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('Sign-in required.');
    expect(html).not.toContain('/studio/do-maker');
    expect(html).not.toContain('/pursuit/playground');
  });
  it('makes Studio visual without invented client work or autoplay media', () => {
    const html = renderToStaticMarkup(createElement(StudioGallery));
    expect(html).toContain('Choose a visual example');
    for (const mode of ['Spatial', 'Motion', 'Identity']) expect(html).toContain(mode);
    expect(html).toContain('/preview/do-world');
    expect(html).toContain('Not a client endorsement or live agent activity.');
    expect(html).not.toContain('<video');
  });
  it('uses the canonical mark and palette, not the legacy purple render', () => {
    const source = readFileSync('components/site/assembl-the-work/ImmersiveExperience.tsx', 'utf8');
    const svg = readFileSync('public/do/canvas/identity-plum.svg', 'utf8');
    expect(source).toContain('/do/canvas/identity-plum.svg');
    expect(source).not.toContain('/do/canvas/dimensional-d.png');
    expect(svg).toContain('M16 12H29C44 12 52 20 52 32S44 52 29 52H16Z');
    for (const colour of ['#240B21', '#916A70', '#FFFDFB']) expect(svg).toContain(colour);
    expect(svg).not.toContain('<script');
  });
});
