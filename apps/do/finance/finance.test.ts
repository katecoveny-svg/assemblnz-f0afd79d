import { describe, expect, it } from 'vitest';
import { billCalendar, matchInvoices, recurringPayments } from './analysis';
import { editFinancialDraft, financialHash, financialReceipt, prepareFinancialDraft, reviewFinancialDraft } from './actions';
import { financialCsv, FINANCIAL_CSV_EXAMPLE, FINANCIAL_CSV_LIMIT } from './csv';
import { DEMO_CHECKED_INVOICES, DEMO_FINANCIAL_SNAPSHOT } from './demo';
import { calendarDate, checkedInvoice, parseCents } from './model';

const snapshot = () => structuredClone(DEMO_FINANCIAL_SNAPSHOT);
const observedAt = '2026-09-21T00:00:00.000Z';

describe('financial candidates and checked bills', () => {
  it('finds three fictional patterns and two higher charges without inventing due dates', () => {
    const rows = recurringPayments(snapshot());
    expect(rows).toHaveLength(3);
    expect(rows.filter(row => row.increase)).toHaveLength(2);
    expect(rows.find(row => row.merchant === 'Example Power')).toMatchObject({
      amount: { amount: 22450, currency: 'NZD' }, expectedOn: '2026-10-05',
      increase: { previousAmount: 18000, extraAmount: 4450, percent: 25 },
    });
    expect(rows.every(row => !('dueOn' in row))).toBe(true);
    expect(billCalendar([], snapshot().asOf).totals).toEqual([]);
  });
  it('requires at least three posted outflows, excluding transfers, pending, future and income', () => {
    for (const patch of [{ status: 'pending' as const }, { transfer: true }, { date: '2026-10-05' }, { amount: { amount: 22450, currency: 'NZD' as const } }]) {
      const data = snapshot(); Object.assign(data.transactions[2], patch);
      expect(recurringPayments(data).map(row => row.merchant)).not.toContain('Example Power');
    }
  });
  it('never merges different accounts or currencies', () => {
    const data = snapshot();
    data.accounts.push({ ...data.accounts[0], id: 'second', currency: 'AUD' });
    data.transactions[2] = { ...data.transactions[2], accountId: 'second', amount: { amount: -22450, currency: 'AUD' } };
    expect(recurringPayments(data)).toHaveLength(2);
    data.transactions[2].amount.currency = 'NZD';
    expect(() => recurringPayments(data)).toThrow(/currency/);
    expect(() => matchInvoices(DEMO_CHECKED_INVOICES, data)).toThrow(/currency/);
  });
  it('deduplicates identical transaction ids and refuses conflicting or duplicate account data', () => {
    const data = snapshot();
    data.transactions.push(structuredClone(data.transactions[0]));
    expect(recurringPayments(data)[0].observations).toHaveLength(3);
    data.transactions.at(-1)!.amount.amount = -1;
    expect(() => recurringPayments(data)).toThrow(/Conflicting/);
    const accounts = snapshot(); accounts.accounts.push({ ...accounts.accounts[0] });
    expect(() => recurringPayments(accounts)).toThrow(/Duplicate account/);
  });
  it('keeps uncertain patterns uncertain and clamps projections at month end', () => {
    const data = snapshot();
    data.transactions = data.transactions.slice(0, 3).map((row, i) => ({ ...row, date: ['2023-11-30', '2023-12-31', '2024-01-31'][i] }));
    data.asOf = '2024-02-01';
    expect(recurringPayments(data)[0].expectedOn).toBe('2024-02-29');
    data.transactions[1].date = '2023-12-04';
    expect(recurringPayments(data)[0]).toMatchObject({ cadence: 'uncertain', expectedOn: null, increase: null });
  });
  it('totals only unpaid checked payable due dates, with currencies kept separate', () => {
    const base = DEMO_CHECKED_INVOICES[0];
    const values = [
      base, { ...base, id: 'aud', amount: { amount: 500, currency: 'AUD' as const } },
      { ...base, id: 'paid', paidConfirmed: true }, { ...base, id: 'unknown', dueOn: null },
      { ...base, id: 'future', dueOn: '2027-01-01' }, { ...base, id: 'receivable', direction: 'receivable' as const },
      { ...base, id: 'past', issuedOn: '2026-09-01', dueOn: '2026-09-20' },
    ];
    const result = billCalendar(values, '2026-09-21');
    expect(result.due.map(row => row.id)).toEqual([base.id, 'aud']);
    expect(result.totals).toEqual([{ amount: 22450, currency: 'NZD' }, { amount: 500, currency: 'AUD' }]);
  });
  it('treats exact invoice matches as suggestions, never confirmed payments', () => {
    const data = snapshot(), row = data.transactions[2];
    const invoice = { ...DEMO_CHECKED_INVOICES[0], invoiceReference: row.reference!, issuedOn: '2026-09-01', dueOn: null };
    expect(matchInvoices([invoice], data)[0].status).toBe('possible-match');
    expect(invoice.paidConfirmed).toBe(false);
    data.transactions.push({ ...row, id: 'another' });
    expect(matchInvoices([invoice], data)[0].status).toBe('ambiguous');
    expect(matchInvoices([{ ...invoice, direction: 'receivable' }], data)[0].status).toBe('needs-review');
    expect(matchInvoices([{ ...invoice, invoiceReference: 'different' }], data)[0].status).toBe('needs-review');
    expect(matchInvoices([{ ...invoice, issuedOn: '2026-09-06' }], data)[0].status).toBe('needs-review');
  });
  it('validates calendar dates and precise cents', () => {
    expect(calendarDate.safeParse('2026-02-29').success).toBe(false);
    expect(calendarDate.safeParse('2024-02-29').success).toBe(true);
    expect(parseCents('-0.01')).toBe(-1);
    expect(parseCents('89.1')).toBe(8910);
    for (const value of ['1.001', '1e2', 'NaN', '1,000', '100.00x', '']) expect(() => parseCents(value)).toThrow();
    expect(checkedInvoice.safeParse({ ...DEMO_CHECKED_INVOICES[0], dueOn: '2026-09-01' }).success).toBe(false);
  });
});

