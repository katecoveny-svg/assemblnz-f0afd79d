import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AgentMarketplace } from '@/components/AgentMarketplace';
import { SectionReveal } from '@/components/SectionReveal';
import { AGENTS } from '@/lib/agents';

export const metadata: Metadata = {
  title: 'Agents',
  description:
    'Choose your agents. Specialist NZ-grounded agents across seven kete. Subscribe, pay per output, or pay per resolution — your choice.',
};

const TOTAL_AGENTS = AGENTS.length;

export default function AgentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 60%)',
          }}
        />
        <div className="container py-32 md:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <span className="badge-gold inline-flex">Agent marketplace</span>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1 className="mt-6 font-display text-4xl md:text-6xl">
                Choose your{' '}
                <em className="not-italic text-gradient-hero">agents</em>.
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mt-6 text-base text-[color:var(--text-body)] md:text-lg">
                {TOTAL_AGENTS} specialist agents across seven kete. Each one grounded in current
                NZ legislation. Pick the ones you need — assembl bills monthly per kete, or one-off
                per output, or per resolution. Three ways to buy, your choice.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#marketplace"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Browse all agents
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </a>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  See pricing
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section id="marketplace" className="relative scroll-mt-20 pb-32">
        <div className="container">
          <AgentMarketplace />
        </div>
      </section>
    </>
  );
}
