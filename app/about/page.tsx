import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { Eyebrow } from '@/components/site/Eyebrow';
import { LandscapeBand } from '@/components/site/LandscapeBand';

export const metadata: Metadata = {
  title: 'About',
  description:
    'assembl is an AI platform built in Aotearoa that solves the real reason AI adoption stalls in NZ businesses: not the technology, but trust and uptake.',
};

const HOW_IT_WORKS = [
  ['Agents draft it.', 'The slow, repetitive writing, done in seconds.'],
  ['You decide.', 'Nothing sends or publishes until a named person approves it.'],
  [
    'You get the receipts.',
    'Every output comes with an evidence pack — the sources used, the assumptions made, and who signed off.',
  ],
] as const;

// The adoption ladder — the commercial moat, stated plainly. One public win
// becomes a private branded tool, then a repeatable internal system.
const ADOPTION_PATH = [
  [
    'Public tool',
    'Anyone can open a HAPAI tool and get a reviewable result in minutes. No login, no prompting, no new app to learn.',
  ],
  [
    'Private, branded tool',
    'A tool that proves useful becomes a private, branded version for that team — same job, their rules, their data.',
  ],
  [
    'Repeatable internal system',
    'One win turns into a system the team reaches for every week — the single workflow that quietly compounds.',
  ],
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF7F2] text-[color:var(--text-primary)]">
      {/* Hero — the one founder portrait site-wide lives here. */}
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16 xl:px-16">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14 xl:gap-20">
            <SectionReveal>
              <Eyebrow label="About assembl" />
              <h1 className="mt-5 font-display text-display-xl font-light leading-[1.04] text-[color:var(--text-primary)]">
                Mahi that earns <em className="not-italic text-[color:var(--assembl-pounamu)]">its proof.</em>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
                Document-heavy work eats people’s days. The reports, the customs entries, the
                notices, the compliance paperwork — hours that should go to the actual job, or home
                to your whānau.
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
                assembl takes that load off. Specialist agents write the first draft; someone on your
                team checks it and signs it off. Every piece of work comes with an evidence pack — a
                plain record of how it was made, so you can trust it, file it, or hand it on.
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

      {/* What assembl is — Kate's locked positioning, verbatim. */}
      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[#F4EFE7]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <div className="mx-auto max-w-[68ch]">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">What assembl is</p>
              <p className="mt-6 text-xl leading-[1.6] text-[color:var(--text-primary)] md:text-2xl">
                assembl is an AI platform built in Aotearoa that solves the real reason AI adoption
                stalls in NZ businesses: not the technology, but trust and uptake. Instead of asking
                teams to learn prompting and switch tools, assembl ships HAPAI — a public library of
                single-purpose tools that each do one ordinary job (a customs entry draft, a Food Act
                temperature log, a meeting record, an admin-cost calculator) and produce a reviewable
                result in minutes.
              </p>
              <p className="mt-6 text-xl leading-[1.6] text-[color:var(--text-primary)] md:text-2xl">
                Every output is draft-only and reviewed by a named human before it ships, with an
                auditable trail (our “Mana Receipts” provenance layer) and privacy designed to the
                Privacy Act 2020 including IPP 3A. The adoption path is deliberate: a public tool
                proves useful, then becomes a private, branded tool for that team — turning a single
                win into a repeatable internal system.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* The adoption path — the commercial moat, made concrete. */}
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">The adoption path</p>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-light leading-tight text-[color:var(--text-primary)] md:text-4xl">
              A single win becomes a system the team keeps.
            </h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
              {ADOPTION_PATH.map(([title, body], i) => (
                <li key={title} className="border-t border-[rgba(35,33,31,0.14)] pt-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-light text-[color:var(--text-primary)]">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[#5F5A55] md:text-lg">{body}</p>
                </li>
              ))}
            </ol>
          </SectionReveal>
        </div>
      </section>

      {/* Founder note — text only; the portrait lives in the hero above. */}
      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[#F4EFE7]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <div className="mx-auto max-w-[68ch]">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#625A52]">From the founder</p>
              <p className="mt-5 font-display text-3xl font-light leading-tight text-[color:var(--text-primary)] md:text-4xl">
                I started assembl to give people their time back — for the work that matters, and
                the life around it.
              </p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#625A52]">
                Kate Hudson, founder
              </p>

              <div className="mt-12">
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
          </SectionReveal>
        </div>
      </section>

      {/* Pilot Sprint CTA — full-width, no portrait. */}
      <section>
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24 xl:px-16">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
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
          </SectionReveal>
        </div>
      </section>

      {/* "Built in Aotearoa" — full-bleed Bay of Islands band before the footer. */}
      <LandscapeBand />
    </main>
  );
}
