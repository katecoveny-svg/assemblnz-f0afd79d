import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Grep guard — canary yellow is deprecated (DIRECTION-LOCKED-2026-07-01:
 * assembl chrome is champagne gold #BFA37A). It must never appear on the
 * TOA ARCHITECTS concept surfaces. Scoped to the TOA file tree so legacy
 * brands that still carry the old hex don't fail the build.
 */
const BANNED = [/#ffd42a/i, /#f5c64b/i];

const TOA_ROOTS = [
  'app/customers/toa-architects',
  'app/demo/toa-architects',
  'components/ops/toa',
  'lib/customers/toa-architects',
  'lib/brand/configs/toa-architects.ts',
  'public/brand/toa-architects/README.md',
];

function collect(path: string): string[] {
  const abs = join(process.cwd(), path);
  try {
    if (statSync(abs).isFile()) return [abs];
  } catch {
    return []; // path absent in this checkout — nothing to scan
  }
  return readdirSync(abs, { recursive: true, withFileTypes: true })
    .filter(
      (e) =>
        e.isFile() &&
        /\.(tsx?|md|css|json)$/.test(e.name) &&
        // this file defines the banned patterns — it can't scan itself
        e.name !== 'canary-guard.test.ts',
    )
    .map((e) => join(e.parentPath ?? e.path, e.name));
}

describe('TOA surfaces never use canary yellow', () => {
  const files = TOA_ROOTS.flatMap(collect);

  it('finds the TOA surface files', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it.each(files.map((f) => [f.replace(process.cwd(), '.')] as const))(
    '%s is canary-free',
    (rel) => {
      const content = readFileSync(join(process.cwd(), rel), 'utf8');
      for (const pattern of BANNED) {
        expect(content).not.toMatch(pattern);
      }
    },
  );
});
