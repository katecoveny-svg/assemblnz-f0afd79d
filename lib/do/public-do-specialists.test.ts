import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BANNED_PUBLIC_DO_HREFS,
  BANNED_PUBLIC_DO_PROMOS,
  PUBLIC_DO_SPECIALISTS,
  assertPublicShelfText,
  isAllowedPublicDoHref,
} from './public-do-specialists';

const root = join(process.cwd());

const PUBLIC_SURFACES = [
  'app/do/DoHome.tsx',
  'components/do/DoPortableStarters.tsx',
  'components/site/assembl-the-work/GlowDoWidget.tsx',
  'components/do/DoSpatialScene.tsx',
  'app/do/DoUtilityDock.tsx',
  'components/site/assembl-the-work/AssemblTheWorkHome.tsx',
] as const;

describe('public DO specialists lock', () => {
  it('keeps Meeting and Household as preview specialists only — not the public face', () => {
    expect(PUBLIC_DO_SPECIALISTS.map((s) => s.id)).toEqual(['meeting', 'household']);
    expect(PUBLIC_DO_SPECIALISTS.map((s) => s.href)).toEqual([
      '/do/meetings',
      '/do/household',
    ]);
  });

  it('keeps banned specialist and operator destinations listed', () => {
    expect(BANNED_PUBLIC_DO_PROMOS).toEqual(
      expect.arrayContaining([
        'Personal DO',
        'Inbox DO',
        'Bills DO',
        'Writing DO',
        'Creative DO',
        'Detail DO',
        'Builder DO',
      ]),
    );
    expect(BANNED_PUBLIC_DO_HREFS).toEqual(
      expect.arrayContaining([
        '/do/family',
        '/do/bills',
        '/do/builder',
        '/do/office',
        '/do/tasks',
        '/do/connections',
        '/do/meetings',
        '/do/household',
      ]),
    );
  });

  it('allows only /do as the public DO entry href', () => {
    expect(isAllowedPublicDoHref('/do')).toBe(true);
    expect(isAllowedPublicDoHref('/do/meetings')).toBe(false);
    expect(isAllowedPublicDoHref('/do/household')).toBe(false);
    expect(isAllowedPublicDoHref('/do/builder')).toBe(false);
    expect(isAllowedPublicDoHref('/do/office')).toBe(false);
  });

  it('keeps public shelves free of banned promos and hrefs', () => {
    const errors: string[] = [];
    for (const relative of PUBLIC_SURFACES) {
      const source = readFileSync(join(root, relative), 'utf8');
      errors.push(...assertPublicShelfText(source, relative));
    }
    expect(errors).toEqual([]);
  });

  it('keeps public /do as a holding page without the tool shelf', () => {
    const doHome = readFileSync(join(root, 'app/do/DoHome.tsx'), 'utf8');
    expect(doHome).toMatch(/DO is paused on the public site/);
    expect(doHome).not.toMatch(/PUBLIC_DO_SPECIALISTS/);
    expect(doHome).not.toMatch(/DoLivingBlob/);
    expect(doHome).not.toMatch(/href="\/do\/meetings"/);
    expect(doHome).not.toMatch(/href="\/do\/household"/);
  });
});
