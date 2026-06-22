import type { Metadata } from 'next';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { PUBLIC_MARKETPLACE_AGENTS, DASH_MOTIF, PALETTE } from '@/lib/marketplace/agents';
import { AgentGrid } from '@/components/marketplace/AgentGrid';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

export const metadata: Metadata = {
  title: 'Agents — assembl',
  description:
    'Pick an agent, chat with it, install it on your phone. A shelf of NZ-built agents for whānau, work, and admin. Every reply is a draft for a human to check.',
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
            A shelf of NZ-built agents for the jobs you keep putting off — whānau, work, and admin.
            Open one, talk to it, keep the ones that earn their place.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold" style={{ color: PALETTE.ink }}>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} style={{ color: PALETTE.gold }} aria-hidden /> 20 agents, ready now
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

      {/* Grid */}
      <section className="px-5 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <AgentGrid agents={PUBLIC_MARKETPLACE_AGENTS} />
        </div>
      </section>

      <MarketplaceFooter />
    </div>
  );
}
