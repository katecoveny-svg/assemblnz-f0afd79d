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
      <h1 className="sr-only">About assembl</h1>
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10 md:py-12 xl:px-16">
          <SectionReveal>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#F4EFE7] shadow-[0_24px_70px_rgba(35,33,31,0.10)]">
              <Image
                src="/img/about/about-hero-quiet-intelligence.png"
                alt="Quiet intelligence for the work that matters."
                fill
                priority
                sizes="(min-width: 1280px) 1400px, 100vw"
                quality={78}
                className="object-cover"
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16 xl:px-16">
          <SectionReveal>
            <div className="relative aspect-square overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#F4EFE7] shadow-[0_18px_56px_rgba(35,33,31,0.08)]">
              <Image
                src="/img/about/about-grid-9card.png"
                alt="assembl overview: principles, safeguards, founder note, and nine kete."
                fill
                priority
                sizes="(min-width: 1280px) 1400px, 100vw"
                quality={78}
                className="object-cover"
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="border-y border-[rgba(35,33,31,0.08)] bg-[#F4EFE7]">
        <div className="container py-16 md:py-24">
          <SectionReveal>
            <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">
                  From the founder
                </p>
                <h2 className="mt-5 font-display text-4xl font-light leading-none text-[color:var(--text-primary)] md:text-6xl">
                  Built in Aotearoa. For the work that needs a trail.
                </h2>
              </div>
              <div className="space-y-5 text-base leading-relaxed text-[#5F5A55] md:text-lg">
                <p>
                  assembl exists because document-heavy teams need more than fast drafts.
                  They need work that can be reviewed, trusted, filed, forwarded, and
                  explained later.
                </p>
                <p>
                  Every kete is designed around a specific operational context, but the
                  standard underneath is shared: human review, clear sources, and evidence
                  packs that show what happened.
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#625A52]">
                  Kate Hudson, founder
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section>
        <div className="container py-16 md:py-24">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Pilot sprint
              </p>
              <h3 className="mt-5 font-display text-4xl font-light leading-none text-[color:var(--text-primary)] md:text-6xl">
                See assembl work on a real workflow.
              </h3>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Bring one live, messy workflow. assembl turns it into draft-ready outputs
                with the evidence pack attached.
              </p>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:h-14 md:px-9 md:text-base"
                >
                  Book a pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
