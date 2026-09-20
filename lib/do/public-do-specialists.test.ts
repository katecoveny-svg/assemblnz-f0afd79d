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

describe('public DO entry boundaries', () => {
  it('retains legacy specialist metadata without claiming execution', () => {
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
        '/do/household',
      ]),
    );
  });

  it('allows working entry paths without exposing unfinished operator tools', () => {
    expect(isAllowedPublicDoHref('/do')).toBe(true);
    expect(isAllowedPublicDoHref('/do/meetings')).toBe(true);
    expect(isAllowedPublicDoHref('/do/widget')).toBe(true);
    expect(isAllowedPublicDoHref('/do/widget?task=plan')).toBe(true);
    expect(isAllowedPublicDoHref('/do/install#chrome')).toBe(true);
    expect(isAllowedPublicDoHref('https://foreign.example/do')).toBe(false);
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

  it('opens existing tasks before the preserved product story', () => {
    const doHome = readFileSync(join(root, 'app/do/DoHome.tsx'), 'utf8');
    const doHomePublic = doHome
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/\bpaused=\{[^}]*\}/g, '');
    expect(doHome).toMatch(/small agent that sits where you already work/);
    expect(doHome).toMatch(/atelier-poster\.png/);
    expect(doHomePublic).not.toMatch(/\bpaused\b/i);
    expect(doHome).not.toMatch(/PUBLIC_DO_SPECIALISTS/);
    expect(doHome).not.toMatch(/DoLivingBlob/);
    expect(doHome).toMatch(/href="\/do\/meetings"/);
    expect(doHome).toMatch(/href="\/do\/widget"/);
    expect(doHome).toMatch(/href="\/do\/widget\?task=plan"/);
    expect(doHome.indexOf('id="do-start"')).toBeLessThan(doHome.indexOf('ref={rail}'));
    expect(doHome).toContain('SIGN IN FOR NOTES');
    expect(doHome).not.toMatch(/href="\/do\/household"/);
  });
});
