import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { FREE_MESSAGE_LIMIT, getAgentPlan } from '@/lib/billing/agent-pricing';
import { MARKETPLACE_AGENTS, PALETTE, DASH_MOTIF } from '@/lib/marketplace/agents';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

export const metadata: Metadata = {
  title: 'Agent pricing — assembl',
  description:
    'From free. $9.99 for most agents. $199 for the specialists. Try any agent free first, then keep the ones you use. All-access for the lot.',
};

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

// Example agents per tier, read straight from the registry so the page can
// never drift from the cards. Names only — the registry's server-side prompts
// never reach the client.
const sample = (price: number) =>
  MARKETPLACE_AGENTS.filter((a) => a.priceNzd === price && !a.hidden).map((a) => a.name);

const FREE_AGENTS = sample(0);
const EVERYDAY_AGENTS = sample(9.99);
const SPECIALIST_AGENTS = sample(199);

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  who: string;
  examples: string[];
  bullets: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: 'Free',
    who: 'Try any agent before you pay — and some stay free for good.',
    examples: FREE_AGENTS,
    bullets: [
      `Your first ${FREE_MESSAGE_LIMIT} messages with any agent are on us`,
      'The everyday utility agents are free forever',
      'No card to start',
    ],
    cta: 'Browse free agents',
    href: '/agents',
  },
  {
    name: 'Everyday',
    price: '$9.99',
    cadence: '/mo',
    who: 'Most agents — the ones that clear the daily admin.',
    examples: EVERYDAY_AGENTS,
    bullets: ['One agent, all yours', 'Unlimited messages', 'Drafts only — you stay in control'],
    cta: 'Browse $9.99 agents',
    href: '/agents',
    featured: true,
  },
  {
    name: 'Specialist',
    price: '$199',
    cadence: '/mo',
    who: 'The regulated, high-stakes work — health, customs, compliance, the coast.',
    examples: SPECIALIST_AGENTS,
    bullets: ['One specialist agent', 'Unlimited messages', 'Wired to the live NZ sources it needs'],
    cta: 'Browse $199 agents',
    href: '/agents',
  },
];

const ALL_ACCESS = getAgentPlan('all_access');

export default function AgentPricingPage() {
  return (
    <div className="mk-root min-h-screen overflow-x-hidden" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        {/* Eyebrow */}
        <span
          className="text-[12px] font-bold uppercase tracking-[0.18em]"
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
          <br className="hidden sm:block" /> <span style={GOLD_TEXT}>$199</span> for the specialists.
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
          Pay per agent — pick the ones you need, leave the rest. Try any of them free first.
          Cancel any month.
        </p>

        <div className="mt-7 h-1.5 w-full rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />

        {/* Three per-agent tiers — matches the prices on the cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="relative flex flex-col rounded-[26px] border bg-white p-6"
              style={{
                borderColor: tier.featured ? PALETTE.canary : PALETTE.hairline,
                boxShadow: tier.featured ? `0 24px 60px ${PALETTE.canary}33` : undefined,
              }}
            >
              {tier.featured ? (
                <span
                  className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{ fontFamily: SPACE_MONO, backgroundColor: PALETTE.canary, color: PALETTE.ink }}
                >
                  Most agents
                </span>
              ) : null}

              <h2 className="text-2xl" style={{ fontFamily: CORMORANT, fontWeight: 600, color: PALETTE.ink }}>
                {tier.name}
              </h2>

              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="text-4xl"
                  style={{ fontFamily: CORMORANT, fontWeight: 600, color: PALETTE.ink, letterSpacing: '-0.01em' }}
                >
                  {tier.price}
                </span>
                {tier.cadence ? (
                  <span className="text-sm" style={{ fontFamily: SPACE_MONO, color: PALETTE.muted }}>
                    {tier.cadence}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                {tier.who}
              </p>

              <ul className="mt-4 space-y-2 text-sm" style={{ color: PALETTE.body }}>
                {tier.bullets.map((b) => (
                  <Feature key={b}>{b}</Feature>
                ))}
              </ul>

              {/* Example agents in this tier, pulled from the registry */}
              {tier.examples.length ? (
                <div className="mt-5">
                  <p
                    className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
                    style={{ fontFamily: SPACE_MONO, color: PALETTE.muted }}
                  >
                    For example
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tier.examples.slice(0, 5).map((name) => (
                      <span
                        key={name}
                        className="rounded-full px-2.5 py-1 text-[12px] font-medium"
                        style={{ backgroundColor: PALETTE.cream, color: PALETTE.ink }}
                      >
                        {name}
                      </span>
                    ))}
                    {tier.examples.length > 5 ? (
                      <span className="px-1 py-1 text-[12px]" style={{ color: PALETTE.muted }}>
                        +{tier.examples.length - 5} more
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <Link
                href={tier.href}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition hover:brightness-95"
                style={
                  tier.featured
                    ? { backgroundColor: PALETTE.canary, color: PALETTE.ink }
                    : { border: `1px solid ${PALETTE.ink}`, color: PALETTE.ink }
                }
              >
                {tier.cta}
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          ))}
        </div>

        {/* All-access — one price for the whole shelf */}
        {ALL_ACCESS ? (
          <div
            className="mt-8 flex flex-col gap-5 rounded-[26px] p-7 md:flex-row md:items-center md:justify-between md:p-8"
            style={{ backgroundColor: PALETTE.ink }}
          >
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ fontFamily: SPACE_MONO, color: PALETTE.canary }}
              >
                Want the lot?
              </p>
              <h2
                className="mt-2 text-3xl"
                style={{ fontFamily: CORMORANT, fontWeight: 600, color: PALETTE.paper }}
              >
                All-access — NZ${ALL_ACCESS.monthlyNzd}
                <span className="text-base" style={{ fontFamily: SPACE_MONO, color: PALETTE.muted }}>
                  {' '}
                  /mo
                </span>
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: '#C9C5BB' }}>
                Every agent we make — now and as we add them. The simplest way in if you want more
                than a handful.
              </p>
            </div>
            <Link
              href="/agents/checkout?plan=all_access"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
            >
              Get all-access
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        ) : null}

        {/* Team bundles — kept for SMEs, not the lead */}
        <div
          className="mt-5 flex flex-col gap-2 rounded-[20px] border bg-white px-6 py-5 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: PALETTE.hairline }}
        >
          <p className="text-sm" style={{ color: PALETTE.body }}>
            <span className="font-bold" style={{ color: PALETTE.ink }}>
              Building a team?
            </span>{' '}
            Bundle 5, 10 or 20 agents at a lower per-seat rate.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-bold hover:opacity-70"
            style={{ color: PALETTE.ink }}
          >
            Talk to us
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <p className="mt-10 text-sm" style={{ color: PALETTE.muted }}>
          Prices in NZD, GST exclusive. The first {FREE_MESSAGE_LIMIT} messages with any agent are
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
