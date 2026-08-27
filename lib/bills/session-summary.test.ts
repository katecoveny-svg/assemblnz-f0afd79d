import { describe, expect, it } from 'vitest';
import { summariseSession, threeNumbers, type SessionBill } from '@/lib/bills/session-summary';

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

describe('threeNumbers', () => {
  const today = new Date('2026-08-26T00:00:00Z');
  const b = (over: Partial<SessionBill>): SessionBill => ({
    provider: 'Mercury Energy', category: 'Electricity', amount: 100,
    billDate: null, dueDate: null, fileName: null, confidence: 'high', ...over,
  });

  it('adds up only what falls in the next seven days', () => {
    const n = threeNumbers([
      b({ amount: 120, dueDate: '2026-08-28' }),   // in 2 days
      b({ amount: 80, dueDate: '2026-09-01' }),    // in 6 days
      b({ amount: 400, dueDate: '2026-09-20' }),   // well outside
    ], today);
    expect(n.dueThisWeek).toBe(200);
    expect(n.dueThisWeekCount).toBe(2);
  });

  it('names the soonest bill still ahead, not one already paid', () => {
    const n = threeNumbers([
      b({ provider: 'Spark', amount: 89, dueDate: '2026-08-20' }),  // past
      b({ provider: 'Contact', amount: 210, dueDate: '2026-08-29' }),
    ], today);
    expect(n.next?.provider).toBe('Contact');
    expect(n.next?.inDays).toBe(3);
  });

  it('leaves the third number out until it is given a balance', () => {
    const bills = [b({ amount: 150, dueDate: '2026-08-27' })];
    expect(threeNumbers(bills, today).leftAfterBills).toBeNull();
    expect(threeNumbers(bills, today, 500).leftAfterBills).toBe(350);
  });

  it('says how many bills could not be timed rather than dropping them', () => {
    const n = threeNumbers([b({ dueDate: null }), b({ dueDate: '2026-08-27' })], today);
    expect(n.undated).toBe(1);
  });

  it('survives a due date the parser returned as nonsense', () => {
    const n = threeNumbers([b({ dueDate: 'not-a-date' }), b({ amount: 60, dueDate: '2026-08-27' })], today);
    expect(n.dueThisWeek).toBe(60);
    expect(Number.isFinite(n.dueThisWeek)).toBe(true);
  });
});
