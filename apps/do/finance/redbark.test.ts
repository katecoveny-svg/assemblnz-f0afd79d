import { describe, expect, it, vi } from 'vitest';
import { readRedbarkSnapshot, REDBARK_API_VERSION } from './redbark';
import type { FinancialReadGrant } from './model';

const now = new Date('2026-09-21T00:00:00.000Z');
const grant: FinancialReadGrant = { ownerId: 'owner-a', consumer: 'bills', accountIds: ['acct_123'], scopes: ['data:read'], expiresAt: '2026-09-22T00:00:00.000Z', revokedAt: null };
const input = () => ({ ownerId: 'owner-a', consumer: 'bills' as const, grant: structuredClone(grant), credential: 'private-test-token', from: '2026-07-01', to: '2026-09-21', now });
const account = { id: 'acct_123', category: 'banking', name: 'Example account', currency: 'nzd', status: 'available' };
const transaction = { id: 'txn_123', account: 'acct_123', date: '2026-09-01', description: 'Example power', merchant_name: null, reference: 'REF', amount: { amount: -18000, currency: 'nzd' }, status: 'posted', direction: 'debit', provider_category: null };
const balance = { account: 'acct_123', current: { amount: 10000, currency: 'nzd' }, available: null, observed_at: null, freshness: null };
const page = (data: unknown[], next_page_url: string | null = null) => ({ object: 'list', data, next_page_url });
function mockRead(options: { accounts?: unknown; balances?: unknown; transactions?: unknown; headers?: HeadersInit } = {}) {
  return vi.fn<typeof fetch>(async url => {
    const path = new URL(String(url)).pathname;
    const body = path.endsWith('/accounts') ? options.accounts || page([account])
      : path.endsWith('/balances') ? options.balances || page([balance])
      : options.transactions || page([transaction]);
    return Response.json(body, { headers: options.headers });
  });
}

