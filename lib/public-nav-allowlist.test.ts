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
  'components/site/pursuit/PursuitLanding.tsx',
  'app/do/DoHome.tsx',
  'app/do/DoUtilityDock.tsx',
  'components/do/DoPortableStarters.tsx',
  'components/v2/V2Chrome.tsx',
  'components/v2/V2Footer.tsx',
  'components/site/site-footer.tsx',
] as const;

describe('public nav allowlist', () => {
  it('opens Pursuit hub and Creative Studio workspace as primary nav doors', () => {
    expect(PUBLIC_PURSUIT_HUB).toBe('https://assembl-pursuit.katecoveny.chatgpt.site');
    const pursuit = PUBLIC_NAV_ALLOWLIST.find((item) => item.id === 'pursuit');
    expect(pursuit?.href).toBe(PUBLIC_PURSUIT_HUB);
    expect(pursuit?.external).toBe(true);
    const studio = PUBLIC_NAV_ALLOWLIST.find((item) => item.id === 'studio');
    expect(studio?.href).toBe('https://assembl-pursuit.katecoveny.chatgpt.site/agency');
    expect(studio?.external).toBe(true);
  });

  it('keeps forbidden destinations listed', () => {
    expect(FORBIDDEN_PUBLIC_DESTINATIONS).toEqual(
      expect.arrayContaining([
        '/pursuit/playground',
        '/studio/do-maker',
        '/do/maker/partner',
        '/do/office',
        '/do/builder',
        '/do/meetings',
        '/do/household',
      ]),
    );
    expect(FORBIDDEN_PUBLIC_DESTINATIONS).not.toContain('/pursuit');
  });

  it('keeps primary public surfaces free of forbidden hrefs', () => {
    const errors: string[] = [];
    for (const relative of PUBLIC_SURFACES) {
      const source = readFileSync(join(root, relative), 'utf8');
      errors.push(...assertNoForbiddenPublicHref(source, relative));
    }
    expect(errors).toEqual([]);
  });
});
