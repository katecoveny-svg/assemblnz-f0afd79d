/**
 * Beat by assembl — the second-price auction core.
 *
 * Pure, dependency-free, and unit-tested in auction.test.ts. The serve route
 * (app/api/beat/serve) does the I/O — load publisher + campaigns, then call
 * these — so the money logic can be reasoned about in isolation.
 *
 * All money is integer NZ cents. Bids are CPM (cost per 1000 impressions).
 */

/** NZ$25.00 floor CPM, in cents. No impression clears below this. */
export const FLOOR_CPM_CENTS = 2500;
/** The second-price increment: NZ$0.01 per CPM. */
export const INCREMENT_CPM_CENTS = 1;

export interface BeatCampaign {
  id: string;
  ad_text: string;
  cta_url: string;
  bid_cpm_nzd_cents: number;
  daily_budget_nzd_cents: number;
  spent_today: number;
  spent_today_date: string | null; // YYYY-MM-DD (NZ day) the spend belongs to
  publisher_allowlist: string[];
  surface_targeting: string[];
  category: string | null;
  status: string;
}

export interface AuctionContext {
  publisherId: string;
  surface: string;
  /** The publisher's brand-safety blocklist (advertiser categories to exclude). */
  blocklist: string[];
  /** Today's NZ date as YYYY-MM-DD, for budget rollover. */
  nzToday: string;
}

/**
 * Effective spend for a campaign on the NZ day `nzToday`. A campaign whose
 * recorded spend belongs to a previous day has effectively spent 0 today.
 */
export function spentToday(c: BeatCampaign, nzToday: string): number {
  return c.spent_today_date === nzToday ? c.spent_today : 0;
}

/** Is this campaign eligible to bid for this impression? */
export function isEligible(c: BeatCampaign, ctx: AuctionContext): boolean {
  if (c.status !== 'active') return false;
  if (c.bid_cpm_nzd_cents < FLOOR_CPM_CENTS) return false;

  // Budget: must have room left today for at least the floor's per-impression cost.
  const remaining = c.daily_budget_nzd_cents - spentToday(c, ctx.nzToday);
  if (remaining <= 0) return false;

  // Publisher allowlist: empty = all publishers.
  if (c.publisher_allowlist.length > 0 && !c.publisher_allowlist.includes(ctx.publisherId)) {
    return false;
  }
  // Surface targeting: empty = all surfaces.
  if (c.surface_targeting.length > 0 && !c.surface_targeting.includes(ctx.surface)) {
    return false;
  }
  // Brand safety: publisher can blocklist advertiser categories.
  if (c.category && ctx.blocklist.includes(c.category)) return false;

  return true;
}

export interface AuctionResult {
  winner: BeatCampaign;
  /** Clearing CPM in cents (second price + increment, floored, capped at own bid). */
  clearingCpmCents: number;
  /** What THIS single impression costs, in NZ cents (clearing CPM / 1000). */
  chargedCents: number;
}

/**
 * Run a second-price auction over already-filtered candidates.
 *
 * Winner = highest bid. It pays the second-highest bid + the increment, never
 * below the floor and never above its own max bid. With a single bidder, there
 * is no second price, so it clears at the floor.
 *
 * Returns null when no candidate is eligible (empty auction → caller fails open).
 *
 * chargedCents is the per-impression price (clearing CPM ÷ 1000), rounded to the
 * nearest cent. At the network's NZ$45 CPM target that is ~5c per impression;
 * exact sub-cent accounting is a Phase-1 ledger concern, not a Phase-0 one.
 */
export function runAuction(campaigns: BeatCampaign[], ctx: AuctionContext): AuctionResult | null {
  const eligible = campaigns
    .filter((c) => isEligible(c, ctx))
    .sort((a, b) => b.bid_cpm_nzd_cents - a.bid_cpm_nzd_cents);

  if (eligible.length === 0) return null;

  const winner = eligible[0]!;
  const secondBid = eligible[1]?.bid_cpm_nzd_cents ?? 0;
  const clearingCpmCents = Math.min(
    winner.bid_cpm_nzd_cents,
    Math.max(FLOOR_CPM_CENTS, secondBid + INCREMENT_CPM_CENTS),
  );
  const chargedCents = Math.round(clearingCpmCents / 1000);

  return { winner, clearingCpmCents, chargedCents };
}

/** Today's date in the Pacific/Auckland timezone, as YYYY-MM-DD. */
export function nzTodayString(now: Date = new Date()): string {
  // en-CA gives ISO-style YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
