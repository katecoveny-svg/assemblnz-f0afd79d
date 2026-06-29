import { redirect } from 'next/navigation';
import { getAgentPlan, isJulyPromoCode, JULY_PROMO } from '@/lib/billing/agent-pricing';
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';
import { AgentCheckout } from '@/components/marketplace/AgentCheckout';

export const dynamic = 'force-dynamic';

/**
 * Bundle / per-agent checkout picker. The customer picks the agents their plan
 * covers, then we hand off to Stripe (/api/agents/checkout). All-access skips
 * the picker; Pro Stack picks 3 everyday + 1 specialist. The agent registry
 * stays server-side (it carries locked prompts); we pass only a slim, prompt-
 * free projection. A ?promo=JULYLAUNCH50 on All-Access rides through to checkout.
 */
export default async function AgentCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; agent?: string; promo?: string }>;
}) {
  const { plan: planParam, agent: agentParam, promo: promoParam } = await searchParams;
  const plan = planParam ? getAgentPlan(planParam) : undefined;
  if (!plan) redirect('/agents/pricing');

  const slimAgents = PUBLIC_MARKETPLACE_AGENTS.map((a) => ({
    slug: a.slug,
    name: a.name,
    description: a.description,
    icon: a.icon,
    accent: a.accent,
    priceNzd: a.priceNzd,
    vertical: a.vertical,
  }));

  const preselect =
    agentParam && slimAgents.some((a) => a.slug === agentParam) ? agentParam : null;

  // The July promo only applies on its locked plan (All-Access).
  const promo =
    isJulyPromoCode(promoParam) && plan.id === JULY_PROMO.appliesToPlan ? JULY_PROMO.code : null;

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
      promo={promo}
    />
  );
}
