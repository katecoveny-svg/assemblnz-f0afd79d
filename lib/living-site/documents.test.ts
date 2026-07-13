import { describe, expect, it } from 'vitest';
import { documentTotals, nzd, priceFromGenome } from './documents';

describe('Living Site document maths', () => {
  it('reads the first dollar amount from a genome service', () => {
    expect(priceFromGenome('$2,200 + GST · 6 weeks')).toBe(2200);
    expect(priceFromGenome('from $28,000 + GST')).toBe(28000);
    expect(priceFromGenome('priced on enquiry')).toBe(0);
  });

  it('calculates NZ GST deterministically', () => {
    expect(documentTotals(2, 100)).toEqual({ subtotal: 200, gst: 30, total: 230 });
  });

  it('formats NZD', () => {
    expect(nzd(115)).toContain('115.00');
  });
});
