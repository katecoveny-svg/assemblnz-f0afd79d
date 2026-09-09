import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Paper craft locks for the shared agent-app kit (lineage: Arc #1166).
 * HARD FAIL: full-field dark plum. Field must be paper #FFFDFB; plum is accent.
 */
describe('agent-app paper craft locks', () => {
  const css = readFileSync(
    resolve(process.cwd(), 'components/agent-app/agent-app-craft.css'),
    'utf8',
  );

  it('keeps the craft field on paper, not full-field plum', () => {
    expect(css).toMatch(/--aa-paper:\s*#fffdfb/i);
    expect(css).toMatch(/--aa-plum:\s*#240b21/i);
    expect(css).toMatch(/\.aa-root\s*\{[^}]*background-color:\s*var\(--aa-paper\)/s);
    // Full-field plum would paint the root with --aa-plum / #240B21 as background.
    expect(css).not.toMatch(/\.aa-root\s*\{[^}]*background(?:-color)?:\s*(?:var\(--aa-plum\)|#240b21)/is);
  });

  it('uses Instrument Sans + IBM Plex Mono token hooks', () => {
    expect(css).toMatch(/--font-body/);
    expect(css).toMatch(/Instrument Sans/);
    expect(css).toMatch(/--font-mono/);
    expect(css).toMatch(/IBM Plex Mono/);
  });
});
