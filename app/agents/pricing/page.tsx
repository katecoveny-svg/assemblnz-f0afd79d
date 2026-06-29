import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import {
  FREE_MESSAGE_LIMIT,
  JULY_PROMO,
  getAgentPlan,
  type AgentPlan,
} from '@/lib/billing/agent-pricing';
import { eligibleForPromo } from '@/lib/billing/promo';
import { PALETTE, DASH_MOTIF } from '@/lib/marketplace/agents';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

export const metadata: Metadata = {
  title: 'Agent pricing — assembl',
  description:
    'From free. $9.99 for most agents, $49 for the Pro Stack bundle, $250 for all-access. Try any agent free first, then keep the ones you use.',
};

// The promo count is read live from Stripe per request.
export const dynamic = 'force-dynamic';

// Canon type roles (locked 2026-06-23): Cormorant Garamond for display,
// Lato for body, Space Mono for eyebrows + labels.
const CORMORANT = 'var(--font-cormorant), Georgia, serif';
const SPACE_MONO = 'var(--font-space-mono), ui-monospace, monospace';

// The canon gold gradient, clipped to text — used on the italic accent words.
const GOLD_TEXT: React.CSSProperties = {
  background: 'linear-gradient(110deg,#FFCB1F 0%,#F2C200 46%,#E0A800 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  fontStyle: 'italic',
  fontWeight: 700,
};

// The four customer-facing tiers, in canon order. Names / prices / blurbs /
// perks all come from AGENT_PLANS so this page can never drift from checkout.
// (Specialist stays in AGENT_PLANS as plumbing for the $199 roster agents; it
// is surfaced as a footnote below, not as a fifth card.)
type CardSpec = {
  id: AgentPlan;
  cta: string;
  href: string;
  featured?: boolean;
  pill?: string;
};

const CARDS: CardSpec[] = [
  { id: 'free', cta: 'Browse free agents', href: '/agents' },
  { id: 'everyday', cta: 'Browse $9.99 agents', href: '/agents' },
  {
    id: 'prostack',
    cta: 'Get the Pro Stack',
    href: '/agents/checkout?plan=prostack',
    featured: true,
    pill: 'Most popular',
  },
  { id: 'all_access', cta: 'Get all-access', href: '/agents/checkout?plan=all_access' },
];

function priceDisplay(monthlyNzd: number): { amount: string; cadence?: string } {
  if (!monthlyNzd) return { amount: 'Free' };
  return { amount: `$${monthlyNzd}`, cadence: '/mo' };
}

