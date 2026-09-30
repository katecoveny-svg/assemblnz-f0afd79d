import { describe, expect, it } from 'vitest';
import { personalDoPlan } from '../personal-do-plan';

describe('review-only Personal DO plan', () => {
  const configured = { PERSONAL_DO_STRIPE_PRICE_ID: 'price_review', PERSONAL_DO_MONTHLY_AMOUNT_CENTS: '100', PERSONAL_DO_CURRENCY: 'nzd', PERSONAL_DO_TAX_TREATMENT: 'inclusive', PERSONAL_DO_REQUESTS_PER_DAY: '1', PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS: '1' };
  it('requires dedicated explicit price, tax and usage decisions without defaults', () => {
    expect(personalDoPlan({})).toBeNull();
    expect(personalDoPlan({ STRIPE_PRICE_SOLO: 'price_legacy' })).toBeNull();
    for (const key of Object.keys(configured)) expect(personalDoPlan({ ...configured, [key]: undefined })).toBeNull();
    expect(personalDoPlan(configured)).toMatchObject({ currency: 'nzd', requestsPerDay: 1 });
  });
  it('rejects ambiguous or unsafe limits', () => {
    for (const value of ['0', '-1', 'NaN', '1.5', '9007199254740992']) expect(personalDoPlan({ ...configured, PERSONAL_DO_REQUESTS_PER_DAY: value })).toBeNull();
    expect(personalDoPlan({ ...configured, PERSONAL_DO_TAX_TREATMENT: 'unknown' })).toBeNull();
  });
});
