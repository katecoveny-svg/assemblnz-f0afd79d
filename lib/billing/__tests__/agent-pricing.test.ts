import { describe, it, expect } from 'vitest';
import {
  AGENT_PLANS,
  FREE_MESSAGE_LIMIT,
  JULY_PROMO,
  PRO_STACK_EVERYDAY_COUNT,
  PRO_STACK_PLAN,
  PRO_STACK_SPECIALIST_COUNT,
  agentCountForPlan,
  agentPriceLabel,
  freeTrial,
  getAgentPlan,
  isAgentPlan,
  isJulyPromoCode,
  planForAgentPriceNzd,
  planForPriceId,
  priceIdForPlan,
  priceLabelForNzd,
} from '../agent-pricing';

describe('agent pricing ladder', () => {
  it('has the locked plans with the spec lookup keys + amounts', () => {
    const byKey = Object.fromEntries(AGENT_PLANS.map((p) => [p.stripeLookupKey, p]));
    expect(byKey['assembl_everyday_999']?.monthlyNzd).toBe(9.99);
    expect(byKey['assembl_pro_stack_4900']?.monthlyNzd).toBe(49);
    expect(byKey['assembl_specialist_19900']?.monthlyNzd).toBe(199);
    expect(byKey['assembl_all_access_25000']?.monthlyNzd).toBe(250);
  });

  it('exposes the four customer-facing tiers plus all-access', () => {
    const ids = AGENT_PLANS.map((p) => p.id);
    expect(ids).toContain('free');
    expect(ids).toContain('everyday');
    expect(ids).toContain('pro_stack');
    expect(ids).toContain('specialist');
    expect(ids).toContain('all_access');
  });

  it('exports the Pro Stack plan + composition', () => {
    expect(PRO_STACK_PLAN.id).toBe('pro_stack');
    expect(PRO_STACK_PLAN.envVar).toBe('NEXT_PUBLIC_STRIPE_PRICE_PRO_STACK_4900');
    expect(PRO_STACK_EVERYDAY_COUNT).toBe(3);
    expect(PRO_STACK_SPECIALIST_COUNT).toBe(1);
    // agentCount = 3 everyday + 1 specialist
    expect(PRO_STACK_PLAN.agentCount).toBe(4);
  });

  it('the free tier carries no Stripe price', () => {
    const free = getAgentPlan('free');
    expect(free?.monthlyNzd).toBe(0);
    expect(free?.envVar).toBeNull();
    expect(free?.stripeLookupKey).toBeNull();
  });

  it('keeps the free tier at 3 messages per agent', () => {
    expect(FREE_MESSAGE_LIMIT).toBe(3);
  });

  it('describes the 7-day / 50-message free trial', () => {
    expect(freeTrial.days).toBe(7);
    expect(freeTrial.messages).toBe(50);
  });

  it('maps an agent price to its plan', () => {
    expect(planForAgentPriceNzd(9.99)).toBe('everyday');
    expect(planForAgentPriceNzd(199)).toBe('specialist');
    expect(planForAgentPriceNzd(0)).toBe('everyday'); // free agents never reach checkout
  });

  it('reports the agent pick-count for each plan', () => {
    expect(agentCountForPlan('everyday')).toBe(1);
    expect(agentCountForPlan('specialist')).toBe(1);
    expect(agentCountForPlan('pro_stack')).toBe(4); // 3 everyday + 1 specialist
    expect(agentCountForPlan('all_access')).toBe(0); // covers everything
  });

  it('labels each tier for display', () => {
    expect(agentPriceLabel('free')).toBe('Free');
    expect(agentPriceLabel('everyday')).toBe('$9.99/mo');
    expect(agentPriceLabel('pro_stack')).toBe('Pro Stack — $49/mo');
    expect(agentPriceLabel('all_access')).toBe('All-Access $250/mo');
    expect(agentPriceLabel()).toBe('$9.99/mo'); // default rung
  });

  it('snaps a raw NZD price onto a canon rung', () => {
    expect(priceLabelForNzd(0)).toBe('Free');
    expect(priceLabelForNzd(9.99)).toBe('$9.99/mo');
    expect(priceLabelForNzd(199)).toBe('$199/mo');
  });

  it('resolves price ids from env and reverses them', () => {
    const env = {
      NEXT_PUBLIC_STRIPE_PRICE_EVERYDAY_999: 'price_everyday',
      NEXT_PUBLIC_STRIPE_PRICE_PRO_STACK_4900: 'price_pro_stack',
      NEXT_PUBLIC_STRIPE_PRICE_SPECIALIST_19900: 'price_specialist',
    };
    expect(priceIdForPlan('everyday', env)).toBe('price_everyday');
    expect(priceIdForPlan('pro_stack', env)).toBe('price_pro_stack');
    expect(priceIdForPlan('all_access', env)).toBeNull(); // unset → fail closed
    expect(priceIdForPlan('free', env)).toBeNull(); // no Stripe price
    expect(planForPriceId('price_specialist', env)).toBe('specialist');
    expect(planForPriceId('price_pro_stack', env)).toBe('pro_stack');
    expect(planForPriceId('price_unknown', env)).toBeNull();
    expect(planForPriceId(null, env)).toBeNull();
  });

  it('guards unknown plan ids', () => {
    expect(isAgentPlan('everyday')).toBe(true);
    expect(isAgentPlan('pro_stack')).toBe(true);
    expect(isAgentPlan('free')).toBe(true);
    expect(isAgentPlan('prostack')).toBe(false); // old id is gone
    expect(isAgentPlan('per_agent')).toBe(false); // flat ladder is gone
    expect(isAgentPlan('toro')).toBe(false); // old tier ladder is gone
    expect(getAgentPlan('enterprise')).toBeUndefined();
  });

  it('defines the July promo targeting All-Access', () => {
    expect(JULY_PROMO.code).toBe('JULYLAUNCH50');
    expect(JULY_PROMO.percentOff).toBe(50);
    expect(JULY_PROMO.maxRedemptions).toBe(20);
    expect(JULY_PROMO.duration).toBe('once');
    expect(JULY_PROMO.appliesToPlan).toBe('all_access');
    expect(isJulyPromoCode('julylaunch50')).toBe(true); // case-insensitive
    expect(isJulyPromoCode('NOPE')).toBe(false);
    expect(isJulyPromoCode(null)).toBe(false);
  });
});