describe('Redbark read adapter', () => {
  it('normalises integer money with read-only, uncached, fixed-origin requests', async () => {
    const fetcher = mockRead(), result = await readRedbarkSnapshot(input(), fetcher);
    expect(result).toMatchObject({ mode: 'connected', complete: true });
    expect(result.transactions[0]).toMatchObject({ amount: { amount: -18000, currency: 'NZD' }, accountId: 'acct_123' });
    expect(result.accounts[0]).toMatchObject({ balanceFreshness: 'unknown', balanceObservedAt: null });
    expect(result.notices.join(' ')).toContain('Do not treat them as confirmed available funds');
    expect(JSON.stringify(result)).not.toContain('private-test-token');
    expect(fetcher).toHaveBeenCalledTimes(3);
    for (const [url, options] of fetcher.mock.calls) {
      expect(new URL(String(url)).origin).toBe('https://api.redbark.com');
      expect(options).toMatchObject({ method: 'GET', cache: 'no-store', redirect: 'error', headers: { Authorization: 'Bearer private-test-token', 'Redbark-Version': REDBARK_API_VERSION } });
      expect(options?.body).toBeUndefined();
    }
    expect(String(fetcher.mock.calls[2][0])).toContain('account=acct_123');
    expect(String(fetcher.mock.calls[2][0])).toContain('include_pending=false');
  });
  it.each([
    { ownerId: 'someone-else' }, { consumer: 'tradie' },
    { revokedAt: '2026-09-20T00:00:00.000Z' },
    { expiresAt: '2026-09-21T00:00:00.000Z' },
    { accountIds: [] }, { accountIds: ['acct_123', 'acct_123'] },
    { scopes: ['data:read', 'connections:write'] },
  ])('refuses mismatched, expired, revoked or wider permission before fetching: %j', async patch => {
    const request = input(); Object.assign(request.grant, patch);
    const fetcher = mockRead();
    await expect(readRedbarkSnapshot(request, fetcher)).rejects.toMatchObject({ code: 'permission' });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('refuses future and oversized windows or malformed credentials before fetching', async () => {
    for (const patch of [{ to: '2026-09-22' }, { from: '2026-01-01' }, { from: '2026-09-22' }, { credential: 'secret\nheader' }]) {
      const fetcher = mockRead();
      await expect(readRedbarkSnapshot({ ...input(), ...patch }, fetcher)).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    }
  });
  it.each(['https://foreign.example/v2/accounts', 'https://api.redbark.com/v2/syncs', 'https://user:pass@api.redbark.com/v2/accounts', 'https://api.redbark.com/v2/accounts#fragment'])('rejects unsafe pagination without sending credentials: %s', async next => {
    const fetcher = mockRead({ accounts: page([account], next) });
    await expect(readRedbarkSnapshot(input(), fetcher)).rejects.toMatchObject({ code: 'pagination' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('accepts valid same-path pagination, while refusing repeated pages', async () => {
    let count = 0;
    const next = 'https://api.redbark.com/v2/accounts?page_token=next';
    const fetcher = mockRead();
    fetcher.mockImplementation(async url => {
      const path = new URL(String(url)).pathname;
      if (path.endsWith('/accounts')) return Response.json(++count === 1 ? page([], next) : page([account]));
      return Response.json(path.endsWith('/balances') ? page([balance]) : page([transaction]));
    });
    expect((await readRedbarkSnapshot(input(), fetcher)).transactions).toHaveLength(1);
    const cycle = mockRead({ accounts: page([account], 'https://api.redbark.com/v2/accounts?limit=100') });
    await expect(readRedbarkSnapshot(input(), cycle)).rejects.toMatchObject({ code: 'pagination' });
  });
  it('keeps page limits and upstream truncation visible', async () => {
    const fetcher = mockRead({ headers: { 'X-Redbark-Truncated': 'true' } });
    const result = await readRedbarkSnapshot(input(), fetcher);
    expect(result.complete).toBe(false);
    expect(result.notices.join(' ')).toContain('truncated');
    let count = 0;
    const many = mockRead();
    many.mockImplementation(async url => {
      const path = new URL(String(url)).pathname;
      if (path.endsWith('/accounts')) return Response.json(page([account]));
      if (path.endsWith('/balances')) return Response.json(page([balance]));
      count++;
      return Response.json(page([{ ...transaction, id: 'txn_' + count }], 'https://api.redbark.com/v2/transactions?page_token=' + count));
    });
    const capped = await readRedbarkSnapshot(input(), many);
    expect(count).toBe(10);
    expect(capped.complete).toBe(false);
  });
  it.each([
    { account: 'acct_other' }, { amount: { amount: -18000, currency: 'aud' } },
    { date: '2026-06-30' }, { direction: 'credit' },
    { amount: { amount: -180.5, currency: 'nzd' } },
  ])('refuses mismatched financial rows without returning a partial result: %j', async patch => {
    const fetcher = mockRead({ transactions: page([transaction, { ...transaction, ...patch }]) });
    await expect(readRedbarkSnapshot(input(), fetcher)).rejects.toMatchObject({ code: 'schema' });
  });
  it('enforces banking-account and balance identity and currency', async () => {
    for (const accounts of [page([{ ...account, category: 'brokerage' }]), page([{ ...account, status: 'unavailable' }]), page([account, account])]) {
      await expect(readRedbarkSnapshot(input(), mockRead({ accounts }))).rejects.toThrow();
    }
    for (const balances of [page([{ ...balance, account: 'acct_other' }]), page([balance, balance]), page([{ ...balance, current: { amount: 100, currency: 'aud' } }])]) {
      await expect(readRedbarkSnapshot(input(), mockRead({ balances }))).rejects.toMatchObject({ code: 'schema' });
    }
  });
  it('does not present unavailable balances as funds', async () => {
    const result = await readRedbarkSnapshot(input(), mockRead({ balances: page([{ ...balance, freshness: 'unavailable' }]) }));
    expect(result.accounts[0]).toMatchObject({ balance: null, balanceFreshness: 'unavailable' });
    const stale = await readRedbarkSnapshot(input(), mockRead({ balances: page([{ ...balance, freshness: 'stale', observed_at: '2026-09-20T10:00:00+12:00' }]) }));
    expect(stale.accounts[0]).toMatchObject({ balanceFreshness: 'stale', balanceObservedAt: '2026-09-19T22:00:00.000Z' });
  });
  it('limits response size and does not expose provider or token error details', async () => {
    const oversized = vi.fn<typeof fetch>(async () => new Response('x'.repeat(1_000_001)));
    await expect(readRedbarkSnapshot(input(), oversized)).rejects.toMatchObject({ code: 'schema' });
    const failure = vi.fn<typeof fetch>(async () => { throw new Error('private-test-token and financial details'); });
    await expect(readRedbarkSnapshot(input(), failure)).rejects.toThrow('No partial result was used');
    const denied = vi.fn<typeof fetch>(async () => new Response('secret provider error', { status: 401 }));
    await expect(readRedbarkSnapshot(input(), denied)).rejects.toMatchObject({ code: 'provider' });
  });
});
