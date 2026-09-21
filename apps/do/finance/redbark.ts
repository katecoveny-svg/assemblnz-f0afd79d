import 'server-only';
import { z } from 'zod';
import {
  calendarDate, dateDistance, financialCurrency, financialSnapshot, money,
  FINANCIAL_CONSUMERS, type FinancialConsumer, type FinancialReadGrant, type FinancialSnapshot,
} from './model';

/** Verified from Redbark's public OpenAPI. Activation still needs a per-user credential resolver. */
export const REDBARK_API_VERSION = '2026-10-01.wattle';
export const REDBARK_MCP_URL = 'https://mcp.redbark.com/mcp';
const BASE = 'https://api.redbark.com/v2';
const currency = z.string().transform(value => financialCurrency.parse(value.toUpperCase()));
const providerMoney = z.object({ amount: money.shape.amount, currency });
const account = z.object({
  id: z.string().regex(/^acct_[a-zA-Z0-9]{1,22}$/),
  category: z.enum(['banking', 'brokerage']), name: z.string().min(1).max(240),
  currency, status: z.string(),
});
const transaction = z.object({
  id: z.string().min(1).max(240), account: z.string(), date: calendarDate,
  description: z.string().max(1000), merchant_name: z.string().max(240).nullable(),
  reference: z.string().max(500).nullable(), amount: providerMoney,
  status: z.enum(['posted', 'pending']), direction: z.enum(['debit', 'credit']),
  provider_category: z.string().nullable(),
});
const balance = z.object({
  account: z.string(), current: providerMoney.nullable(), available: providerMoney.nullable(),
  observed_at: z.string().datetime({ offset: true }).nullable(),
  freshness: z.enum(['fresh', 'stale', 'unavailable']).nullable(),
});
const grantSchema = z.object({
  ownerId: z.string().min(1), consumer: z.enum(FINANCIAL_CONSUMERS),
  accountIds: z.array(z.string().regex(/^acct_[a-zA-Z0-9]{1,22}$/)).min(1).max(24),
  scopes: z.tuple([z.literal('data:read')]),
  expiresAt: z.string().datetime(), revokedAt: z.string().datetime().nullable(),
});
export class FinancialReadError extends Error {
  constructor(public readonly code: 'permission' | 'provider' | 'schema' | 'pagination', message: string) { super(message); }
}
export function assertFinancialGrant(grant: FinancialReadGrant, ownerId: string, consumer: FinancialConsumer, now = new Date()) {
  const parsed = grantSchema.safeParse(grant);
  if (!parsed.success || parsed.data.ownerId !== ownerId || parsed.data.consumer !== consumer ||
      parsed.data.revokedAt || Date.parse(parsed.data.expiresAt) <= now.getTime() ||
      new Set(parsed.data.accountIds).size !== parsed.data.accountIds.length) {
    throw new FinancialReadError('permission', 'A current, owner-bound financial read permission is required.');
  }
  return parsed.data;
}

