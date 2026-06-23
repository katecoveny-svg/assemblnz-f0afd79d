import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { PUBLIC_MARKETPLACE_AGENTS, DASH_MOTIF, PALETTE } from '@/lib/marketplace/agents';
import { AgentGrid } from '@/components/marketplace/AgentGrid';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

const FEATURED = PUBLIC_MARKETPLACE_AGENTS.find((a) => a.featured);

export const metadata: Metadata = {
  title: 'Agents — assembl',
  description:
    'Pick an agent, chat with it, install it on your phone. A shelf of NZ-built agents for family, work, and admin. Every reply is a draft for a human to check.',
};

export default function AgentsMarketplacePage() {
  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      {/* Hero */}
      <section className="px-5 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <p
            className="mk-mono text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PALETTE.gold }}
          >
            The agent shelf
          </p>
          <h1
            className="mt-3 max-w-3xl text-4xl leading-[1.02] md:text-6xl"
            style={{ fontFamily: 'var(--mk-display), sans-serif', fontWeight: 900, letterSpacing: '-0.03em', color: PALETTE.ink }}
          >
            Pick an agent. Chat with it. Install it on your phone.
          </h1>
          {/* dash motif underline */}
          <div className="mt-5 h-1.5 w-40 rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />
          <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
            A shelf of NZ-built agents for the jobs you keep putting off — family, work, and admin.
            Open one, talk to it, keep the ones that earn their place.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold" style={{ color: PALETTE.ink }}>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} style={{ color: PALETTE.gold }} aria-hidden /> {PUBLIC_MARKETPLACE_AGENTS.length}{' '}
              agents, ready now
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap size={16} style={{ color: PALETTE.gold }} aria-hidden /> Free to try
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: PALETTE.gold }} aria-hidden /> Drafts you review,
              data in Sydney
            </span>
          </div>
        </div>
      </section>

      {/* Featured — Atlas, the free coach, leads the shelf */}
      {FEATURED ? (
        <section className="px-5 pb-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/atlas"
              className="group flex flex-col gap-5 rounded-[28px] border p-6 transition hover:-translate-y-0.5 md:flex-row md:items-center md:p-8"
              style={{
                borderColor: PALETTE.hairline,
                backgroundColor: PALETTE.ink,
                boxShadow: '0 22px 50px rgba(58,56,50,.22)',
              }}
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(255,212,42,0.16)' }}
              >
                <AgentIcon name={FEATURED.icon} className="h-9 w-9" tone="ink" />
              </div>
              <div className="flex-1">
                <p
                  className="mk-mono text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: PALETTE.canary }}
                >
                  Start here · free
                </p>
                <h2
                  className="mt-2 text-2xl md:text-3xl"
                  style={{ fontFamily: 'var(--mk-display), sans-serif', fontWeight: 900, letterSpacing: '-0.02em', color: PALETTE.paper }}
                >
                  New to this? Talk to Atlas.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgba(255,247,236,0.82)' }}>
                  The free AI coach. It maps your week, points you to the agents that fit, and tells you straight
                  where AI will not help. Voice-enabled, no message cap.
                </p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-bold transition group-hover:brightness-95 md:self-center"
                style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
              >
                <MessageCircle size={16} aria-hidden /> Meet Atlas
                <ArrowRight size={15} aria-hidden />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* Grid */}
      <section className="px-5 pb-20 pt-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <AgentGrid agents={PUBLIC_MARKETPLACE_AGENTS} />
        </div>
      </section>

      <MarketplaceFooter />
    </div>
  );
}
