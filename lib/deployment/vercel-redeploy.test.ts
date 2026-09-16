import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, expect, it } from 'vitest';

const directories: string[] = [];
afterEach(() => directories.splice(0).forEach(dir => rmSync(dir, { recursive: true, force: true })));
const script = resolve('scripts/vercel-ignore-build.mjs');
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'assembl-redeploy-'));
  directories.push(dir);
  const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Release test');
  git('config', 'user.email', 'release-test@example.invalid');
  writeFileSync(join(dir, 'runtime.ts'), 'export const value = 1;');
  git('add', '.'); git('commit', '-qm', 'fixture');
  const base = git('rev-parse', 'HEAD');
  const decision = () => spawnSync(process.execPath, [script], {
    cwd: dir, env: { ...process.env, VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_PREVIOUS_SHA: base },
  }).status;
  return { dir, git, decision };
}
it('builds an explicit redeploy at the same SHA so new environment settings apply', () => {
  expect(fixture().decision()).toBe(1);
});
it('still skips a documentation-only new commit', () => {
  const { dir, git, decision } = fixture();
  mkdirSync(join(dir, 'docs'));
  writeFileSync(join(dir, 'docs', 'note.md'), 'Documentation only.');
  git('add', '.'); git('commit', '-qm', 'docs');
  expect(decision()).toBe(0);
});
it('builds a runtime change', () => {
  const { dir, git, decision } = fixture();
  writeFileSync(join(dir, 'runtime.ts'), 'export const value = 2;');
  git('add', '.'); git('commit', '-qm', 'runtime');
  expect(decision()).toBe(1);
});
