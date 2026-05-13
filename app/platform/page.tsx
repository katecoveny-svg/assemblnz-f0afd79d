import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { PRICING_NOTE } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Operator-as-platform',
  description:
    'assembl is the governance infrastructure for the hybrid services economy. NZ$1,490/month + $590 setup. Sovereign, NZ-built, evidence-ready, priced for a one-person practice.',
};

const INCLUDED = [
  'Full Iho governed router — build any workflow on top',
  'Mana Trust Layer — Kahu → Iho → Tā → Mahara → Mana governance pipeline',
  'AROHA — HR & Employment',
  'SIGNAL — Security (NZISM-aligned, hash-chained audit log)',
  'SENTINEL — Monitoring & uptime',
  'Privacy Act 2020 + AAAIP alignment out of the box',
  'SMS, WhatsApp & dashboard access (Unified Channel Gateway)',
  'Up to 2 kete · named team of 3 · 50 outputs / month',
  'Hybrid-services workflow templates (six archetypes)',
  'Evidence packs — branded, citable, audit-ready',
];

export default function PlatformPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(74, 165, 168, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative container py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Operator-as-platform
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                The governance layer
                <br />
                for the{' '}
                <em className="not-italic text-gradient-hero">hybrid services economy.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                If you run a practice that pairs a human professional with intelligent automation to deliver smaller,
                cheaper, more frequent services — legal, financial, learning, mental-health,
                family — Operator-as-platform is the SKU. Same pipeline as every assembl kete,
                no vertical bundle, your workflows on top.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/platform/hybrid-services"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See the six hybrid-service archetypes
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Talk to us
                </Link>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.4}>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                NZ$1,490 / month + $590 setup · 50 outputs / month · {PRICING_NOTE}
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                What’s included
              </p>
              <h2
                className="mt-4 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                The same governed pipeline.{' '}
                <em className="not-italic text-gradient-hero">Your workflows on top.</em>
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="glass-card-elevated mx-auto mt-14 max-w-3xl p-8 md:p-10">
              <ul className="space-y-3">
                {INCLUDED.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(74,165,168,0.12)] text-[color:var(--assembl-pounamu)]">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="text-sm leading-relaxed text-[color:var(--text-body)]">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Honest framing */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Honest framing
              </p>
              <h2
                className="mt-4 font-display leading-snug tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                We don’t have a pre-built kete for accounting firms, dev shops, B2B SaaS,
                consultancies, or law practices yet.{' '}
                <em className="not-italic text-gradient-hero">
                  If your operations are bespoke enough that an industry pack would feel like a
                  bad fit — this is the SKU.
                </em>
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                You get the same governed pipeline (Kahu → Iho → Tā → Mahara → Mana) and you
                wire it to <em>your</em> workflows. If you’re a hybrid-services operator (a
                human plus agents), we ship pre-built workflow templates so you’re not starting from
                a blank canvas.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-40">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 5rem)' }}
              >
                Bring the practice.{' '}
                <em className="not-italic text-gradient-hero">We bring the platform.</em>
              </h2>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Talk to us about Operator-as-platform
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pilot-sprint"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Or start with a Pilot Sprint
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
