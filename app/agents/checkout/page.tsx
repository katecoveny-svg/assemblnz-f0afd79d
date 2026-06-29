import { redirect } from 'next/navigation';
import { PROSTACK_BUNDLE_SLUGS, getAgentPlan } from '@/lib/billing/agent-pricing';
import { PUBLIC_MARKETPLACE_AGENTS, marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import { AgentCheckout } from '@/components/marketplace/AgentCheckout';

export const dynamic = 'force-dynamic';

/**
 * Bundle / per-agent checkout picker. The customer picks the agents their plan
 * covers, then we hand off to Stripe (/api/agents/checkout). All-access and the
 * fixed Pro Stack bundle skip the picker. The agent registry stays server-side
 * (it carries locked prompts); we pass only a slim, prompt-free projection.
 */
export default async function AgentCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; agent?: string }>;
}) {
  const { plan: planParam, agent: agentParam } = await searchParams;
  const plan = planParam ? getAgentPlan(planParam) : undefined;
  if (!plan) redirect('/agents/pricing');

  const slimAgents = PUBLIC_MARKETPLACE_AGENTS.map((a) => ({
    slug: a.slug,
    name: a.name,
    description: a.description,
    icon: a.icon,
    accent: a.accent,
  }));

  const preselect =
    agentParam && slimAgents.some((a) => a.slug === agentParam) ? agentParam : null;

  // Pro Stack is a fixed bundle — the customer doesn't pick; we show what's in
  // it. Names come from the registry so the list can't drift from entitlement.
  const includedAgents =
    plan.id === 'prostack'
      ? PROSTACK_BUNDLE_SLUGS.map((slug) => marketplaceAgentBySlug(slug)?.name).filter(
          (name): name is string => Boolean(name),
        )
      : undefined;

  return (
    <AgentCheckout
      plan={{
        id: plan.id,
        name: plan.name,
        monthlyNzd: plan.monthlyNzd,
        agentCount: plan.agentCount,
      }}
      agents={slimAgents}
      preselect={preselect}
      includedAgents={includedAgents}
    />
  );
}
