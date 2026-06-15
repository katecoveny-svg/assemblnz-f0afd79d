import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { Eyebrow } from '@/components/site/Eyebrow';

export const metadata: Metadata = {
  title: 'About',
  description:
    'assembl takes the document-heavy admin off New Zealand teams. Specialist agents write the first draft, a named person signs it off, and every piece of work comes with an evidence pack.',
};

const HOW_IT_WORKS = [
  ['Agents draft it.', 'The slow, repetitive writing, done in seconds.'],
  ['You decide.', 'Nothing sends or publishes until a named person approves it.'],
  [
    'You get the receipts.',
    'Every output comes with an evidence pack — the sources used, the assumptions made, and who signed off.',
  ],
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF7F2] text-[color:var(--text-primary)]">
      {/* Hero */}
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16 xl:px-16">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14 xl:gap-20">
            <SectionReveal>
              <Eyebrow label="About assembl" />
              <h1 className="mt-5 font-display text-display-xl font-light leading-[1.04] text-[color:var(--text-primary)]">
                Mahi that earns <em className="italic text-[color:var(--assembl-pounamu)]">its proof.</em>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
                Document-heavy work eats people’s days. The reports, the customs entries, the
                notices, the compliance paperwork — hours that should go to the actual job, or home
                to your whānau.
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
                assembl takes that load off. Specialist agents write the first draft of the admin. Someone on your
                team checks it and signs it off. And every piece of work comes with an evidence pack
                — a plain record of how it was made, so you can trust it, file it, or hand it to
                whoever asks.
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

      {/* Founder note */}
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
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">From the founder</p>
                <p className="mt-5 font-display text-3xl font-light italic leading-tight text-[color:var(--text-primary)] md:text-4xl">
                  I started assembl to give people their time back — for the work that matters, and
                  the life around it.
                </p>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#625A52]">
                  Kate Hudson, founder
                </p>

                <div className="mt-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">How it works</p>
                  <ul className="mt-5 space-y-4">
                    {HOW_IT_WORKS.map(([label, body]) => (
                      <li key={label} className="text-base leading-relaxed text-[#5F5A55] md:text-lg">
                        <span className="font-medium text-[color:var(--text-primary)]">{label}</span> {body}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-base leading-relaxed text-[#5F5A55] md:text-lg">
                    <span className="font-medium text-[color:var(--text-primary)]">Built for Aotearoa.</span> NZ
                    law, council and sector rules, and tikanga are in from the start, not bolted on.
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Pilot Sprint CTA */}
      <section>
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 xl:gap-20">
              <div>
                <h2 className="font-display text-4xl font-light leading-none text-[color:var(--text-primary)] md:text-6xl">
                  Mahi that earns its proof. Built in Aotearoa.
                </h2>
                <div className="mt-10">
                  <Link
                    href="/pilot-sprint"
                    className="cta-primary inline-flex h-12 items-center px-7 text-sm md:h-14 md:px-9 md:text-base"
                  >
                    Book a Pilot Sprint
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
