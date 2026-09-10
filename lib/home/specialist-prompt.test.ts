import { describe, expect, it } from 'vitest';
import { MARKETPLACE_AGENTS, marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import { SHARED_RULES, specialistHasKnowledge, specialistSystem } from '@/lib/home/specialist-prompt';
import { HOME_AGENTS, HOME_AGENTS_FEATURED } from '@/lib/home/agent-roster';
import { HOME_PHONE_KNOWLEDGE_SLUGS } from '@/lib/agents/nz-knowledge';

const live = MARKETPLACE_AGENTS.filter((a) => a.status === 'live');

describe('homepage specialist prompts', () => {
  it('covers every live agent the roster offers', () => {
    expect(live.length).toBeGreaterThan(0);
    for (const agent of HOME_AGENTS) {
      expect(marketplaceAgentBySlug(agent.slug)?.status).toBe('live');
    }
  });

  it('features the flagship knowledge specialists on the opening rail', () => {
    const featured = HOME_AGENTS_FEATURED.map((a) => a.slug);
    for (const slug of ['arai', 'kaupapa', 'pikau', 'auaha', 'arataki', 'prism'] as const) {
      expect(featured, slug).toContain(slug);
      expect(HOME_PHONE_KNOWLEDGE_SLUGS.has(slug)).toBe(true);
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

  it('tells non-knowledge agents they cannot act on this page', () => {
    for (const agent of live) {
      if (specialistHasKnowledge(agent.slug)) continue;
      const prompt = specialistSystem(agent);
      expect(prompt, agent.slug).toContain('You have no tools, no documents, no database');
      expect(prompt, agent.slug).toContain('you never claim to have done it');
    }
  });

  it('gives flagship specialists read-only cite mode, not writeback', () => {
    for (const slug of HOME_PHONE_KNOWLEDGE_SLUGS) {
      const agent = marketplaceAgentBySlug(slug);
      if (!agent || agent.status !== 'live') continue;
      const prompt = specialistSystem(agent);
      expect(prompt, slug).toContain('searchNZKnowledge');
      expect(prompt, slug).toContain('cite mode');
      expect(prompt, slug).toContain('Never claim you filed, lodged, sent, saved');
      expect(prompt, slug).not.toContain('You have no tools, no documents, no database');
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
