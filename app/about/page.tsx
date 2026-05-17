import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Quiet intelligence for New Zealand teams doing document-heavy, trust-sensitive work.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF7F2] text-[color:var(--text-primary)]">
      {/* Hero — real HTML headline + founder portrait. Text paints with the first
          byte, eliminating the blank-on-load symptom the old image-only hero had. */}
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16 xl:px-16">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14 xl:gap-20">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">
                About assembl
              </p>
              <h1 className="mt-5 font-display text-4xl font-light leading-[1.02] text-[color:var(--text-primary)] md:text-6xl xl:text-7xl">
                Quiet intelligence for the work that matters.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
                assembl is built for New Zealand teams doing document-heavy,
                trust-sensitive work — councils, builders, freight brokers, hospitality
                operators, schools, knowledge workers. Specialist agents draft. A named
                person reviews. Every output ships with an evidence pack.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#F4EFE7] shadow-[0_24px_70px_rgba(35,33,31,0.10)]">
                <Image
                  src="/img/about/kate-hudson-portrait-tan-blazer-art.webp"
                  alt="Kate Hudson, founder of assembl"
                  fill
                  priority
                  sizes="(min-width: 1024px) 600px, 100vw"
                  quality={82}
                  className="object-cover"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Principles — HTML version of the 9-card grid content. Canon labels only,
          no "AI" word, accessible and editable. */}
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">
              What we do
            </p>
            <h2 className="mt-5 max-w-3xl font-display text-3xl font-light leading-[1.05] text-[color:var(--text-primary)] md:text-5xl">
              We help NZ organisations remove repetitive work and prove real impact.
            </h2>
          </SectionReveal>
          <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-10">
            <SectionReveal delay={0.05}>
              <article>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#625A52]">
                  Evidence first
                </p>
                <p className="mt-3 text-base leading-relaxed text-[#5F5A55]">
                  Built on trust and transparency. Every output ships with sources,
                  assumptions, and a decision trail you can file or forward.
                </p>
              </article>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <article>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#625A52]">
                  Human-centred
                </p>
                <p className="mt-3 text-base leading-relaxed text-[#5F5A55]">
                  Agents draft, your team decides. Nothing publishes, sends, or executes
                  without a named human review.
                </p>
              </article>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <article>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#625A52]">
                  Local impact
                </p>
                <p className="mt-3 text-base leading-relaxed text-[#5F5A55]">
                  Proudly Aotearoa-grounded. NZ law, councils, sector expectations, and
                  tikanga wired into the substrate.
                </p>
              </article>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Founder note panel — existing copy, paired with second portrait */}
      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[#F4EFE7]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14 xl:gap-20">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] shadow-[0_18px_56px_rgba(35,33,31,0.10)]">
                <Image
                  src="/img/about/kate-hudson-portrait-blue-shirt.webp"
                  alt="Kate Hudson, founder of assembl"
                  fill
                  sizes="(min-width: 1024px) 600px, 100vw"
                  quality={82}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">
                  From the founder
                </p>
                <h2 className="mt-5 font-display text-4xl font-light leading-none text-[color:var(--text-primary)] md:text-6xl">
                  Built in Aotearoa. For the work that needs a trail.
                </h2>
                <div className="mt-6 space-y-5 text-base leading-relaxed text-[#5F5A55] md:text-lg">
                  <p>
                    assembl exists because document-heavy teams need more than fast
                    drafts. They need work that can be reviewed, trusted, filed,
                    forwarded, and explained later.
                  </p>
                  <p>
                    Every kete is designed around a specific operational context, but the
                    standard underneath is shared: human review, clear sources, and
                    evidence packs that show what happened.
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#625A52]">
                    Kate Hudson, founder
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Pilot sprint CTA — paired with third portrait */}
      <section>
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 xl:gap-20">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                  Pilot sprint
                </p>
                <h3 className="mt-5 font-display text-4xl font-light leading-none text-[color:var(--text-primary)] md:text-6xl">
                  See assembl work on a real workflow.
                </h3>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                  Bring one live, messy workflow. assembl turns it into draft-ready
                  outputs with the evidence pack attached.
                </p>
                <div className="mt-10">
                  <Link
                    href="/pilot-sprint"
                    className="cta-primary inline-flex h-12 items-center px-7 text-sm md:h-14 md:px-9 md:text-base"
                  >
                    Book a pilot
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] shadow-[0_18px_56px_rgba(35,33,31,0.10)]">
                <Image
                  src="/img/about/kate-hudson-portrait-sweater-chair.webp"
                  alt="Kate Hudson, founder of assembl"
                  fill
                  sizes="(min-width: 1024px) 540px, 100vw"
                  quality={82}
                  className="object-cover"
                />
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
