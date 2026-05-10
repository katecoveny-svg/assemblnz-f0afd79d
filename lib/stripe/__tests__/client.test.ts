import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { _resetStripeForTests, getStripe } from '../client';

const ORIG_KEY = process.env.STRIPE_SECRET_KEY;

describe('getStripe', () => {
  beforeEach(() => {
    _resetStripeForTests();
  });

  afterEach(() => {
    if (ORIG_KEY === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = ORIG_KEY;
    }
    _resetStripeForTests();
  });

  it('throws a useful error when STRIPE_SECRET_KEY is missing', () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => getStripe()).toThrowError(/STRIPE_SECRET_KEY missing/);
  });

  it('returns a singleton — the same Stripe instance across calls', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_unit_test_only';
    const first = getStripe();
    const second = getStripe();
    expect(first).toBe(second);
  });

  it('isolates singletons across _resetStripeForTests()', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_unit_test_only';
    const first = getStripe();
    _resetStripeForTests();
    const second = getStripe();
    expect(first).not.toBe(second);
  });
});
