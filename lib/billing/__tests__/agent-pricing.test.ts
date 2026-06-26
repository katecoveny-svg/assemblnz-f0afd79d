import { describe, it, expect } from 'vitest';
import {
  AGENT_PLANS,
  FREE_MESSAGE_LIMIT,
  agentCountForPlan,
  getAgentPlan,
  isAgentPlan,
  planForAgentPriceNzd,
  planForPriceId,
  priceIdForPlan,
} from '../agent-pricing';

describe('locked agent pricing ladder', () => {
  it('has the three locked plans with the spec lookup keys + amounts', () => {
    const byKey = Object.fromEntries(AGENT_PLANS.map((p) => [p.stripeLookupKey, p]));
    expect(byKey['assembl_everyday_999']?.monthlyNzd).toBe(9.99);
    expect(byKey['assembl_specialist_19900']?.monthlyNzd).toBe(199);
    expect(byKey['assembl_all_access_25000']?.monthlyNzd).toBe(250);
    expect(AGENT_PLANS).toHaveLength(3);
  });

  it('keeps the free tier at 3 messages per agent', () => {
    expect(FREE_MESSAGE_LIMIT).toBe(3);
  });

  it('maps an agent price to its plan', () => {
    expect(planForAgentPriceNzd(9.99)).toBe('everyday');
    expect(planForAgentPriceNzd(199)).toBe('specialist');
    expect(planForAgentPriceNzd(0)).toBe('everyday'); // free agents never reach checkout
  });

  it('reports the agent pick-count for each plan', () => {
    expect(agentCountForPlan('everyday')).toBe(1);
    expect(agentCountForPlan('specialist')).toBe(1);
    expect(agentCountForPlan('all_access')).toBe(0); // no pick — covers everything
  });

  it('resolves price ids from env and reverses them', () => {
    const env = {
      NEXT_PUBLIC_STRIPE_PRICE_EVERYDAY_999: 'price_everyday',
      NEXT_PUBLIC_STRIPE_PRICE_SPECIALIST_19900: 'price_specialist',
    };
    expect(priceIdForPlan('everyday', env)).toBe('price_everyday');
    expect(priceIdForPlan('all_access', env)).toBeNull(); // unset → fail closed
    expect(planForPriceId('price_specialist', env)).toBe('specialist');
    expect(planForPriceId('price_unknown', env)).toBeNull();
    expect(planForPriceId(null, env)).toBeNull();
  });

  it('guards unknown plan ids', () => {
    expect(isAgentPlan('everyday')).toBe(true);
    expect(isAgentPlan('per_agent')).toBe(false); // flat ladder is gone
    expect(isAgentPlan('toro')).toBe(false); // old tier ladder is gone
    expect(getAgentPlan('enterprise')).toBeUndefined();
  });
});