export default async function AgentPricingPage() {
  const promo = await eligibleForPromo();
  const specialist = getAgentPlan('specialist');

  // Banner copy: show the live count when we have it and spots remain; soften
  // when the coupon is genuinely exhausted; drop the count if Stripe is unknown.
  const spotsLine =
    promo.known && !promo.eligible
      ? 'First-month promo now closed.'
      : promo.known
        ? `${promo.remaining} of ${JULY_PROMO.maxRedemptions} spots left.`
        : null;

  return (
    <div className="mk-root min-h-screen overflow-x-hidden" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {/* Amber July promo banner */}
        <div
          className="flex flex-col gap-2 rounded-[20px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: 'linear-gradient(135deg, #FFF1C2 0%, #FFE27A 100%)',
            borderColor: PALETTE.canary,
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: PALETTE.ink }}>
            <span className="font-bold">First 20 businesses get 50% off the first month.</span>{' '}
            Use code{' '}
            <span
              className="rounded-md px-1.5 py-0.5 text-[13px] font-bold"
              style={{ fontFamily: SPACE_MONO, backgroundColor: PALETTE.ink, color: PALETTE.canary }}
            >
              {JULY_PROMO.code}
            </span>{' '}
            at checkout.{spotsLine ? <span className="font-bold"> {spotsLine}</span> : null}
          </p>
        </div>

        {/* Eyebrow */}
        <span
          className="mt-10 block text-[12px] font-bold uppercase tracking-[0.18em]"
          style={{ fontFamily: SPACE_MONO, color: PALETTE.gold }}
        >
          Pricing
        </span>

        {/* H1 — Cormorant, charcoal with gold italic price accents */}
        <h1
          className="mt-4 text-balance text-[2rem] leading-[1.06] md:text-6xl md:leading-[1.04]"
          style={{ fontFamily: CORMORANT, fontWeight: 500, color: PALETTE.ink, letterSpacing: '-0.02em' }}
        >
          From free. <span style={GOLD_TEXT}>$9.99</span> for most.
          <br className="hidden sm:block" /> The <span style={GOLD_TEXT}>Pro Stack</span> for a team.
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
          Pay per agent, or bundle the everyday ones into the Pro Stack. Try any of them free first.
          Cancel any month.
        </p>

        <div className="mt-7 h-1.5 w-full rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />

        {/* Four tiers — Free / Everyday / Pro Stack / All-Access */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => {
            const plan = getAgentPlan(card.id);
            if (!plan) return null;
            const { amount, cadence } = priceDisplay(plan.monthlyNzd);
            return (
              <div
                key={card.id}
                className="relative flex flex-col rounded-[26px] border bg-white p-6"
                style={{
                  borderColor: card.featured ? PALETTE.canary : PALETTE.hairline,
                  boxShadow: card.featured ? `0 24px 60px ${PALETTE.canary}33` : undefined,
                }}
              >
                {card.pill ? (
                  <span
                    className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{ fontFamily: SPACE_MONO, backgroundColor: PALETTE.canary, color: PALETTE.ink }}
                  >
                    {card.pill}
                  </span>
                ) : null}

                <h2 className="text-2xl" style={{ fontFamily: CORMORANT, fontWeight: 600, color: PALETTE.ink }}>
                  {plan.name}
                </h2>

                <div className="mt-1 flex items-baseline gap-1">
                  <span
                    className="text-4xl"
                    style={{
                      fontFamily: CORMORANT,
                      fontWeight: 600,
                      color: PALETTE.ink,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {amount}
                  </span>
                  {cadence ? (
                    <span className="text-sm" style={{ fontFamily: SPACE_MONO, color: PALETTE.muted }}>
                      {cadence}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                  {plan.blurb}
                </p>

                <ul className="mt-4 flex-1 space-y-2 text-sm" style={{ color: PALETTE.body }}>
                  {plan.perks.map((perk) => (
                    <Feature key={perk}>{perk}</Feature>
                  ))}
                </ul>

                <Link
                  href={card.href}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition hover:brightness-95"
                  style={
                    card.featured
                      ? { backgroundColor: PALETTE.canary, color: PALETTE.ink }
                      : { border: `1px solid ${PALETTE.ink}`, color: PALETTE.ink }
                  }
                >
                  {card.cta}
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Specialist footnote — the $199 regulated agents aren't a headline card */}
        {specialist ? (
          <div
            className="mt-6 flex flex-col gap-2 rounded-[20px] border bg-white px-6 py-5 md:flex-row md:items-center md:justify-between"
            style={{ borderColor: PALETTE.hairline }}
          >
            <p className="text-sm leading-relaxed" style={{ color: PALETTE.body }}>
              <span className="font-bold" style={{ color: PALETTE.ink }}>
                Need a specialist?
              </span>{' '}
              The regulated, high-stakes agents — health, customs, compliance, the coast — are{' '}
              {specialist.label}, wired to the live NZ sources they need.
            </p>
            <Link
              href="/agents"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold hover:opacity-70"
              style={{ color: PALETTE.ink }}
            >
              Browse $199 agents
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        ) : null}

        <p className="mt-10 text-sm" style={{ color: PALETTE.muted }}>
          Prices in NZD, GST inclusive. The first {FREE_MESSAGE_LIMIT} messages with any agent are
          free. Every reply is a draft for a human to check before it is sent, filed, or lodged. Not
          legal, financial, or medical advice.
        </p>
      </div>

      <MarketplaceFooter />
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: PALETTE.canary }}
      >
        <Check size={12} style={{ color: PALETTE.ink }} aria-hidden />
      </span>
      <span>{children}</span>
    </li>
  );
}