type ReadInput = {
  /** Comes from authenticated server context, never a posted owner id. */
  ownerId: string; consumer: FinancialConsumer; grant: FinancialReadGrant;
  credential: string; from: string; to: string; now?: Date; signal?: AbortSignal;
};
type Fetch = typeof fetch;
async function responseJson(response: Response) {
  if (!response.body) throw new FinancialReadError('schema', 'The provider returned no data.');
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 1_000_000) { await reader.cancel(); throw new FinancialReadError('schema', 'The provider response exceeded the read limit.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } finally { reader.releaseLock(); }
}

/**
 * No OAuth flow or global/shared banking key. The caller must resolve the authenticated
 * owner's credential and consent before using this adapter. It cannot send, pay, switch,
 * revoke bank consent, configure exports, create syncs or trade.
 */
export async function readRedbarkSnapshot(input: ReadInput, fetcher: Fetch = fetch): Promise<FinancialSnapshot> {
  const now = input.now || new Date();
  const grant = assertFinancialGrant(input.grant, input.ownerId, input.consumer, now);
  const from = calendarDate.parse(input.from), to = calendarDate.parse(input.to);
  if (from > to || to > now.toISOString().slice(0, 10) || dateDistance(from, to) > 120 ||
      !input.credential || input.credential.length > 8192 || /[\r\n]/.test(input.credential)) {
    throw new FinancialReadError('permission', 'Choose a valid read window of at most 120 days.');
  }
  const signal = AbortSignal.any([AbortSignal.timeout(30_000), ...(input.signal ? [input.signal] : [])]);
  let complete = true;
  const notices: string[] = [];
  async function get(url: string, path: string) {
    const parsed = new URL(url);
    if (parsed.origin !== 'https://api.redbark.com' || parsed.pathname !== '/v2/' + path || parsed.username || parsed.password || parsed.hash) {
      throw new FinancialReadError('pagination', 'An unexpected provider pagination address was refused.');
    }
    const response = await fetcher(parsed.toString(), {
      method: 'GET', headers: { Authorization: 'Bearer ' + input.credential, 'Redbark-Version': REDBARK_API_VERSION, Accept: 'application/json' },
      cache: 'no-store', redirect: 'error', signal,
    });
    if (!response.ok) throw new FinancialReadError('provider', 'Redbark could not complete this read. Recheck the connection before retrying.');
    if (response.headers.get('X-Redbark-Truncated') === 'true') complete = false;
    return responseJson(response);
  }
  async function list<T extends z.ZodType>(path: 'accounts' | 'transactions', query: URLSearchParams, schema: T): Promise<z.infer<T>[]> {
    let url: string | null = BASE + '/' + path + '?' + query.toString();
    const seen = new Set<string>(), rows: z.infer<T>[] = [];
    const pageSchema = z.object({ object: z.literal('list'), data: z.array(schema).max(100), next_page_url: z.string().url().nullable() });
    while (url && seen.size < 10) {
      if (seen.has(url)) throw new FinancialReadError('pagination', 'Repeated provider pages were refused.');
      seen.add(url);
      const page = pageSchema.parse(await get(url, path));
      rows.push(...page.data);
      url = page.next_page_url;
    }
    if (url) complete = false;
    return rows;
  }
  try {
    const allAccounts = await list('accounts', new URLSearchParams({ limit: '100' }), account);
    if (new Set(allAccounts.map(row => row.id)).size !== allAccounts.length) throw new FinancialReadError('schema', 'Duplicate account records were refused.');
    const selected = grant.accountIds.map(id => {
      const found = allAccounts.find(row => row.id === id);
      if (!found || found.category !== 'banking' || found.status !== 'available') throw new FinancialReadError('permission', 'A selected banking account is unavailable.');
      return found;
    });
    const balanceQuery = new URLSearchParams();
    selected.forEach(row => balanceQuery.append('account', row.id));
    const balances = z.object({ object: z.literal('list'), data: z.array(balance).max(24) }).parse(await get(BASE + '/balances?' + balanceQuery, 'balances')).data;
    if (balances.some(row => !grant.accountIds.includes(row.account)) || new Set(balances.map(row => row.account)).size !== balances.length) {
      throw new FinancialReadError('schema', 'Unexpected or duplicate account balances were refused.');
    }
    const transactions: FinancialSnapshot['transactions'] = [];
    for (const selectedAccount of selected) {
      const rows = await list('transactions', new URLSearchParams({ account: selectedAccount.id, from, to, include_pending: 'false', limit: '100' }), transaction);
      for (const row of rows) {
        if (row.account !== selectedAccount.id || row.amount.currency !== selectedAccount.currency ||
            row.date < from || row.date > to ||
            (row.direction === 'debit' && row.amount.amount > 0) || (row.direction === 'credit' && row.amount.amount < 0)) {
          throw new FinancialReadError('schema', 'A transaction did not match the authorised account, currency or date window.');
        }
        transactions.push({
          id: row.id, accountId: row.account, date: row.date,
          description: row.description || row.merchant_name || 'Unlabelled transaction',
          merchant: row.merchant_name, reference: row.reference, amount: row.amount, status: row.status,
          transfer: row.provider_category?.toLowerCase().includes('transfer') || false,
          source: { kind: 'redbark', reference: row.id, observedAt: now.toISOString() },
        });
      }
    }
    const accounts = selected.map(row => {
      const b = balances.find(value => value.account === row.id);
      if (b?.current && b.current.currency !== row.currency) throw new FinancialReadError('schema', 'A balance currency did not match its account.');
      return {
        id: row.id, name: row.name, currency: row.currency,
        balance: b?.freshness === 'unavailable' ? null : b?.current || null,
        balanceObservedAt: b?.observed_at ? new Date(b.observed_at).toISOString() : null,
        balanceFreshness: b?.freshness || (b?.current ? 'unknown' : 'unavailable'),
      };
    });
    if (!complete) notices.push('The provider or page limit truncated this read. Findings may be incomplete.');
    if (accounts.some(row => row.balanceFreshness !== 'fresh')) notices.push('Some balances are stale, unavailable or have unknown freshness. Do not treat them as confirmed available funds.');
    return financialSnapshot.parse({ mode: 'connected', asOf: to, fetchedAt: now.toISOString(), accounts, transactions, complete, notices });
  } catch (error) {
    if (error instanceof FinancialReadError) throw error;
    throw new FinancialReadError('schema', 'Financial data could not be read safely. No partial result was used.');
  }
}
