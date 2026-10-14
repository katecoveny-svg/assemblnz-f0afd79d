import { describe, expect, it } from 'vitest';
import { energyUsageCheck, evidenceLine, readBillFromMail, readDate } from './mail-bills';

const email = (text: string, patch: Partial<{ from: string; subject: string; date: string }> = {}) => ({
  from: 'Contact Energy <noreply@contact.example>', subject: 'Your Contact Energy bill is ready', date: '2026-10-02T03:00:00Z', text, ...patch,
});

describe('reading a bill out of an email', () => {
  it('finds provider, total, due date, period and usage, and strips numbers and links from evidence', () => {
    const reading = readBillFromMail(email([
      'Hi there, your latest bill is ready.',
      'Account number: 12345678',
      'Billing period: 1 September 2026 to 30 September 2026',
      'You used 612 kWh this period.',
      'Total amount due: $224.50',
      'Due date: 20 October 2026',
      'View your bill: https://contact.example/bills/abc123',
    ].join('\n')));
    expect(reading).toMatchObject({ provider: 'Contact Energy', category: 'electricity', totalCents: 22450, dueOn: '2026-10-20', periodFrom: '2026-09-01', periodTo: '2026-09-30', usageKwh: 612, confidence: 'high', paymentMentioned: false });
    expect(reading.evidence.join('\n')).not.toMatch(/12345678|https?:|abc123/);
    expect(reading.evidence.some(line => line.includes('224.50'))).toBe(true);
    expect(reading.notices).toEqual([]);
  });
  it('reads NZ day/month/year and month-first dates, and refuses a date without a year', () => {
    expect(readDate('Due 05/10/2026')).toBe('2026-10-05');
    expect(readDate('Pay by Oct 5, 2026')).toBe('2026-10-05');
    expect(readDate('Due 2026-10-05')).toBe('2026-10-05');
    expect(readDate('Due 5 October')).toBeNull();
    expect(readDate('Due 31/02/2026')).toBeNull();
  });
  it('is honest when figures are missing, another currency appears, or a payment is only claimed', () => {
    const reading = readBillFromMail(email('Thanks for being with us. Your bill of AUD $40.00 will be deducted by direct debit on the 20th.', { from: 'Unknown Co <hello@unknown.example>', subject: 'Statement' }));
    expect(reading).toMatchObject({ provider: null, category: null, totalCents: null, dueOn: null, confidence: 'low', paymentMentioned: true });
    expect(reading.notices).toEqual(expect.arrayContaining([
      expect.stringContaining('Another currency'), expect.stringContaining('No total amount'), expect.stringContaining('No due date'),
      expect.stringContaining('direct debit'), expect.stringContaining('No known provider'),
    ]));
  });
  it('never treats a reading as paid or a due date as checked', () => {
    const reading = readBillFromMail(email('Total due $89.00\nDue date 12 October 2026', { from: 'Spark <bills@spark.example>', subject: 'Spark bill' }));
    expect(reading).toMatchObject({ provider: 'Spark', totalCents: 8900, dueOn: '2026-10-12', confidence: 'high' });
    expect('paidConfirmed' in reading).toBe(false);
    expect('checkedAt' in reading).toBe(false);
  });
  it('removes account-like numbers from evidence lines', () => {
    expect(evidenceLine('Account no. AB12345678 total due $50.00 ref 1234 5678 9012')).toBe('Account no. [number removed] total due $50.00 ref [number removed]');
  });
});

describe('unusually high energy use', () => {
  const period = (from: string, to: string, usageKwh: number) => ({ periodFrom: from, periodTo: to, usageKwh });
  it('needs three periods', () => {
    expect(energyUsageCheck([period('2026-07-01', '2026-07-31', 600), period('2026-08-01', '2026-08-31', 620)]).status).toBe('insufficient');
  });
  it('flags a 25% rise per day and names the heating season', () => {
    const check = energyUsageCheck([period('2026-05-01', '2026-05-31', 620), period('2026-06-01', '2026-06-30', 600), period('2026-07-01', '2026-07-31', 820)]);
    expect(check).toMatchObject({ status: 'unusual', latestDailyKwh: 26.5, medianDailyKwh: 20, percentAbove: 32 });
    expect(check.note).toContain('heating season');
    const summer = energyUsageCheck([period('2026-11-01', '2026-11-30', 450), period('2026-12-01', '2026-12-31', 465), period('2027-01-01', '2027-01-31', 620)]);
    expect(summer.status).toBe('unusual');
    expect(summer.note).toContain('outside the usual heating season');
  });
  it('calls a small change typical and ignores invalid periods', () => {
    const check = energyUsageCheck([period('2026-07-01', '2026-07-31', 600), period('2026-08-01', '2026-08-31', 620), period('2026-09-01', '2026-09-30', 610), period('bad', 'bad', 1)]);
    expect(check.status).toBe('typical');
    expect(check.percentAbove).toBeLessThan(25);
  });
});