describe('local CSV intake', () => {
  it('handles BOM, NZ dates and quoted commas without sending or guessing', () => {
    const csv = '\uFEFFDate,Description,Amount,Currency,Reference\r\n10/09/2026,"Example, ""Power""",-79.01,NZD,INV-01\r\n';
    const result = financialCsv(csv, '2026-09-21', observedAt);
    expect(result).toMatchObject({ mode: 'csv', complete: false });
    expect(result.transactions[0]).toMatchObject({ date: '2026-09-10', description: 'Example, "Power"', amount: { amount: -7901, currency: 'NZD' }, reference: 'INV-01' });
    expect(result.accounts[0].balance).toBeNull();
  });
  it('finds a candidate from the example without creating any invoice dates', () => {
    const result = financialCsv(FINANCIAL_CSV_EXAMPLE, '2026-09-21', observedAt);
    expect(recurringPayments(result)).toHaveLength(1);
    expect(recurringPayments(result)[0].increase?.extraAmount).toBe(1000);
  });
  it.each([
    '2026-02-30,Power,-79,NZD',
    '2026-10-01,Power,-79,NZD',
    '2026-09-01,Power,-79,AUD',
    '2026-09-01,Power,-79.001,NZD',
    '2026-09-01,Power,NaN,NZD',
    '2026-09-01,Power,1e2,NZD',
    '2026-09-01,Power,-7"9",NZD',
    '2026-09-01,Power,-79,NZD,extra',
    '2026-09-01,,-79,NZD',
  ])('rejects the entire file when any row is unsafe: %s', row => {
    expect(() => financialCsv('Date,Description,Amount,Currency\n2026-08-01,Power,-79,NZD\n' + row, '2026-09-21', observedAt)).toThrow();
  });
  it('refuses multiline quotes, duplicate headers, unknown formats and excessive input', () => {
    for (const input of ['Date,Description,Amount\n2026-09-01,"split\nline",-79', 'Date,Amount,Amount\n2026-09-01,-79,-79', 'Date,Debit,Narrative\n2026-09-01,79,Power', 'x'.repeat(FINANCIAL_CSV_LIMIT + 1), 'Date,Description,Amount\n' + '2026-09-01,Power,-79\n'.repeat(2001)]) {
      expect(() => financialCsv(input, '2026-09-21', observedAt)).toThrow();
    }
  });
});

describe('prepared enquiries and evidence', () => {
  it('binds review to exact text and invalidates it after any edit', async () => {
    const candidate = recurringPayments(snapshot()).find(row => row.increase)!;
    const draft = await prepareFinancialDraft(candidate, 'query-charge', true, observedAt);
    expect(draft).toMatchObject({ status: 'draft', mode: 'demo', review: null, externalAction: 'not-executed' });
    expect(draft.evidence.sources).toHaveLength(3);
    expect(draft.evidence.sources[0].contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(draft.text).toContain('Please do not change, cancel, renew or switch');
    const reviewed = await reviewFinancialDraft(draft, 'Example Reviewer', observedAt);
    expect(reviewed.review?.textHash).toBe(await financialHash(draft.text));
    expect(editFinancialDraft(reviewed, reviewed.text + '\nQuestion')).toMatchObject({ status: 'draft', review: null });
    const receipt = financialReceipt(reviewed);
    expect(receipt.steps.map(step => step.stage)).toEqual(['saw', 'decided', 'prepared', 'asked', 'did', 'evidence']);
    expect(receipt.steps.find(step => step.stage === 'did')?.detail).toContain('No external action');
    expect(receipt.receiptBoundary).toContain('not a signed server audit');
  });
  it('prepares renewal questions and refuses empty reviews', async () => {
    const draft = await prepareFinancialDraft(DEMO_CHECKED_INVOICES[2], 'review-renewal', true);
    expect(draft.text).toContain('cancellation conditions');
    expect(draft.evidence.why).toContain('has not been accepted');
    await expect(reviewFinancialDraft(draft, '  ')).rejects.toThrow();
    await expect(reviewFinancialDraft(editFinancialDraft(draft, ''), 'Reviewer')).rejects.toThrow();
  });
});
