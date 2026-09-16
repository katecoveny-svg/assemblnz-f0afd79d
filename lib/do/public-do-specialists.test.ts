import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PUBLIC_DO_BANNED_COPY,
  PUBLIC_DO_BANNED_SPECIALIST_IDS,
  PUBLIC_DO_BANNED_SPECIALIST_NAMES,
  PUBLIC_DO_SPECIALISTS,
} from '@/lib/do/public-do-specialists';

const root = process.cwd();

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

/** Public marketing / product surfaces that must not leak personal DO chrome. */
const PUBLIC_DO_SURFACES = [
  'app/do/DoHome.tsx',
  'app/do/DoReveal.tsx',
  'app/do/page.tsx',
  'components/do/DoSpatialScene.tsx',
] as const;

describe('public /do privacy — DEMO honesty', () => {
  it('exports only work product-demo specialists', () => {
    expect(PUBLIC_DO_SPECIALISTS.length).toBeGreaterThan(0);
    expect(PUBLIC_DO_SPECIALISTS.some((item) => item.id === 'writing')).toBe(
      true,
    );
    for (const item of PUBLIC_DO_SPECIALISTS) {
      expect(item.scope).toBe('work');
      expect(PUBLIC_DO_BANNED_SPECIALIST_IDS).not.toContain(item.id);
      expect(PUBLIC_DO_BANNED_SPECIALIST_NAMES).not.toContain(item.name);
    }
  });

  it('keeps Personal / Household / Inbox / Bills off public /do sources', () => {
    for (const rel of PUBLIC_DO_SURFACES) {
      const text = read(rel);
      for (const name of PUBLIC_DO_BANNED_SPECIALIST_NAMES) {
        expect(text, `${rel} must not name ${name}`).not.toContain(name);
      }
      // Do not re-introduce personal shelf ids as live cards.
      expect(text, `${rel} must not use id personal`).not.toMatch(
        /id:\s*['"]personal['"]/,
      );
      expect(text, `${rel} must not use id household`).not.toMatch(
        /id:\s*['"]household['"]/,
      );
      expect(text, `${rel} must not use id inbox`).not.toMatch(
        /id:\s*['"]inbox['"]/,
      );
      expect(text, `${rel} must not use id bills`).not.toMatch(
        /id:\s*['"]bills['"]/,
      );
    }
  });

  it('strips demo-week / do-not-share personal context from public /do craft', () => {
    const home = read('app/do/DoHome.tsx');
    const reveal = read('app/do/DoReveal.tsx');
    for (const re of PUBLIC_DO_BANNED_COPY) {
      // Canon module may name banned strings in the ban list itself.
      expect(home, `DoHome matched ${re}`).not.toMatch(re);
      expect(reveal, `DoReveal matched ${re}`).not.toMatch(re);
    }
    expect(reveal).toMatch(/PRODUCT DEMO|WRITING BRIEF · DEMO/);
    expect(home).toMatch(/PUBLIC_DO_SPECIALISTS/);
    expect(home).not.toMatch(/Per-DO task lists/);
    expect(home).not.toMatch(/href="\/do\/tasks"/);
  });

  it('routes public /do through DoHome product surface', () => {
    const page = read('app/do/page.tsx');
    expect(page).toMatch(/DoHome/);
    expect(page).not.toMatch(/DoHomeCurrent/);
  });
});
