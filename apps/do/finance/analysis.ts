import {
  addDays, calendarDate, checkedInvoice, dateDistance, financialSnapshot,
  type CheckedInvoice, type FinancialSnapshot, type FinancialTransaction, type Money,
} from './model';

export type RecurringPayment = {
  id: string; merchant: string; accountId: string; amount: Money;
  cadence: 'weekly' | 'fortnightly' | 'monthly' | 'uncertain';
  lastPaidOn: string; expectedOn: string | null;
  observations: FinancialTransaction[];
  increase: { previousAmount: number; extraAmount: number; percent: number } | null;
};
export const merchantIdentity = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase('en-NZ').replace(/\s+/g, ' ');
function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}
function nextMonth(value: string) {
  const date = new Date(value + 'T00:00:00Z');
  const day = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + 1);
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, end));
  return date.toISOString().slice(0, 10);
}
export function uniqueTransactions(input: FinancialSnapshot): FinancialTransaction[] {
  const snapshot = financialSnapshot.parse(input);
  const accounts = new Map(snapshot.accounts.map(account => [account.id, account]));
  if (accounts.size !== snapshot.accounts.length) throw new Error('Duplicate account records need review.');
  for (const account of accounts.values()) {
    if (account.balance && account.balance.currency !== account.currency) throw new Error('Balance currency does not match its account.');
  }
  const seen = new Map<string, FinancialTransaction>();
  for (const transaction of snapshot.transactions) {
    const account = accounts.get(transaction.accountId);
    if (!account || account.currency !== transaction.amount.currency) throw new Error('Transaction account or currency does not match.');
    const key = JSON.stringify([transaction.accountId, transaction.id]);
    const prior = seen.get(key);
    if (prior && JSON.stringify(prior) !== JSON.stringify(transaction)) throw new Error('Conflicting transaction rows need review before analysis.');
    seen.set(key, transaction);
  }
  return [...seen.values()];
}
/** Suggestions, never bills or due dates. Keep accounts/currencies separate; never merge similar merchants. */
export function recurringPayments(input: FinancialSnapshot): RecurringPayment[] {
  const snapshot = financialSnapshot.parse(input);
  const accounts = new Map(snapshot.accounts.map(account => [account.id, account]));
  const groups = new Map<string, FinancialTransaction[]>();
  for (const row of uniqueTransactions(snapshot)) {
    const account = accounts.get(row.accountId);
    if (!account || account.currency !== row.amount.currency) throw new Error('Transaction account or currency does not match.');
    if (row.status !== 'posted' || row.transfer || row.amount.amount >= 0 || row.date > snapshot.asOf) continue;
    const identity = merchantIdentity(row.merchant || row.description);
    if (!identity) continue;
    const key = JSON.stringify([row.accountId, row.amount.currency, identity]);
    groups.set(key, [...(groups.get(key) || []), row]);
  }
  return [...groups.entries()].flatMap<RecurringPayment>(([id, rows]) => {
    if (rows.length < 3) return [];
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const gaps = sorted.slice(1).map((row, index) => dateDistance(sorted[index].date, row.date));
    const every = (min: number, max: number) => gaps.every(gap => gap >= min && gap <= max);
    const cadence = every(6, 8) ? 'weekly' : every(12, 16) ? 'fortnightly' : every(26, 35) ? 'monthly' : 'uncertain';
    const last = sorted[sorted.length - 1];
    const previousAmount = median(sorted.slice(0, -1).map(row => -row.amount.amount));
    const latest = -last.amount.amount;
    const extraAmount = latest - previousAmount;
    const expectedOn = cadence === 'monthly' ? nextMonth(last.date) : cadence === 'weekly' ? addDays(last.date, 7) : cadence === 'fortnightly' ? addDays(last.date, 14) : null;
    return [{
      id, merchant: last.merchant || last.description, accountId: last.accountId,
      amount: { amount: latest, currency: last.amount.currency }, cadence, lastPaidOn: last.date, expectedOn,
      observations: sorted,
      increase: cadence !== 'uncertain' && previousAmount > 0 && extraAmount >= 100 && extraAmount / previousAmount >= 0.05
        ? { previousAmount, extraAmount, percent: Math.round(extraAmount / previousAmount * 100) } : null,
    }];
  }).sort((a, b) => a.merchant.localeCompare(b.merchant));
}
export type InvoiceMatch = { invoiceId: string; transactionIds: string[]; status: 'needs-review' | 'possible-match' | 'ambiguous'; };
/** A matching amount/reference is evidence for review; it never marks an invoice paid. */
export function matchInvoices(invoices: CheckedInvoice[], snapshot: FinancialSnapshot): InvoiceMatch[] {
  const transactions = uniqueTransactions(snapshot);
  return invoices.map(raw => {
    const invoice = checkedInvoice.parse(raw);
    const reference = invoice.invoiceReference.trim().toLocaleLowerCase('en-NZ');
    const matches = transactions.filter(row =>
      row.status === 'posted' && !row.transfer && row.date >= invoice.issuedOn && row.date <= snapshot.asOf &&
      row.amount.currency === invoice.amount.currency &&
      row.amount.amount === invoice.amount.amount * (invoice.direction === 'payable' ? -1 : 1) &&
      row.reference?.trim().toLocaleLowerCase('en-NZ') === reference);
    return { invoiceId: invoice.id, transactionIds: matches.map(row => row.id), status: matches.length > 1 ? 'ambiguous' : matches.length === 1 ? 'possible-match' : 'needs-review' };
  });
}
export function billCalendar(invoices: CheckedInvoice[], asOf: string) {
  calendarDate.parse(asOf);
  const end = addDays(asOf, 30);
  const due = invoices.map(value => checkedInvoice.parse(value))
    .filter(value => value.direction === 'payable' && !value.paidConfirmed && value.dueOn && value.dueOn >= asOf && value.dueOn <= end)
    .sort((a, b) => a.dueOn!.localeCompare(b.dueOn!));
  const totals = new Map<Money['currency'], number>();
  for (const bill of due) totals.set(bill.amount.currency, (totals.get(bill.amount.currency) || 0) + bill.amount.amount);
  return { due, totals: [...totals].map(([currency, amount]) => ({ currency, amount })), end };
}
