import { describe, expect, it } from 'vitest';
import {
  DIGITAL_TURQUOISE,
  ONE_NZ_ACCENT,
  MASTHEAD,
  TWELVE_WORD_ENERGY,
  nzd,
} from './one-nz';

describe('one-nz loyalty tokens', () => {
  it('locks client accent to digital turquoise #007C92', () => {
    expect(ONE_NZ_ACCENT).toBe('#007C92');
    expect(DIGITAL_TURQUOISE).toBe('#007C92');
    expect(ONE_NZ_ACCENT).not.toBe('#00A45F');
  });

  it('keeps locked masthead and twelve-word energy line', () => {
    expect(MASTHEAD).toBe('the wait is the earn event.');
    expect(TWELVE_WORD_ENERGY).toContain('loyalty programme');
    expect(TWELVE_WORD_ENERGY).toContain('currency the customer already values');
  });

  it('formats NZD for Phone Dollars', () => {
    expect(nzd(2.75)).toMatch(/\$2\.75/);
  });
});
