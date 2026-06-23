import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AGENT_PLANS, FREE_MESSAGE_LIMIT, PER_AGENT_PRICE_NZD } from '@/lib/billing/agent-pricing';
import { PALETTE, DASH_MOTIF } from '@/lib/marketplace/agents';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

export const metadata: Metadata = {
  title: 'Agent pricing — assembl',
  description:
    'Flat per-agent pricing. The first 3 messages with any agent are free. Then NZ$15/mo per agent, or pick a bundle.',
};

const DISPLAY: React.CSSProperties = {
  fontFamily: 'var(--mk-display), sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.02em',
};

/** Per-agent equivalent for a bundle, e.g. "$10/agent". */
function perAgentLine(monthlyNzd: number, count: number | null): string | null {
  if (!count || count <= 1) return null;
  const each = monthlyNzd / count;
  const pretty = Number.isInteger(each) ? each.toString() : each.toFixed(2).replace(/0$/, '');
  return `$${pretty}/agent`;
}

export default function AgentPricingPage() {
  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <span
          className="mk-mono text-[12px] font-bold uppercase tracking-[0.16em]"
          style={{ color: PALETTE.gold }}
        >
          Pricing
        </span>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl" style={{ ...DISPLAY, color: PALETTE.ink }}>
          One flat price per agent.
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
          Try any agent free — the first {FREE_MESSAGE_LIMIT} messages are on us. Keep one for
          NZ${PER_AGENT_PRICE_NZD}/mo, or pick a bundle and save. Cancel any time.
        </p>

        <div className="mt-6 h-1.5 w-full rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENT_PLANS.map((plan) => {
            const each = perAgentLine(plan.monthlyNzd, plan.agentCount);
            const featured = plan.id === 'bundle_10';
            return (
              <div
                key={plan.id}
                className="relative flex flex-col rounded-[26px] border bg-white p-6"
                style={{
                  borderColor: featured ? PALETTE.canary : PALETTE.hairline,
                  boxShadow: featured ? `0 24px 60px ${PALETTE.canary}33` : undefined,
                }}
              >
                {featured ? (
                  <span
                    className="mk-mono absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
                  >
                    Most popular
                  </span>
                ) : null}

                <h2 className="text-2xl" style={{ ...DISPLAY, color: PALETTE.ink }}>
                  {plan.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl" style={{ ...DISPLAY, color: PALETTE.ink }}>
                    NZ${plan.monthlyNzd}
                  </span>
                  <span className="text-sm" style={{ color: PALETTE.muted }}>
                    /mo
                  </span>
                  {each ? (
                    <span
                      className="mk-mono ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold"
                      style={{ backgroundColor: PALETTE.cream, color: PALETTE.gold }}
                    >
                      {each}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                  {plan.summary}
                </p>

                <ul className="mt-4 space-y-2 text-sm" style={{ color: PALETTE.body }}>
                  <Feature>
                    {plan.agentCount == null
                      ? 'Every agent — now and as we add them'
                      : plan.agentCount === 1
                        ? 'One agent of your choice'
                        : `Pick any ${plan.agentCount} agents`}
                  </Feature>
                  <Feature>Unlimited messages</Feature>
                  <Feature>Drafts only — you stay in control</Feature>
                </ul>

                <Link
                  href={`/agents/checkout?plan=${plan.id}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition hover:brightness-95"
                  style={
                    featured
                      ? { backgroundColor: PALETTE.canary, color: PALETTE.ink }
                      : { border: `1px solid ${PALETTE.ink}`, color: PALETTE.ink }
                  }
                >
                  {plan.agentCount == null ? 'Get All-Access' : 'Choose agents'}
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm" style={{ color: PALETTE.muted }}>
          Prices in NZD, GST exclusive. Every reply is a draft for a human to check before it is
          sent, filed, or lodged. Not legal, financial, or medical advice.
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
