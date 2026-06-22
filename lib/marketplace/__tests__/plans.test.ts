import { describe, it, expect } from 'vitest';
import {
  MARKETPLACE_PLANS,
  planById,
  planByLookupKey,
  planForPriceId,
  priceIdForPlan,
  formatPlanPrice,
  isMarketplacePlanId,
} from '../plans';

describe('marketplace plans registry', () => {
  it('has the four locked plans with the spec lookup keys + amounts', () => {
    const byKey = Object.fromEntries(MARKETPLACE_PLANS.map((p) => [p.lookupKey, p]));
    expect(byKey['assembl_toro_999']?.unitAmount).toBe(999);
    expect(byKey['assembl_whanau_2499']?.unitAmount).toBe(2499);
    expect(byKey['assembl_pro_4999']?.unitAmount).toBe(4999);
    expect(byKey['assembl_business_19900']?.unitAmount).toBe(19900);
    expect(MARKETPLACE_PLANS).toHaveLength(4);
  });

  it('unitAmount always equals monthlyNzd * 100', () => {
    for (const plan of MARKETPLACE_PLANS) {
      expect(plan.unitAmount).toBe(Math.round(plan.monthlyNzd * 100));
    }
  });

  it('only the business plan is per-agent', () => {
    expect(planById('business')?.perAgent).toBe(true);
    expect(planById('toro')?.perAgent).toBe(false);
    expect(planById('whanau')?.perAgent).toBe(false);
    expect(planById('pro')?.perAgent).toBe(false);
  });

  it('resolves price ids from env and reverses them', () => {
    const env = {
      NEXT_PUBLIC_STRIPE_PRICE_TORO_999: 'price_toro',
      NEXT_PUBLIC_STRIPE_PRICE_PRO_4999: 'price_pro',
    };
    expect(priceIdForPlan('toro', env)).toBe('price_toro');
    expect(priceIdForPlan('whanau', env)).toBeNull(); // unset → fail closed
    expect(planForPriceId('price_pro', env)?.id).toBe('pro');
    expect(planForPriceId('price_unknown', env)).toBeNull();
    expect(planForPriceId(null, env)).toBeNull();
  });

  it('looks plans up by id + lookup key, and guards unknowns', () => {
    expect(planByLookupKey('assembl_whanau_2499')?.id).toBe('whanau');
    expect(isMarketplacePlanId('pro')).toBe(true);
    expect(isMarketplacePlanId('enterprise')).toBe(false);
    expect(planById('enterprise')).toBeUndefined();
  });

  it('formats prices the NZ way', () => {
    expect(formatPlanPrice(planById('toro')!)).toBe('NZ$9.99/mo');
    expect(formatPlanPrice(planById('business')!)).toBe('NZ$199/mo');
  });
});
