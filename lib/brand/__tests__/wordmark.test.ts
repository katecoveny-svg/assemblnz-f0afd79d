import { describe, expect, it } from 'vitest';
import { buildWatermark, exportDisclaimer, scanForbidden, WORDMARK } from '../wordmark';

describe('export-side wordmark + voice guard (ported)', () => {
  it('builds a deterministic ASSEMBL- tracking watermark', () => {
    const { watermark } = buildWatermark('mariner', new Date('2026-06-23T00:00:00Z'), () => 'abcd1234');
    expect(watermark).toBe('ASSEMBL-MARINER-20260623-abcd1234');
  });

  it('sanitises odd scopes into the watermark', () => {
    const { watermark } = buildWatermark('quality + defects', new Date('2026-01-02T00:00:00Z'), () => 'zzzzzzzz');
    expect(watermark).toBe('ASSEMBL-QUALITY-DEFECTS-20260102-zzzzzzzz');
  });

  it('flags forbidden slop phrases', () => {
    const hits = scanForbidden('Our enterprise-grade, world-class, game-changer platform.');
    expect(hits.map((h) => h.phrase)).toEqual(
      expect.arrayContaining(['enterprise-grade', 'world-class', 'game-changer']),
    );
  });

  it('passes clean copy', () => {
    expect(scanForbidden('A draft for a named human to check before it is filed.')).toHaveLength(0);
  });

  it('keeps the wordmark lowercase in the disclaimer', () => {
    expect(WORDMARK).toBe('assembl');
    expect(exportDisclaimer('Mariner')).toContain('Drafted by Mariner via assembl');
  });
});
