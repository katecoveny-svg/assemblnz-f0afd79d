import type { Metadata } from 'next';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { PUBLIC_MARKETPLACE_AGENTS, PALETTE } from '@/lib/marketplace/agents';
import { AgentGrid } from '@/components/marketplace/AgentGrid';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

export const metadata: Metadata = {
  title: 'Agents — assembl',
  description:
    'Pick an agent, chat with it, install it on your phone. A shelf of NZ-built agents for whānau, work, and admin. Every reply is a draft for a human to check.',
};

export default function AgentsMarketplacePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      {/* Hero */}
      <section className="px-5 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <p
            className="text-sm font-semibold uppercase tracking-[0.18em]"
            style={{ color: PALETTE.gold }}
          >
            The agent shelf
          </p>
          <h1
            className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl"
            style={{ color: PALETTE.forest }}
          >
            Pick an agent. Chat with it. Install it on your phone.
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-relaxed"
            style={{ color: PALETTE.forest, opacity: 0.8 }}
          >
            A shelf of NZ-built agents for the jobs you keep putting off — whānau, work, and admin.
            Open one, talk to it, keep the ones that earn their place.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: PALETTE.forest }}>
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
