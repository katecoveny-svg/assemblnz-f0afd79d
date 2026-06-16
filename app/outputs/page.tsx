import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { OUTPUTS } from '@/lib/outputs/catalogue';
import { SectionReveal } from '@/components/SectionReveal';
import { OutputsBrowser } from './OutputsBrowser';

export const metadata: Metadata = {
  title: 'Outputs — every named thing assembl produces',
  description:
    'Browse the assembl output catalogue: named deliverables, kete by kete. Producer statements, food control plan packs, customs entry drafts, CGA remedy memos — each built on NZ legislation and sealed with a downloadable evidence pack.',
  openGraph: {
    title: 'Outputs — every named thing assembl produces',
    description:
      'Named deliverables across nine kete and the HAPAI tools. Filter by industry, output type, framework, and channel.',
    type: 'website',
    url: 'https://www.assembl.co.nz/outputs',
    siteName: 'assembl',
    images: [
      {
        url: '/og/og-evidence-pack.png',
        width: 1200,
        height: 630,
        alt: 'assembl — the output catalogue.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outputs — every named thing assembl produces',
    description:
      'Browse named assembl deliverables, kete by kete. Built on NZ law.',
    images: ['/og/og-evidence-pack.png'],
  },
  alternates: { canonical: 'https://www.assembl.co.nz/outputs' },
};

export const revalidate = 3600;

export default function OutputsPage() {
  const liveToolCount = OUTPUTS.filter((o) => o.toolHref).length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src="/img/kete/home-vessel-pounamu.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
            style={{ objectPosition: '70% 30%' }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 72% 18%, rgba(43,107,87,0.20) 0%, transparent 55%), radial-gradient(ellipse at 18% 72%, rgba(212,168,83,0.12) 0%, transparent 55%)',
          }}
        />
        <div className="container py-20 lg:py-28">
          <div className="mx-auto max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              The catalogue · {OUTPUTS.length} named outputs
            </span>
            <h1 className="mt-5 font-display text-display-xl">
              Every named thing{' '}
              <span className="text-gradient-hero">assembl produces.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Not &ldquo;we draft replies and build evidence packs&rdquo; — the actual
              list. Across nine kete and the HAPAI tools, here is each named output, what
              it is, the NZ legislation it stands on, and how it reaches you. Every
              workflow is drafted for a named reviewer and ends in a downloadable evidence
              pack — a bundle of PDFs you can show a regulator, an auditor, or a client.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              <span>9 kete + cross-cutting</span>
              <span aria-hidden>·</span>
              <span>{liveToolCount} runnable right now</span>
              <span aria-hidden>·</span>
              <span>Built on NZ law</span>
            </div>
          </div>
        </div>
      </section>

      {/* Counter-position note */}
      <section className="relative">
        <div className="container pb-10">
          <div className="mx-auto max-w-7xl">
            <SectionReveal>
              <div className="rounded-card border border-[rgba(43,107,87,0.22)] bg-[color:var(--assembl-pounamu-paper)]/50 p-6 md:p-7">
                <p className="text-body-md text-[color:var(--text-body)]">
                  Generic template lists are conversational and location-neutral —
                  &ldquo;meeting minutes&rdquo;, &ldquo;empathy map&rdquo;. This one is
                  specific, regulated, and built for Aotearoa. Filter by{' '}
                  <span className="text-[color:var(--text-primary)]">Privacy Act 2020</span>,{' '}
                  <span className="text-[color:var(--text-primary)]">HSWA</span>,{' '}
                  <span className="text-[color:var(--text-primary)]">the Building Act</span>,
                  or{' '}
                  <span className="text-[color:var(--text-primary)]">Fair Trading</span>{' '}
                  and see exactly which outputs are for your industry.
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Browser (filters + grouped results) */}
      <Suspense
        fallback={
          <div className="container pb-24">
            <p className="mx-auto max-w-7xl font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Loading the catalogue…
            </p>
          </div>
        }
      >
        <OutputsBrowser />
      </Suspense>

      {/* Closing CTA */}
      <section className="relative">
        <div className="container pb-24">
          <div className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12">
            <h2 className="font-display text-display-md">
              See one of these drafted on your own work.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              A Pilot Sprint — NZ$5,000 + GST for two weeks — takes one of your real
              workflows and produces the output, reviewed and sealed with proof, by Friday.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pilot-sprint"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book a Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/kete"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Browse the kete packs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
