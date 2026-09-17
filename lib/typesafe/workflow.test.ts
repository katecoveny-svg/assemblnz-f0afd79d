import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
it('passes TypeSafe to DO workflow and HTTP boundary checks', () => {
  const output = execFileSync(process.execPath, ['--test', 'scripts/check-typesafe-workflow.cjs'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 20_000,
  });
  expect(output).toContain('# fail 0');
}, 25_000);
