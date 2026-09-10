import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('admin hub nav order', () => {
  it('pins Agents and Connectors immediately after Today', () => {
    const src = readFileSync(join(process.cwd(), 'components/admin/AdminNav.tsx'), 'utf8');
    const labels = [...src.matchAll(/\{\s*label:\s*'([^']+)'\s*,\s*href:\s*'(\/admin[^']*)'/g)].map(
      (m) => m[1],
    );
    expect(labels.slice(0, 3)).toEqual(['Today', 'Agents', 'Connectors']);
    expect(labels).toContain('Agents');
    expect(labels).toContain('Connectors');
  });
});
