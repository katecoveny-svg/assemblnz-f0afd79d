import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

it('passes the isolated TypeSafe contract, transport and route guard suite', () => {
  const output = execFileSync(process.execPath, ['--test', 'scripts/check-typesafe-pilot.cjs'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 20_000,
  });
  expect(output).toContain('# fail 0');
}, 25_000);
