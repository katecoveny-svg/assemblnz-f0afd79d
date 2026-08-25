import { describe, expect, it } from 'vitest';
import { summariseSession, type SessionBill } from '@/lib/bills/session-summary';

const bill = (over: Partial<SessionBill>): SessionBill => ({
  provider: 'Mercury Energy',
  category: 'Electricity',
  amount: 100,
  billDate: null,
  dueDate: null,
  fileName: null,
  confidence: 'high',
  ...over,
});

describe('summariseSession', () => {
  it('reports nothing when nothing has been uploaded', () => {
    const s = summariseSession([]);
    expect(s).toMatchObject({ count: 0, pricedCount: 0, monthly: 0, annual: 0, byCategory: [] });
  });

  it('adds up only the bills a total could be read from', () => {
    const s = summariseSession([
      bill({ amount: 431 }),
      bill({ amount: 89, category: 'Broadband' }),
      bill({ amount: null, provider: 'Blurry photo' }),
    ]);
    expect(s.count).toBe(3);
    expect(s.pricedCount).toBe(2);
    expect(s.monthly).toBe(520);
    expect(s.annual).toBe(6240);
  });

  it('never treats an unreadable total as zero spend', () => {
    const withGap = summariseSession([bill({ amount: 200 }), bill({ amount: null })]);
    const withoutGap = summariseSession([bill({ amount: 200 })]);
    expect(withGap.monthly).toBe(withoutGap.monthly);
    expect(withGap.count).toBeGreaterThan(withoutGap.count);
  });

  it('groups by category, biggest first', () => {
    const s = summariseSession([
      bill({ amount: 89, category: 'Broadband' }),
      bill({ amount: 431, category: 'Electricity' }),
      bill({ amount: 120, category: 'Electricity' }),
    ]);
    expect(s.byCategory).toEqual([
      { category: 'Electricity', amount: 551 },
      { category: 'Broadband', amount: 89 },
    ]);
  });

  it('ignores a non-finite amount rather than producing NaN', () => {
    const s = summariseSession([bill({ amount: Number.NaN }), bill({ amount: 50 })]);
    expect(s.monthly).toBe(50);
    expect(Number.isFinite(s.annual)).toBe(true);
  });
});
