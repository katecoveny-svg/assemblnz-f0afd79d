import { checkedInvoice, financialSnapshot, type FinancialTransaction } from './model';

const observedAt = '2026-09-21T00:00:00.000Z';
const transactions: FinancialTransaction[] = [
  ['electricity', 'Example Power', 18000, 18000, 22450, '05'],
  ['broadband', 'Example Fibre', 7900, 7900, 8900, '12'],
  ['mobile', 'Example Mobile', 3900, 3900, 3900, '18'],
].flatMap(([key, merchant, july, august, september, day]) => [july, august, september].map((amount, index) => ({
  id: 'fixture-' + key + '-' + index, accountId: 'demo-account', date: '2026-0' + (index + 7) + '-' + day,
  description: String(merchant), merchant: String(merchant), reference: String(key).toUpperCase() + '-' + (index + 7),
  amount: { amount: -Number(amount), currency: 'NZD' as const }, status: 'posted' as const, transfer: false,
  source: { kind: 'fixture' as const, reference: 'Fictional transaction ' + key + '-' + index, observedAt },
})));
export const DEMO_FINANCIAL_SNAPSHOT = financialSnapshot.parse({
  mode: 'demo', asOf: '2026-09-21', fetchedAt: observedAt, complete: false,
  accounts: [{ id: 'demo-account', name: 'Example household', currency: 'NZD', balance: null, balanceObservedAt: null, balanceFreshness: 'unavailable' }],
  transactions, notices: ['Fictional household as at 21 September 2026. No bank, email or provider account is connected.'],
});
export const DEMO_CHECKED_INVOICES = [
  { id: 'demo-power', payee: 'Example Power', invoiceReference: 'POWER-OCT', amount: { amount: 22450, currency: 'NZD' }, issuedOn: '2026-09-20', dueOn: '2026-10-05', renewalOn: null },
  { id: 'demo-fibre', payee: 'Example Fibre', invoiceReference: 'FIBRE-OCT', amount: { amount: 8900, currency: 'NZD' }, issuedOn: '2026-09-20', dueOn: '2026-10-12', renewalOn: null },
  { id: 'demo-insurance', payee: 'Example Cover', invoiceReference: 'COVER-RENEWAL', amount: { amount: 42000, currency: 'NZD' }, issuedOn: '2026-09-15', dueOn: '2026-09-30', renewalOn: '2026-09-30' },
].map(value => checkedInvoice.parse({ ...value, direction: 'payable', paidConfirmed: false, checkedAt: observedAt, sourceLabel: 'Fictional invoice ' + value.invoiceReference, demo: true }));
