import { describe, it, expect } from 'vitest';
import {
  TIER_RANK,
  SELF_SERVE_TIERS,
  isPaidTier,
  isTier,
  priceIdForTier,
  tierForPriceId,
  tierSatisfies,
} from '../tiers';

describe('self-serve tier config', () => {
  it('locks the confirmed NZD prices', () => {
    const solo = SELF_SERVE_TIERS.find((t) => t.id === 'solo');
    const team = SELF_SERVE_TIERS.find((t) => t.id === 'team');
    expect(solo?.monthlyNzd).toBe(49);
    expect(team?.monthlyNzd).toBe(149);
    expect(solo?.seats).toBe(1);
    expect(team?.seats).toBe(5);
  });

  it('excludes the done-for-you pilot + human review on every tier', () => {
    for (const tier of SELF_SERVE_TIERS) {
      expect(tier.excludes.join(' ').toLowerCase()).toContain('pilot');
      expect(tier.excludes.join(' ').toLowerCase()).toContain('review');
    }
  });
});

describe('tierSatisfies (the gate comparison)', () => {
  it('free never satisfies a paid requirement', () => {
    expect(tierSatisfies('free', 'solo')).toBe(false);
    expect(tierSatisfies('free', 'team')).toBe(false);
    expect(tierSatisfies('free', 'free')).toBe(true);
  });

  it('solo satisfies solo but not team', () => {
    expect(tierSatisfies('solo', 'solo')).toBe(true);
    expect(tierSatisfies('solo', 'team')).toBe(false);
    expect(tierSatisfies('solo', 'free')).toBe(true);
  });

  it('team satisfies everything', () => {
    expect(tierSatisfies('team', 'free')).toBe(true);
    expect(tierSatisfies('team', 'solo')).toBe(true);
    expect(tierSatisfies('team', 'team')).toBe(true);
  });

  it('ranks free < solo < team', () => {
    expect(TIER_RANK.free).toBeLessThan(TIER_RANK.solo);
    expect(TIER_RANK.solo).toBeLessThan(TIER_RANK.team);
  });
});

describe('price id <-> tier mapping', () => {
  const env = { STRIPE_PRICE_SOLO: 'price_solo_x', STRIPE_PRICE_TEAM: 'price_team_y' };

  it('maps tier to its configured price id', () => {
    expect(priceIdForTier('solo', env)).toBe('price_solo_x');
    expect(priceIdForTier('team', env)).toBe('price_team_y');
  });

  it('returns null when a price env var is unset (fail closed)', () => {
    expect(priceIdForTier('solo', {})).toBeNull();
  });

  it('reverse-maps a known price id to its tier', () => {
    expect(tierForPriceId('price_solo_x', env)).toBe('solo');
    expect(tierForPriceId('price_team_y', env)).toBe('team');
  });

  it('returns null for unknown / legacy price ids', () => {
    expect(tierForPriceId('price_kete_pack_legacy', env)).toBeNull();
    expect(tierForPriceId(null, env)).toBeNull();
    expect(tierForPriceId(undefined, env)).toBeNull();
  });
});

describe('tier guards', () => {
  it('isPaidTier only accepts solo/team', () => {
    expect(isPaidTier('solo')).toBe(true);
    expect(isPaidTier('team')).toBe(true);
    expect(isPaidTier('free')).toBe(false);
    expect(isPaidTier('enterprise')).toBe(false);
  });

  it('isTier accepts free/solo/team only', () => {
    expect(isTier('free')).toBe(true);
    expect(isTier('solo')).toBe(true);
    expect(isTier('team')).toBe(true);
    expect(isTier('bogus')).toBe(false);
  });
});
