import { describe, expect, it } from 'vitest';
import {
  DIGITAL_TURQUOISE,
  EVIDENCE_SPLIT,
  ONE_NZ_ACCENT,
  ONE_NZ_ACCENT_DEPTH,
  MASTHEAD,
  TWELVE_WORD_ENERGY,
  nzd,
} from './one-nz';

describe('one-nz loyalty tokens', () => {
  it('locks client accent to digital turquoise #007C92', () => {
    expect(ONE_NZ_ACCENT).toBe('#007C92');
    expect(DIGITAL_TURQUOISE).toBe('#007C92');
    expect(ONE_NZ_ACCENT_DEPTH).toBe('#00B0CA');
    expect(ONE_NZ_ACCENT).not.toBe('#00A45F');
  });

  it('keeps locked masthead and activation spine', () => {
    expect(MASTHEAD).toBe('the wait is the earn event.');
    expect(TWELVE_WORD_ENERGY).toContain('activation and hold-time waits');
    expect(TWELVE_WORD_ENERGY).toContain('phone dollars toward the next upgrade');
  });

  it('keeps 55/30/15 evidence composition', () => {
    expect(EVIDENCE_SPLIT.map((r) => r.pct)).toEqual([55, 30, 15]);
    expect(EVIDENCE_SPLIT.reduce((s, r) => s + r.pct, 0)).toBe(100);
  });

  it('uses a fresh Mana Receipt demo timestamp (Sep 2026)', async () => {
    const { DEMO_RECEIPT_AT } = await import('./one-nz');
    expect(DEMO_RECEIPT_AT).toMatch(/Sep 2026/);
    expect(DEMO_RECEIPT_AT).not.toMatch(/2025/);
  });
});
