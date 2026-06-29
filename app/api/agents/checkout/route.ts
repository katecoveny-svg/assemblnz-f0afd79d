/**
 * POST /api/agents/checkout — subscribe to the agent ladder.
 *
 * Body: { plan: 'everyday' | 'pro_stack' | 'specialist' | 'all_access',
 *         agents: string[],     // the agent slugs the customer picked
 *         promo?: string }      // optional promo code (JULYLAUNCH50)
 *
 * Auth-gated. We validate the pick count/mix matches the plan, resolve a Stripe
 * customer, and create a subscription Checkout Session. The picked slugs + plan
 * + user id ride along in session/subscription metadata; the marketplace webhook
 * (/api/stripe/webhooks) reads them on checkout.session.completed and writes the
 * agent_installs rows that grant entitlement.
 *
 * Pro Stack is a mixed pick — exactly 3 everyday agents + 1 specialist. The
 * July promo (JULYLAUNCH50) is attached to checkout's `discounts` when the
 * customer arrives with ?promo=JULYLAUNCH50 (All-Access, 50% off first month).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import { getOrCreateCustomer } from '@/lib/stripe/customer';
import { resolveOrCreateTenantId } from '@/lib/billing/tenant-context';
import {
  JULY_PROMO,
  PRO_STACK_EVERYDAY_COUNT,
  PRO_STACK_SPECIALIST_COUNT,
  agentCountForPlan,
  getAgentPlan,
  isAgentPlan,
  isJulyPromoCode,
  planForAgentPriceNzd,
  priceIdForPlan,
} from '@/lib/billing/agent-pricing';
import {
  agentEligibleForProStack,
  agentIsSpecialist,
  marketplaceAgentBySlug,
} from '@/lib/marketplace/agents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { plan?: string; agents?: unknown; promo?: unknown };
  try {
    body = (await req.json()) as { plan?: string; agents?: unknown; promo?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const plan = body.plan ?? '';
  if (!isAgentPlan(plan)) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
  }

  // Validate the picked agents against the plan's required count.
  const required = agentCountForPlan(plan);
  const picked = Array.isArray(body.agents)
    ? Array.from(new Set(body.agents.filter((s): s is string => typeof s === 'string')))
    : [];

  if (required > 0) {
    if (picked.length !== required) {
      return NextResponse.json(
        { error: `This plan needs exactly ${required} agent${required === 1 ? '' : 's'}.` },
        { status: 400 },
      );
    }
    const unknown = picked.find((slug) => !marketplaceAgentBySlug(slug));
    if (unknown) {
      return NextResponse.json({ error: `Unknown agent: ${unknown}` }, { status: 400 });
    }

    if (plan === 'pro_stack') {
      // Pro Stack is a mixed bundle — exactly 3 everyday + 1 specialist.
      const agents = picked.map((slug) => marketplaceAgentBySlug(slug)!);
      const everyday = agents.filter((a) => agentEligibleForProStack(a)).length;
      const specialist = agents.filter((a) => agentIsSpecialist(a)).length;
      if (everyday !== PRO_STACK_EVERYDAY_COUNT || specialist !== PRO_STACK_SPECIALIST_COUNT) {
        return NextResponse.json(
          {
            error: `Pro Stack needs ${PRO_STACK_EVERYDAY_COUNT} everyday agents and ${PRO_STACK_SPECIALIST_COUNT} specialist.`,
          },
          { status: 400 },
        );
      }
    } else {
      // The plan must charge the picked agent's tier — a $9.99 everyday agent
      // can't be bought on the $199 specialist plan, and vice versa.
      const mismatch = picked.find((slug) => {
        const agent = marketplaceAgentBySlug(slug);
        return agent ? planForAgentPriceNzd(agent.priceNzd) !== plan : false;
      });
      if (mismatch) {
        return NextResponse.json(
          { error: `That agent isn't on the ${getAgentPlan(plan)?.name ?? plan} plan.` },
          { status: 400 },
        );
      }
    }
  }

  // The July promo only applies to its locked plan (All-Access).
  const promoActive = isJulyPromoCode(typeof body.promo === 'string' ? body.promo : null)
    && plan === JULY_PROMO.appliesToPlan;

  const priceId = priceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json({ error: 'Billing is not configured yet' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to subscribe' }, { status: 401 });
  }

  let tenantId: string;
  try {
    tenantId = await resolveOrCreateTenantId(user.id, user.email ?? null);
  } catch (error) {
    console.error('agents checkout: tenant resolution failed', error);
    return NextResponse.json({ error: 'Could not prepare your workspace' }, { status: 500 });
  }

  try {
    const customer = await getOrCreateCustomer({
      tenantId,
      contactEmail: user.email ?? undefined,
    });

    const origin = req.headers.get('origin') ?? new URL(req.url).origin;
    // Slugs ride in metadata as a comma-joined list (Stripe metadata values are
    // strings, max 500 chars — 20 short slugs fit comfortably).
    const agentSlugs = required > 0 ? picked.join(',') : '';
    const metadata: Record<string, string> = {
      user_id: user.id,
      plan,
      agent_slugs: agentSlugs,
    };
    if (promoActive) metadata.promo = JULY_PROMO.code;

    const stripe = getStripe();
    // The July promo attaches the coupon directly via `discounts`; otherwise we
    // let the customer type any promotion code. The two are mutually exclusive
    // in Stripe Checkout, so we branch.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.stripe_customer_id,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(promoActive
        ? { discounts: [{ coupon: JULY_PROMO.code }] }
        : { allow_promotion_codes: true }),
      success_url: `${origin}/agents?subscribed=1`,
      cancel_url: `${origin}/agents/pricing?checkout=cancelled`,
      subscription_data: { metadata },
      metadata,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, plan, name: getAgentPlan(plan)?.name });
  } catch (error) {
    console.error('agents checkout: stripe error', error);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 });
  }
}
