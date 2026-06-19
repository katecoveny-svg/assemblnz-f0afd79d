import { afterEach, describe, expect, it, vi } from 'vitest';

const transfersCreate = vi.fn();
vi.mock('@/lib/stripe/client', () => ({ getStripe: () => ({ transfers: { create: transfersCreate } }) }));

// Chainable Supabase stub driven by per-table fixtures.
let fixtures: {
  accounts: Array<{ publisher_id: string; stripe_account_id: string; payouts_enabled: boolean }>;
  ledger: Record<string, Array<{ direction: 'credit' | 'debit'; amount_nzd: number }>>;
};
const inserted: Array<{ table: string; row: Record<string, unknown> }> = [];

function makeBuilder(table: string) {
  const state: { eqs: Record<string, unknown>; insertRow?: Record<string, unknown> } = { eqs: {} };
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: (col: string, val: unknown) => {
      state.eqs[col] = val;
      return builder;
    },
    insert: (row: Record<string, unknown>) => {
      state.insertRow = row;
      inserted.push({ table, row });
      return builder;
    },
    update: () => builder,
    single: async () => ({ data: { id: `payout-${inserted.length}` }, error: null }),
    then: undefined,
  };
  // Terminal awaits resolve to the right shape per table/operation.
  (builder as { then: unknown }).then = (resolve: (v: unknown) => void) => {
    if (state.insertRow) return resolve({ error: null });
    if (table === 'dash_connect_accounts') return resolve({ data: fixtures.accounts, error: null });
    if (table === 'dash_payout_ledger') {
      const pid = state.eqs.party_id as string;
      return resolve({ data: fixtures.ledger[pid] ?? [], error: null });
    }
    return resolve({ data: [], error: null });
  };
  return builder;
}

vi.mock('@/lib/stripe/supabase-service', () => ({
  createServiceClient: () => ({ from: (table: string) => makeBuilder(table) }),
}));

import { GET } from './route';

function req(url: string, auth = 'secret') {
  return new Request(url, { headers: auth ? { authorization: `Bearer ${auth}` } : {} });
}

afterEach(() => {
  vi.clearAllMocks();
  inserted.length = 0;
});

describe('GET /api/dash/payouts/run', () => {
  it('401s without the cron secret', async () => {
    process.env.CRON_SECRET = 'secret';
    const res = await GET(req('https://x/api/dash/payouts/run', ''));
    expect(res.status).toBe(401);
  });

  it('dryRun reports would-pay without calling Stripe', async () => {
    process.env.CRON_SECRET = 'secret';
    fixtures = {
      accounts: [{ publisher_id: 'pub-1', stripe_account_id: 'acct_1', payouts_enabled: true }],
      ledger: { 'pub-1': [{ direction: 'credit', amount_nzd: 25 }] },
    };
    const res = await GET(req('https://x/api/dash/payouts/run?dryRun=1'));
    const body = await res.json();
    expect(body.dryRun).toBe(true);
    expect(body.attempts[0]).toMatchObject({ publisherId: 'pub-1', balanceNzd: 25, status: 'would-pay' });
    expect(transfersCreate).not.toHaveBeenCalled();
  });

  it('skips a publisher below threshold', async () => {
    process.env.CRON_SECRET = 'secret';
    fixtures = {
      accounts: [{ publisher_id: 'pub-low', stripe_account_id: 'acct_2', payouts_enabled: true }],
      ledger: { 'pub-low': [{ direction: 'credit', amount_nzd: 5 }] },
    };
    const res = await GET(req('https://x/api/dash/payouts/run'));
    const body = await res.json();
    expect(body.paidCount).toBe(0);
    expect(body.attempts[0].status).toBe('skipped');
    expect(transfersCreate).not.toHaveBeenCalled();
  });

  it('pays a clearing balance with an idempotency key', async () => {
    process.env.CRON_SECRET = 'secret';
    transfersCreate.mockResolvedValue({ id: 'tr_123' });
    fixtures = {
      accounts: [{ publisher_id: 'pub-1', stripe_account_id: 'acct_1', payouts_enabled: true }],
      ledger: { 'pub-1': [{ direction: 'credit', amount_nzd: 30 }] },
    };
    const res = await GET(req('https://x/api/dash/payouts/run'));
    const body = await res.json();
    expect(body.paidCount).toBe(1);
    expect(body.paidTotalNzd).toBe(30);
    expect(transfersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 3000, currency: 'nzd', destination: 'acct_1' }),
      expect.objectContaining({ idempotencyKey: expect.any(String) }),
    );
    // a ledger debit was written to zero the balance
    expect(inserted.some((i) => i.table === 'dash_payout_ledger' && i.row.direction === 'debit')).toBe(true);
  });
});
