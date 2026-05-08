import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FadeUp } from '@/components/motion/FadeUp';
import { KETES } from '@/lib/site-config';
import type { KeteSlug } from '@/lib/site-config';

/**
 * /kete/[slug] — dynamic sector page.
 * generateStaticParams pre-renders all 8 ketes at build time.
 * Per Interactive Web Canon §6: hero uses vesselHero (16:9 crop).
 * Accent tint applied via CSS custom property --kete-accent.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return KETES.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) return {};
  return {
    title: `${kete.name} · ${kete.industry} — assembl`,
    description: kete.tagline,
  };
}

export default async function KeteSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const kete = KETES.find((k) => k.slug === (slug as KeteSlug));

  if (!kete) notFound();

  const statusLabel = {
    pilot: 'Pilot live',
    shortly: 'Shortly',
    roadmap: 'Roadmap',
  }[kete.status];

  return (
    <>
      {/* Kete hero */}
      <section
        className="relative overflow-hidden bg-[color:var(--assembl-paper)] py-24 md:py-32"
        style={{ '--kete-accent': kete.accentTint } as React.CSSProperties}
        aria-label={`${kete.name} — ${kete.industry}`}
      >
        {/* Accent tint wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundColor: kete.accentTint }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-20">
            {/* Copy */}
            <FadeUp>
              <div className="flex items-center gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                  {kete.industry}
                </p>
                <span className="h-px w-4 bg-[color:var(--assembl-gold-thread)] opacity-60" />
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                    kete.status === 'pilot'
                      ? 'bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu)]'
                      : kete.status === 'shortly'
                      ? 'bg-[color:var(--assembl-mist)] text-[color:var(--text-secondary)]'
                      : 'bg-transparent text-[color:var(--text-tertiary)] ring-1 ring-[color:var(--assembl-gold-thread)] ring-opacity-40'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <h1
                className="mt-6 font-display leading-[0.96] tracking-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 4.4vw, 5rem)' }}
              >
                {kete.name}
              </h1>

              <p
                className="mt-4 font-display italic leading-snug text-[color:var(--text-secondary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)' }}
              >
                {kete.tagline}
              </p>

              <p className="mt-6 max-w-prose font-body text-[1.05rem] leading-relaxed text-[color:var(--text-body)]">
                {kete.body}
              </p>

              {kete.pilotClient && (
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  Pilot client · {kete.pilotClient}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 text-sm font-medium text-[#FAF7F2] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] md:text-base"
                >
                  Start a Pilot Sprint →
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
                >
                  How it works
                </Link>
              </div>
            </FadeUp>

            {/* Vessel hero image */}
            <FadeUp delay={0.15}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-xl">
                <Image
                  src={kete.vesselHero}
                  alt={`${kete.name} vessel — ${kete.industry}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Compliance section */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                COMPLIANCE POSTURE
              </p>
              <h2
                className="mt-6 font-display leading-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 3rem)' }}
              >
                Every output grounded in NZ legislation.
              </h2>
              <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-[color:var(--text-body)]">
                {kete.name} agents cite the Acts that govern {kete.industry.toLowerCase()} in New Zealand. Every draft includes the Act name, the relevant section, and the year of the legislation relied on. Nothing ships before a named person signs off.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['NZ Privacy Act 2020', 'MBIE guidance', 'Draft-only posture', 'Human sign-off'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)] ring-1 ring-[color:var(--assembl-gold-thread)] ring-opacity-40"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Navigation: back + CTA */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link
              href="/kete"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
            >
              ← All kete
            </Link>
            <Link
              href="/pilot-sprint"
              className="inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 text-sm font-medium text-[#FAF7F2] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] md:text-base"
            >
              Start a Pilot Sprint →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
