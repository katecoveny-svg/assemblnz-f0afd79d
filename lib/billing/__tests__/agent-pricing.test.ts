import { describe, it, expect } from 'vitest';
import {
  AGENT_PLANS,
  FREE_MESSAGE_LIMIT,
  agentCountForPlan,
  getAgentPlan,
  isAgentPlan,
  planForPriceId,
  priceIdForPlan,
} from '../agent-pricing';

describe('flat agent pricing ladder', () => {
  it('has the five locked plans with the spec lookup keys + amounts', () => {
    const byKey = Object.fromEntries(AGENT_PLANS.map((p) => [p.stripeLookupKey, p]));
    expect(byKey['assembl_per_agent_1500']?.monthlyNzd).toBe(15);
    expect(byKey['assembl_bundle_5_5000']?.monthlyNzd).toBe(50);
    expect(byKey['assembl_bundle_10_9000']?.monthlyNzd).toBe(90);
    expect(byKey['assembl_bundle_20_15000']?.monthlyNzd).toBe(150);
    expect(byKey['assembl_all_access_25000']?.monthlyNzd).toBe(250);
    expect(AGENT_PLANS).toHaveLength(5);
  });

  it('keeps the free tier at 3 messages per agent', () => {
    expect(FREE_MESSAGE_LIMIT).toBe(3);
  });

  it('reports the agent pick-count for each plan', () => {
    expect(agentCountForPlan('per_agent')).toBe(1);
    expect(agentCountForPlan('bundle_5')).toBe(5);
    expect(agentCountForPlan('bundle_10')).toBe(10);
    expect(agentCountForPlan('bundle_20')).toBe(20);
    expect(agentCountForPlan('all_access')).toBe(0); // no pick — covers everything
  });

  it('resolves price ids from env and reverses them', () => {
    const env = {
      NEXT_PUBLIC_STRIPE_PRICE_PER_AGENT_1500: 'price_pa',
      NEXT_PUBLIC_STRIPE_PRICE_BUNDLE_10_9000: 'price_b10',
    };
    expect(priceIdForPlan('per_agent', env)).toBe('price_pa');
    expect(priceIdForPlan('bundle_5', env)).toBeNull(); // unset → fail closed
    expect(planForPriceId('price_b10', env)).toBe('bundle_10');
    expect(planForPriceId('price_unknown', env)).toBeNull();
    expect(planForPriceId(null, env)).toBeNull();
  });

  it('guards unknown plan ids', () => {
    expect(isAgentPlan('per_agent')).toBe(true);
    expect(isAgentPlan('toro')).toBe(false); // old ladder is gone
    expect(getAgentPlan('enterprise')).toBeUndefined();
  });
});
