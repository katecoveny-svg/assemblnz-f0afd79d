import { describe, expect, it } from 'vitest';
import { MARKETPLACE_AGENTS, marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import { SHARED_RULES, specialistSystem } from '@/lib/home/specialist-prompt';
import { HOME_AGENTS } from '@/lib/home/agent-roster';

const live = MARKETPLACE_AGENTS.filter((a) => a.status === 'live');

describe('homepage specialist prompts', () => {
  it('covers every live agent the roster offers', () => {
    expect(live.length).toBeGreaterThan(0);
    for (const agent of HOME_AGENTS) {
      expect(marketplaceAgentBySlug(agent.slug)?.status).toBe('live');
    }
  });

  it('carries the shared guardrails for every live agent', () => {
    for (const agent of live) {
      const prompt = specialistSystem(agent);
      expect(prompt, agent.slug).toContain(SHARED_RULES);
      // Pricing is the boundary that matters most on a public page.
      expect(prompt, agent.slug).toContain('NEVER TALK PRICING');
      expect(prompt, agent.slug).toContain('assembl@assembl.co.nz');
    }
  });

  it('tells every agent it cannot act on this page', () => {
    for (const agent of live) {
      const prompt = specialistSystem(agent);
      expect(prompt, agent.slug).toContain('You have no tools, no documents, no database');
      expect(prompt, agent.slug).toContain('you never claim to have done it');
    }
  });

  it('grounds each agent in its own registry record, with no empty sections', () => {
    for (const agent of live) {
      const prompt = specialistSystem(agent);
      expect(prompt, agent.slug).toContain(agent.name);
      expect(prompt, agent.slug).toContain(agent.description);
      for (const line of agent.whatItDoes) expect(prompt, agent.slug).toContain(line);
      for (const line of agent.sampleOutputs) expect(prompt, agent.slug).toContain(line);
      // A heading followed by nothing would invite the model to fill the gap.
      expect(prompt, agent.slug).not.toMatch(/\n[A-Z][A-Z ,'’—-]+\n\n/);
    }
  });

  it('never leaks the agent’s locked production system prompt', () => {
    for (const agent of live) {
      if (!agent.systemPrompt) continue;
      expect(specialistSystem(agent), agent.slug).not.toContain(agent.systemPrompt);
    }
  });
});
