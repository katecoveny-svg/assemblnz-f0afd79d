import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PublicAssemblGuide } from './PublicAssemblGuide';

describe('public company guidance without a provider', () => {
  it('renders useful prepared facts and a clear mode label before any live request', () => {
    const html = renderToStaticMarkup(createElement(PublicAssemblGuide));
    expect(html).toContain('Prepared company guide · not a live AI answer');
    expect(html).toContain('New Zealand software business');
    expect(html).toContain('href="/lab"');
    expect(html).toContain('mailto:assembl@assembl.co.nz');
    expect(html).toContain('cannot access your account');
    expect(html).not.toMatch(/href="\/(?:do|pursuit|studio|creative-studio)(?:[/?#"])/);
    expect(html).toContain('Optional live question');
    expect(html).toMatch(/<button type="submit" disabled=""/);
    expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
  });
});
