/**
 * The agent roster the homepage flicks through.
 *
 * Every entry is projected from the real registry in lib/marketplace/agents.ts —
 * the same records that back /agents and the marketplace — so the homepage can
 * never show an agent that does not exist, or describe one in words nobody
 * signed off. Only `status: 'live'` agents make it in.
 *
 * The projection is deliberately narrow. The full registry carries system
 * prompts, tool lists, model ladders and pricing; none of that belongs in a
 * public page's JavaScript bundle, and pricing in particular is something the
 * homepage agent is forbidden to discuss at all. What survives is what a visitor
 * needs to choose an agent and understand what it does.
 */

import {
  CATEGORY_LABELS,
  PUBLIC_MARKETPLACE_AGENTS,
  type MarketplaceCategory,
} from '@/lib/marketplace/agents';

export type HomeAgent = {
  slug: string;
  name: string;
  /** te reo label shown quietly beside the name; '' when the agent has none */
  teReo: string;
  /** one sentence: what this agent is for */
  description: string;
  category: MarketplaceCategory;
  categoryLabel: string;
  /** canon avatar key (AgentIcon) */
  icon: string;
  /** the work it does, at most three lines */
  does: string[];
  /** real lines this agent produces — the registry's own sampleOutputs */
  samples: string[];
  /** the NZ sources it is grounded in */
  grounding: string[];
};

/**
 * The order categories appear in the picker. Work people recognise first;
 * the specialist trades and build packs after.
 */
const CATEGORY_ORDER: MarketplaceCategory[] = [
  'start-here',
  'family',
  'business',
  'creative',
  'trades',
  'build',
  'health',
  'animal',
];

const toHomeAgent = (a: (typeof PUBLIC_MARKETPLACE_AGENTS)[number]): HomeAgent => ({
  slug: a.slug,
  name: a.name,
  teReo: a.teReo,
  description: a.description,
  category: a.category,
  categoryLabel: CATEGORY_LABELS[a.category] ?? a.category,
  icon: a.icon,
  does: a.whatItDoes.slice(0, 3),
  samples: a.sampleOutputs.slice(0, 2),
  grounding: a.nzKnowledge.slice(0, 3),
});

/** Every live agent, ordered by category then registry order. */
export const HOME_AGENTS: HomeAgent[] = PUBLIC_MARKETPLACE_AGENTS.filter(
  (a) => a.status === 'live',
)
  .map(toHomeAgent)
  .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));

/**
 * The agents the homepage opens on — the ones that show the range of the work
 * rather than the ones that happen to sort first. A visitor who never touches
 * the picker still sees a spread across household, business, trades and care.
 */
const OPENING_SLUGS = ['awhi', 'aroha', 'arai', 'kaupapa', 'auaha', 'front'] as const;

export const HOME_AGENTS_FEATURED: HomeAgent[] = OPENING_SLUGS.map((slug) =>
  HOME_AGENTS.find((a) => a.slug === slug),
).filter((a): a is HomeAgent => Boolean(a));

/** Categories that actually have live agents, in display order. */
export const HOME_AGENT_CATEGORIES: { category: MarketplaceCategory; label: string; count: number }[] =
  CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    count: HOME_AGENTS.filter((a) => a.category === category).length,
  })).filter((c) => c.count > 0);

export const homeAgentBySlug = (slug: string): HomeAgent | undefined =>
  HOME_AGENTS.find((a) => a.slug === slug);
