import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { StickyScrollNarrative } from '@/components/StickyScrollNarrative';
import { ketes, pipelineStages } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'The marketplace is the front door. Underneath it, every assembl workflow runs through the same five-stage pipeline.',
};

const STAGE_MEDIA = [
  {
    src: ketes.waihanga.wide,
    alt: 'Kahu intent capture — Waihanga vessel on warm paper.',
  },
  {
    src: ketes.auaha.wide,
    alt: 'Iho routing — Auaha vessel on warm paper.',
  },
  {
    src: ketes.hoko.wide,
    alt: 'Tā execution — Hoko vessel on warm paper.',
  },
  {
    src: ketes.matauranga.wide,
    alt: 'Mahara review — Mātauranga vessel on warm paper.',
  },
  {
    src: '/img/kete/home-vessel-pounamu.jpg',
    alt: 'Mana sign-off — assembl evidence vessel on warm paper.',
  },
] satisfies ReadonlyArray<{ src: string; alt: string }>;

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 60%)',
          }}
        />
        <div className="relative container py-16 md:py-20 xl:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                02 — How it works
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(3.6rem, 6.5vw, 8rem)' }}
              >
                Five stages.
                <br />
                Nothing ships
                <br />
                <em className="not-italic text-gradient-hero">until a person says so.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-3xl text-base leading-relaxed text-[color:var(--text-body)] md:text-xl">
                The marketplace is the front door. Underneath it, every workflow
                runs through the same five-stage pipeline. Most teams never need
                to think about it — your team picks the workflow, the agent does
                the draft, your reviewer signs off. But here&apos;s what&apos;s happening
                under the surface, in case you want to know.
                <span className="font-display italic text-[color:var(--text-primary)]">
                  {' '}Kahu, Iho, Tā, Mahara, Mana.
                </span>{' '}
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3">
                {pipelineStages.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="rounded-full border border-[rgba(35,33,31,0.18)] bg-white/40 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                      <span className="text-[color:var(--text-secondary)]">{s.number}</span>{' '}
                      {s.title}
                    </span>
                    {i < pipelineStages.length - 1 && (
                      <span className="text-[color:var(--text-secondary)]" aria-hidden>
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* The 5 stages — sticky-side narrative.
          frameAspect=16/10 matches the wide kete hero source; the default
          4/5 portrait was cropping the vessel to a narrow centre column. */}
      <section className="relative py-8 md:py-10">
        <StickyScrollNarrative
          stages={pipelineStages}
          media={STAGE_MEDIA}
          frameAspect="aspect-[16/10]"
        />
      </section>

      {/* CTA */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-40">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Five stages.{' '}
                <em className="not-italic text-gradient-hero">One evidence pack.</em>
              </h2>
              <p className="mt-8 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                See what comes out the other end.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/evidence-pack"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See the evidence pack
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pilot-sprint"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Book a Pilot Sprint
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
