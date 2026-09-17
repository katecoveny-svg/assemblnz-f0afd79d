import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
it('passes the portable companion isolated contracts', () => {
  const output = execFileSync(process.execPath, ['--test', 'scripts/check-do-portable.cjs'], { cwd: process.cwd(), encoding: 'utf8', timeout: 20_000 });
  expect(output).toContain('# fail 0');
}, 25_000);
