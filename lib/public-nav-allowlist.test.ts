import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  FORBIDDEN_PUBLIC_DESTINATIONS,
  PUBLIC_NAV_ALLOWLIST,
  PUBLIC_PURSUIT_HUB,
  assertNoForbiddenPublicHref,
} from './public-nav-allowlist';

const root = process.cwd();

const PUBLIC_SURFACES = [
  'components/site/assembl-the-work/AssemblTheWorkHome.tsx',
  'components/site/assembl-the-work/AssemblWorldHero.tsx',
  'components/site/assembl-the-work/ProductLanding.tsx',
  'components/site/assembl-the-work/GlowDoWidget.tsx',
  'app/do/DoHome.tsx',
  'app/do/DoUtilityDock.tsx',
  'app/do/widget/page.tsx',
  'app/about/page.tsx',
  'components/do/DoPortableStarters.tsx',
  'components/v2/V2Chrome.tsx',
  'components/v2/V2Footer.tsx',
  'components/site/site-footer.tsx',
] as const;

describe('public nav allowlist', () => {
  it('points primary Pursuit nav at the ChatGPT hub', () => {
    expect(PUBLIC_PURSUIT_HUB).toBe('https://assembl-pursuit.katecoveny.chatgpt.site');
    const pursuit = PUBLIC_NAV_ALLOWLIST.find((item) => item.id === 'pursuit');
    expect(pursuit?.href).toBe(PUBLIC_PURSUIT_HUB);
    expect(pursuit?.external).toBe(true);
  });

  it('keeps forbidden destinations listed', () => {
    expect(FORBIDDEN_PUBLIC_DESTINATIONS).toEqual(
      expect.arrayContaining([
        '/pursuit',
        '/pursuit/playground',
        '/studio',
        '/studio/do-maker',
        '/do/maker/partner',
        '/do/office',
        '/do/tasks',
        '/do/family',
        '/do/builder',
      ]),
    );
  });

  it('keeps primary public surfaces free of forbidden hrefs', () => {
    const errors: string[] = [];
    for (const relative of PUBLIC_SURFACES) {
      const source = readFileSync(join(root, relative), 'utf8');
      errors.push(...assertNoForbiddenPublicHref(source, relative));
    }
    expect(errors).toEqual([]);
  });

  it('does not mount floating Glow DO on about or public DO dock', () => {
    expect(readFileSync(join(root, 'app/about/page.tsx'), 'utf8')).not.toContain(
      'GlowDoWidget',
    );
    expect(readFileSync(join(root, 'app/do/DoUtilityDock.tsx'), 'utf8')).not.toContain(
      'GlowDoWidget',
    );
  });
});
