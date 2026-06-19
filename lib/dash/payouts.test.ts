import { describe, expect, it } from 'vitest';
import {
  computeBalance,
  isPayable,
  publisherCredit,
  roundNzd,
  toCents,
  PAYOUT_THRESHOLD_NZD,
} from './payouts';

describe('dash payout maths', () => {
  it('balance = sum(credits) − sum(debits)', () => {
    expect(
      computeBalance([
        { direction: 'credit', amount_nzd: 12.5 },
        { direction: 'credit', amount_nzd: '10.00' },
        { direction: 'debit', amount_nzd: 5 },
      ]),
    ).toBe(17.5);
  });

  it('ignores non-numeric amounts and rounds to cents', () => {
    expect(computeBalance([{ direction: 'credit', amount_nzd: 'oops' }, { direction: 'credit', amount_nzd: 0.1 }])).toBe(0.1);
    expect(roundNzd(0.1 + 0.2)).toBe(0.3);
  });

  it('isPayable needs both threshold AND payouts enabled', () => {
    expect(isPayable(25, true)).toBe(true);
    expect(isPayable(PAYOUT_THRESHOLD_NZD, true)).toBe(true); // exactly at threshold pays
    expect(isPayable(19.99, true)).toBe(false);
    expect(isPayable(100, false)).toBe(false); // payouts disabled → never
  });

  it('publisherCredit applies rev-share to the cent', () => {
    expect(publisherCredit(1, 0.55)).toBe(0.55);
    expect(publisherCredit(1, 0.6)).toBe(0.6); // anchor
    expect(publisherCredit(0.0007, 0.55)).toBe(0); // tiny → rounds to 0c
    expect(publisherCredit(-5, 0.55)).toBe(0); // never credit negative revenue
  });

  it('toCents gives integer Stripe amounts', () => {
    expect(toCents(17.5)).toBe(1750);
    expect(toCents(0.55)).toBe(55);
  });
});
