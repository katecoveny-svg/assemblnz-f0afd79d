import { describe, expect, it } from 'vitest';
import {
  MOCK_SPONSORS,
  REVENUE_PER_WAIT,
  canSaveOptIn,
  defaultSettings,
  impressionEndpoint,
  nextMessageIndex,
  parseSettings,
  pickSponsor,
  publisherShare,
  serializeSettings,
  settleSplit,
  showsSponsoredLabel,
} from './logic';
import type { ConsumerSettings } from './types';

describe('pickSponsor', () => {
  it('rotates deterministically through the mock NZ brands', () => {
    expect(pickSponsor(0)).toBe(MOCK_SPONSORS[0]);
    expect(pickSponsor(1)).toBe(MOCK_SPONSORS[1]);
    expect(pickSponsor(2)).toBe(MOCK_SPONSORS[2]);
    expect(pickSponsor(3)).toBe(MOCK_SPONSORS[0]); // wraps
  });
  it('handles negative rotations without crashing', () => {
    expect(pickSponsor(-1)).toBe(MOCK_SPONSORS[MOCK_SPONSORS.length - 1]);
  });
  it('every sponsor has text + advertiserId', () => {
    for (const s of MOCK_SPONSORS) {
      expect(s.text.length).toBeGreaterThan(0);
      expect(s.advertiserId.length).toBeGreaterThan(0);
    }
  });
});

describe('nextMessageIndex', () => {
  it('wraps the cycle', () => {
    expect(nextMessageIndex(0, 3)).toBe(1);
    expect(nextMessageIndex(2, 3)).toBe(0);
  });
  it('guards empty / single message lists', () => {
    expect(nextMessageIndex(0, 0)).toBe(0);
    expect(nextMessageIndex(5, 1)).toBe(0);
  });
});

describe('publisherShare + settleSplit', () => {
  it('pays 55% standard and 60% anchor', () => {
    expect(publisherShare('standard')).toBe(0.55);
    expect(publisherShare('anchor')).toBe(0.6);
  });
  it('splits publisher revenue by tier', () => {
    const split = settleSplit('publisher', 100, 'anchor').splitByDestination;
    expect(split.publisher).toBe(60);
    expect(split.assembl).toBe(40);
  });
  it('splits consumer revenue between payee and assembl', () => {
    const { splitByDestination } = settleSplit('consumer', 100);
    expect(splitByDestination.payee).toBe(70);
    expect(splitByDestination.assembl).toBe(30);
  });
  it('produces no per-impression split for whitelabel', () => {
    const res = settleSplit('whitelabel', 0);
    expect(res.totalRevenue).toBe(0);
    expect(res.splitByDestination).toEqual({});
  });
});

describe('parseSettings / serializeSettings', () => {
  const valid: ConsumerSettings = {
    optedIn: true,
    destination: { kind: 'charity', charityId: 'spca-nz' },
    hasConsentedToDisclosure: true,
  };

  it('round-trips valid settings', () => {
    expect(parseSettings(serializeSettings(valid))).toEqual(valid);
  });
  it('returns null for null / garbage / malformed JSON', () => {
    expect(parseSettings(null)).toBeNull();
    expect(parseSettings('not json')).toBeNull();
    expect(parseSettings('{}')).toBeNull();
    expect(parseSettings('{"optedIn":true}')).toBeNull(); // no destination
  });
  it('rejects an unknown charity id', () => {
    expect(
      parseSettings('{"optedIn":true,"destination":{"kind":"charity","charityId":"nope"}}'),
    ).toBeNull();
  });
  it('accepts a valid self destination', () => {
    const parsed = parseSettings(
      '{"optedIn":true,"destination":{"kind":"self","method":"prezzy"},"hasConsentedToDisclosure":true}',
    );
    expect(parsed?.destination).toEqual({ kind: 'self', method: 'prezzy' });
  });
  it('coerces a missing consent flag to false', () => {
    const parsed = parseSettings(
      '{"optedIn":true,"destination":{"kind":"charity","charityId":"spca-nz"}}',
    );
    expect(parsed?.hasConsentedToDisclosure).toBe(false);
  });
});

describe('defaultSettings', () => {
  it('is opted OUT with SPCA NZ as the default destination', () => {
    const d = defaultSettings();
    expect(d.optedIn).toBe(false);
    expect(d.destination).toEqual({ kind: 'charity', charityId: 'spca-nz' });
    expect(d.hasConsentedToDisclosure).toBe(false);
  });
});

describe('canSaveOptIn (Privacy Act IPP 3A gate)', () => {
  it('blocks saving an opt-IN without disclosure consent', () => {
    expect(
      canSaveOptIn({
        optedIn: true,
        destination: { kind: 'charity', charityId: 'spca-nz' },
        hasConsentedToDisclosure: false,
      }),
    ).toBe(false);
  });
  it('allows an opt-IN once disclosure is acknowledged', () => {
    expect(
      canSaveOptIn({
        optedIn: true,
        destination: { kind: 'charity', charityId: 'spca-nz' },
        hasConsentedToDisclosure: true,
      }),
    ).toBe(true);
  });
  it('always allows opting OUT', () => {
    expect(
      canSaveOptIn({
        optedIn: false,
        destination: { kind: 'charity', charityId: 'spca-nz' },
        hasConsentedToDisclosure: false,
      }),
    ).toBe(true);
  });
});

describe('mode helpers', () => {
  it('shows the Sponsored label only in ad modes', () => {
    expect(
      showsSponsoredLabel({
        kind: 'consumer',
        userSettings: defaultSettings(),
      }),
    ).toBe(true);
    expect(showsSponsoredLabel({ kind: 'publisher', publisherId: 'x', revShareTier: 'standard' })).toBe(
      true,
    );
    expect(
      showsSponsoredLabel({ kind: 'whitelabel', brandConfig: { internalMessages: [] } }),
    ).toBe(false);
  });
  it('routes whitelabel impressions to the whitelabel endpoint', () => {
    expect(
      impressionEndpoint({ kind: 'whitelabel', brandConfig: { internalMessages: [] } }),
    ).toBe('/api/dash/whitelabel/impression');
    expect(
      impressionEndpoint({ kind: 'publisher', publisherId: 'x', revShareTier: 'standard' }),
    ).toBe('/api/dash/impression');
  });
});

describe('REVENUE_PER_WAIT', () => {
  it('is the Phase 0 mocked micro-revenue', () => {
    expect(REVENUE_PER_WAIT).toBeCloseTo(0.0045);
  });
});
