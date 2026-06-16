import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { KeteVesselCard } from '@/components/KeteVesselCard';
import { KETE_VESSEL_IMAGES } from '@/lib/brand-tokens';
import { TeReo } from '@/components/site/TeReo';

export const metadata: Metadata = {
  title: 'Kete packs',
  description:
    'Browse nine specialist kete packs. Each pack has agents, tools, workflows, review points, and evidence packs.',
};

export default function KeteIndexPage() {
  return (
    <main className="paper-noise min-h-screen text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
            <TeReo title="basket or kit">Kete</TeReo> packs · specialist kits
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <h1 className="font-display text-display-lg font-light">
                Choose the specialist pack.
              </h1>
              <p className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
                Kete means basket or kit. In assembl, each kete is a specialist
                pack for one operating area: construction, hospitality, freight,
                automotive, education, commerce, family operations, and more.
                Each pack includes agents, tools, workflows, review points, live
                knowledge, and evidence packs.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href="/industry-pack" className="cta-primary inline-flex h-12 items-center justify-center px-7">
                See kete pack pricing
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
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KETES.map((kete, i) => (
              <KeteVesselCard
                key={kete.slug}
                kete={kete}
                vesselSrc={KETE_VESSEL_IMAGES[kete.slug]}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
