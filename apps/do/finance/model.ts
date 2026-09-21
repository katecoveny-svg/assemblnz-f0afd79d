import { z } from 'zod';

export const financialCurrency = z.enum(['NZD', 'AUD', 'USD', 'GBP', 'EUR']);
export type FinancialCurrency = z.infer<typeof financialCurrency>;
export const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Choose a real calendar date.');
export const cents = z.number().int().refine(Number.isSafeInteger).refine(value => Math.abs(value) <= 100_000_000_00);
export const money = z.object({ amount: cents, currency: financialCurrency });
export type Money = z.infer<typeof money>;
export const source = z.object({
  kind: z.enum(['fixture', 'csv', 'redbark', 'checked-invoice']),
  reference: z.string().min(1).max(240),
  observedAt: z.string().datetime(),
});
export const financialTransaction = z.object({
  id: z.string().min(1).max(240),
  accountId: z.string().min(1).max(100),
  date: calendarDate,
  description: z.string().min(1).max(1000),
  merchant: z.string().max(240).nullable(),
  reference: z.string().max(500).nullable(),
  amount: money,
  status: z.enum(['posted', 'pending']),
  transfer: z.boolean(),
  source,
});
export type FinancialTransaction = z.infer<typeof financialTransaction>;
export const financialAccount = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(240),
  currency: financialCurrency,
  balance: money.nullable(),
  balanceObservedAt: z.string().datetime().nullable(),
  balanceFreshness: z.enum(['fresh', 'stale', 'unavailable', 'unknown']),
});
export const financialSnapshot = z.object({
  mode: z.enum(['demo', 'csv', 'connected']),
  asOf: calendarDate,
  fetchedAt: z.string().datetime(),
  accounts: z.array(financialAccount).max(24),
  transactions: z.array(financialTransaction).max(24000),
  complete: z.boolean(),
  notices: z.array(z.string().max(500)).max(30),
});
export type FinancialSnapshot = z.infer<typeof financialSnapshot>;
export const checkedInvoice = z.object({
  id: z.string().min(1).max(100),
  payee: z.string().trim().min(1).max(160),
  invoiceReference: z.string().trim().min(1).max(160),
  amount: money.refine(value => value.amount > 0, 'Enter an amount above zero.'),
  direction: z.enum(['payable', 'receivable']),
  issuedOn: calendarDate,
  dueOn: calendarDate.nullable(),
  renewalOn: calendarDate.nullable(),
  paidConfirmed: z.boolean(),
  checkedAt: z.string().datetime(),
  sourceLabel: z.string().trim().min(1).max(240),
  demo: z.boolean(),
}).refine(value => !value.dueOn || value.dueOn >= value.issuedOn, 'Due date must not precede the invoice date.');
export type CheckedInvoice = z.infer<typeof checkedInvoice>;

export const FINANCIAL_CONSUMERS = ['bills', 'money', 'business', 'tradie'] as const;
export type FinancialConsumer = typeof FINANCIAL_CONSUMERS[number];
/** Server-side authority contract. Never create a live grant from browser-supplied owner ids. */
export type FinancialReadGrant = {
  ownerId: string;
  consumer: FinancialConsumer;
  accountIds: readonly string[];
  scopes: readonly ['data:read'];
  expiresAt: string;
  revokedAt: string | null;
};
export const FINANCIAL_CONNECTORS = [{
  id: 'redbark',
  label: 'Redbark',
  status: 'adapter-only' as const,
  authority: 'read' as const,
  consumers: FINANCIAL_CONSUMERS,
  scopes: ['data:read'] as const,
  bankingWrites: false,
  note: 'Read adapter tested against provider schemas. User OAuth, secure token custody and a live pilot are not enabled.',
}] as const;

export function moneyText(value: Money) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: value.currency, currencyDisplay: 'code' }).format(value.amount / 100);
}
export function addDays(value: string, days: number) {
  const date = new Date(calendarDate.parse(value) + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function dateDistance(a: string, b: string) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}
export function parseCents(value: string): number {
  if (!/^-?\d{1,9}(?:\.\d{1,2})?$/.test(value.trim())) throw new Error('Use a number with no more than two decimal places.');
  const negative = value.trim().startsWith('-');
  const [whole, fraction = ''] = value.trim().replace('-', '').split('.');
  return cents.parse((Number(whole) * 100 + Number(fraction.padEnd(2, '0'))) * (negative ? -1 : 1));
}
