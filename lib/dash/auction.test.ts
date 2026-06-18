import { describe, expect, it } from 'vitest';
import {
  FLOOR_CPM_CENTS,
  isEligible,
  runAuction,
  spentToday,
  type AuctionContext,
  type DashCampaign,
} from './auction';

const TODAY = '2026-06-17';

function campaign(over: Partial<DashCampaign> = {}): DashCampaign {
  return {
    id: 'c1',
    ad_text: 'A quiet line.',
    cta_url: 'https://example.nz/',
    bid_cpm_nzd_cents: 4500,
    daily_budget_nzd_cents: 50000,
    spent_today: 0,
    spent_today_date: TODAY,
    publisher_allowlist: [],
    surface_targeting: [],
    category: null,
    status: 'active',
    ...over,
  };
}

const ctx: AuctionContext = {
  publisherId: 'assembl-hapai',
  surface: 'spinner',
  blocklist: ['gambling', 'alcohol', 'weapons'],
  nzToday: TODAY,
};

describe('eligibility', () => {
  it('accepts a plain active campaign at/above floor', () => {
    expect(isEligible(campaign(), ctx)).toBe(true);
  });
  it('rejects non-active', () => {
    expect(isEligible(campaign({ status: 'paused' }), ctx)).toBe(false);
  });
  it('rejects below floor', () => {
    expect(isEligible(campaign({ bid_cpm_nzd_cents: FLOOR_CPM_CENTS - 1 }), ctx)).toBe(false);
  });
  it('rejects when daily budget is exhausted today', () => {
    expect(isEligible(campaign({ spent_today: 50000 }), ctx)).toBe(false);
  });
  it('ignores spend from a previous NZ day (rollover)', () => {
    const c = campaign({ spent_today: 50000, spent_today_date: '2026-06-16' });
    expect(spentToday(c, TODAY)).toBe(0);
    expect(isEligible(c, ctx)).toBe(true);
  });
  it('honours a non-empty publisher allowlist', () => {
    expect(isEligible(campaign({ publisher_allowlist: ['xero-app'] }), ctx)).toBe(false);
    expect(isEligible(campaign({ publisher_allowlist: ['assembl-hapai'] }), ctx)).toBe(true);
  });
  it('honours surface targeting', () => {
    expect(isEligible(campaign({ surface_targeting: ['report'] }), ctx)).toBe(false);
    expect(isEligible(campaign({ surface_targeting: ['spinner'] }), ctx)).toBe(true);
  });
  it('enforces the publisher brand-safety blocklist by category', () => {
    expect(isEligible(campaign({ category: 'gambling' }), ctx)).toBe(false);
    expect(isEligible(campaign({ category: 'travel' }), ctx)).toBe(true);
  });
});

describe('second-price auction', () => {
  it('returns null on an empty field', () => {
    expect(runAuction([], ctx)).toBeNull();
    expect(runAuction([campaign({ status: 'paused' })], ctx)).toBeNull();
  });

  it('single bidder clears at the floor', () => {
    const r = runAuction([campaign({ id: 'solo', bid_cpm_nzd_cents: 6000 })], ctx)!;
    expect(r.winner.id).toBe('solo');
    expect(r.clearingCpmCents).toBe(FLOOR_CPM_CENTS);
  });

  it('highest bidder wins and pays second + 1 cent', () => {
    const r = runAuction(
      [
        campaign({ id: 'high', bid_cpm_nzd_cents: 6000 }),
        campaign({ id: 'mid', bid_cpm_nzd_cents: 4500 }),
        campaign({ id: 'low', bid_cpm_nzd_cents: 3000 }),
      ],
      ctx,
    )!;
    expect(r.winner.id).toBe('high');
    expect(r.clearingCpmCents).toBe(4501); // second (4500) + 1
  });

  it('clearing price is capped at the winner own max bid', () => {
    // Two equal top bids: second+1 would exceed the winner's max, so cap at max.
    const r = runAuction(
      [
        campaign({ id: 'a', bid_cpm_nzd_cents: 4500 }),
        campaign({ id: 'b', bid_cpm_nzd_cents: 4500 }),
      ],
      ctx,
    )!;
    expect(r.clearingCpmCents).toBe(4500);
  });

  it('per-impression charge is the clearing CPM divided by 1000', () => {
    const r = runAuction(
      [
        campaign({ id: 'high', bid_cpm_nzd_cents: 6000 }),
        campaign({ id: 'mid', bid_cpm_nzd_cents: 5000 }),
      ],
      ctx,
    )!;
    expect(r.clearingCpmCents).toBe(5001);
    expect(r.chargedCents).toBe(5); // round(5001/1000)
  });
});
