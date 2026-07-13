import { describe, expect, it } from 'vitest';
import { commercialDocumentNumber, documentTotals, nzd, priceFromGenome } from './documents';

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

  it('creates unique human-readable proposal and invoice references', () => {
    const date = new Date('2026-07-21T12:00:00+12:00');
    expect(commercialDocumentNumber('proposal', '1a2b3c4d-0000', date)).toBe('P-2026-1A2B3C4D');
    expect(commercialDocumentNumber('invoice', 'abc12345-0000', date)).toBe('INV-2026-ABC12345');
  });
});
