import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
it('passes the portable companion isolated contracts', () => {
  // Node's default reporter differs by version and TTY. Request the contract we inspect.
  const output = execFileSync(process.execPath, ['--test', '--test-reporter=tap', 'scripts/check-do-portable.cjs'], { encoding: 'utf8' });
  expect(output).toContain('# fail 0');
}, 25_000);
