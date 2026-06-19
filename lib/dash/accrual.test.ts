import { describe, expect, it, vi } from 'vitest';
import { accruePublisherImpression } from './accrual';

/** Minimal chainable Supabase stub for the ledger table. */
function stubService(opts: { existing?: { id: string } | null; insertError?: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue({ error: opts.insertError ?? null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: opts.existing ?? null, error: null });
  const builder = {
    select: () => builder,
    eq: () => builder,
    limit: () => builder,
    maybeSingle,
    insert,
  };
  return { service: { from: () => builder } as never, insert };
}

describe('accruePublisherImpression', () => {
  it('credits a fresh impression (revenue × rev-share)', async () => {
    const { service, insert } = stubService({ existing: null });
    const res = await accruePublisherImpression(service, {
      impressionId: 'imp-1',
      publisherId: 'pub-1',
      revenueNzd: 1,
      revShare: 0.55,
    });
    expect(res).toMatchObject({ credited: true, amountNzd: 0.55, reason: 'ok' });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'credit', amount_nzd: 0.55, impression_id: 'imp-1', party_id: 'pub-1' }),
    );
  });

  it('is idempotent — no double-credit when a credit already exists', async () => {
    const { service, insert } = stubService({ existing: { id: 'ledger-1' } });
    const res = await accruePublisherImpression(service, {
      impressionId: 'imp-1',
      publisherId: 'pub-1',
      revenueNzd: 1,
      revShare: 0.55,
    });
    expect(res.reason).toBe('duplicate');
    expect(insert).not.toHaveBeenCalled();
  });

  it('skips zero-value impressions without touching the ledger', async () => {
    const { service, insert } = stubService({ existing: null });
    const res = await accruePublisherImpression(service, {
      impressionId: 'imp-2',
      publisherId: 'pub-1',
      revenueNzd: 0,
      revShare: 0.55,
    });
    expect(res.reason).toBe('zero');
    expect(insert).not.toHaveBeenCalled();
  });
});
