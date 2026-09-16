import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { affectedEdgeFunctions } from '../../scripts/edge-deploy-targets.mjs';

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach(dir => rmSync(dir, { force: true, recursive: true })));
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'assembl-edge-targets-'));
  dirs.push(root);
  const files = {
    'alpha/index.ts': 'import {x} from "../_shared/auth.ts";',
    'beta/index.ts': 'import {y} from "../_shared/indirect.ts";',
    'gamma/index.ts': 'export const standalone = true;',
    '_shared/auth.ts': 'export const x = true;',
    '_shared/indirect.ts': 'export {x as y} from "./auth.ts";',
    '_shared/unused.ts': 'export const unused = true;',
  };
  for (const [file, source] of Object.entries(files)) {
    const path = join(root, 'supabase/functions', file);
    mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, source);
  }
  return root;
}
it('selects only the directly changed function', () => {
  expect(affectedEdgeFunctions(['supabase/functions/gamma/index.ts'], fixture())).toEqual(['gamma']);
});
it('selects direct and transitive consumers of a shared change', () => {
  expect(affectedEdgeFunctions(['supabase/functions/_shared/auth.ts'], fixture())).toEqual(['alpha', 'beta']);
});
it('does not redeploy unrelated functions for docs or an unused helper', () => {
  expect(affectedEdgeFunctions(['docs/note.md', 'supabase/functions/_shared/unused.ts'], fixture())).toEqual([]);
});
it('retains the explicitly requested full deployment', () => {
  expect(affectedEdgeFunctions([], fixture(), true)).toEqual(['alpha', 'beta', 'gamma']);
});
