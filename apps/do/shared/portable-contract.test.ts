import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
it('passes the portable companion isolated contracts', () => {
  // Node 24 may select the human-readable spec reporter. The assertion below
  // is a TAP assertion; choose TAP rather than mistaking 23 passing tests for failure.
  const output = execFileSync(process.execPath, ['--test', '--test-reporter=tap', 'scripts/check-do-portable.cjs'], { cwd: process.cwd(), encoding: 'utf8', timeout: 20_000 });
  expect(output).toContain('# fail 0');
}, 25_000);
