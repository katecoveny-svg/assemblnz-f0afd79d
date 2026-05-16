import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { agentsForKete } from '@/lib/agents';
import { KETES } from '@/lib/kete';
import { KeteMarketplaceRail } from '@/components/site/KeteMarketplaceRail';
import { TeReo } from '@/components/site/TeReo';

export const metadata: Metadata = {
  title: 'Kete',
  description:
    'Browse nine kete and their specialist agents. Each one runs the work and ends with an evidence pack.',
};

export default function KeteIndexPage() {
  return (
    <main className="paper-noise min-h-screen text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
            <TeReo title="basket">Kete</TeReo> marketplace
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <h1 className="font-display text-display-lg font-light">
                Browse the fleet.
              </h1>
              <p className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
                9 kete. 60+ specialist agents. Each one runs the work, ends with an evidence pack.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href="/industry-pack" className="cta-primary inline-flex h-12 items-center justify-center px-7">
                See Industry Pack
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pricing" className="btn-ghost inline-flex h-12 items-center justify-center px-7">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container space-y-16">
          {KETES.map((kete) => (
            <KeteMarketplaceRail
              key={kete.slug}
              kete={kete}
              agents={agentsForKete(kete.slug)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

