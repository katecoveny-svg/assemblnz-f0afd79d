'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kete, KeteSlug } from '@/lib/kete';
import type { PearlLiveStats } from '@/lib/pearl-live';
import { AssemblConciergeWidget } from './AssemblConciergeWidget';
import { KeteRotator } from './KeteRotator';

interface HomePortalProps {
  ketes: Kete[];
  pearlLive: PearlLiveStats;
}

const HAPAI_TOOLS = [
  {
    name: 'Vessel studio.',
    description:
      'A quiet prompt builder for hero imagery. Composes branded vessel still-lifes via flux 1.1 pro on fal.ai.',
    href: '/hapai/vessel-studio/vessel-studio.html',
    image: '/og/og-assembl.png',
  },
  {
    name: 'Caption composer.',
    description:
      "LinkedIn, Instagram, X, Facebook captions tuned to each platform's native rhythm. In your voice, your length, your tone.",
    href: '/hapai/caption-composer/caption-composer.html',
    image: '/og/og-manaaki.png',
  },
  {
    name: 'Brief generator.',
    description:
      'Creative, pitch, and project briefs as a single-page PDF in your voice. Fill in eight fields, leave with a brief.',
    href: '/hapai/brief-generator/brief-generator.html',
    image: '/og/og-auaha.png',
  },
  {
    name: 'OG card studio.',
    description:
      'Branded 1200×630 social share cards. Headline, accent, kete vessel, downloadable in a click.',
    href: '/hapai/og-card-generator/og-card-generator.html',
    image: '/og/og-pikau.png',
  },
  {
    name: 'Tagline workshop.',
    description:
      'Generate tagline candidates across five styles. Save the ones that land. Download the shortlist.',
    href: '/hapai/tagline-workshop/tagline-workshop.html',
    image: '/og/og-hoko.png',
  },
] as const;

const PIPELINE_STEPS = [
  [
    '01',
    'KAHU',
    'A request lands. Kahu listens, transcribes, frames it. What is being asked, who is asking, what context already lives in your kete. The brief never starts blank.',
  ],
  [
    '02',
    'IHO',
    'The router. Picks the specialist agent for the work, the model for the job, the cultural pass. Privacy Act 2020, tikanga, Te Tiriti — checked here.',
  ],
  [
    '03',
    'TĀ',
    'The specialist agent drafts the work end to end. Every act, section, council document cited inline. Nothing invented. Nothing left unsourced.',
  ],
  [
    '04',
    'MAHARA',
    'Your named reviewer accepts, edits, or rejects. Their reasoning is preserved with the edit, so the next reviewer — or the auditor — can see why.',
  ],
  [
    '05',
    'MANA',
    'Sealed in an evidence pack. Hash chained. Timestamped. Filed against the contract. Forwarded to the inbox that has to read it.',
  ],
] as const;

const PRICING_ENTRY_POINTS = [
  [
    'PILOT SPRINT',
    '$5,000 + GST',
    'Bring one workflow. We map it, build the agent, set the review points, run a real job, seal it in an evidence pack. Ten working days. You leave with a working proof and a path forward.',
    'Book a pilot',
    '/book-a-pilot',
    '#2B6B57',
  ],
  [
    'INDUSTRY PACK',
    '$5,000 / month',
    'The full specialist fleet for your industry, plus HAPAI white-labelled to your organisation. Your wordmark, your voice. Twelve+ tools your team can open in thirty seconds.',
    'See industry packs',
    '/industry-pack',
    '#D4A853',
  ],
  [
    'TŌRO',
    '$29 / month',
    'The whānau navigator. School notices parsed. Gear lists drafted. The week ahead held in one place. Built for families, sized for a household.',
    'Try Tōro',
    '/kete/toro',
    '#23211F',
  ],
] as const;

const KETE_CARD_COPY: Record<KeteSlug, string> = {
  waihanga: 'RFIs, QA packs, site observations, consent compliance.',
  manaaki: 'Food safety, incident logs, guest responses, supplier comparisons.',
  pikau: 'Customs documentation, freight exceptions, carrier compliance.',
  arataki: 'WoF and CoF prep, CGA disclosures, fleet compliance trails.',
  auaha: 'Brand strategy, campaign concepts, creative reviews, asset trails.',
  ako: 'School notices, parent updates, assessment summaries, staff planning.',
  matauranga: 'Research synthesis, document comparison, source verification.',
  hoko: 'Customer responses, returns triage, supplier comparison, pricing review.',
  toro: 'School notices parsed. Gear lists. Meal plans. The week held in one place.',
};

const KETE_ACCENT_NAMES: Record<KeteSlug, string> = {
  waihanga: 'pounamu',
  manaaki: 'kōkōwai',
  pikau: 'kikorangi',
  arataki: 'karaka',
  auaha: 'kahurangi',
  ako: 'parauri',
  matauranga: 'pōuriuri',
  hoko: 'waiporoporo',
  toro: 'mangū',
};

export function HomePortal({ ketes }: HomePortalProps) {
  const [activeSlug, setActiveSlug] = useState<KeteSlug>('waihanga');
  const reduceMotion = useReducedMotion();
  const activeKete = useMemo(
    () => ketes.find((kete) => kete.slug === activeSlug) ?? ketes[0],
    [activeSlug, ketes],
  );
  const activeStyle = { '--kete-accent': activeKete.accent } as CSSProperties;

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
      style={activeStyle}
    >
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F4EFE7_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-80" />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,color-mix(in_srgb,var(--kete-accent)_16%,transparent),transparent_36%),linear-gradient(90deg,rgba(250,247,242,0.99)_0%,rgba(250,247,242,0.9)_52%,rgba(250,247,242,0.58)_100%)]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FAF7F2] to-transparent" aria-hidden />
        <motion.div
          className="absolute inset-y-0 left-0 w-2 bg-[color:var(--kete-accent)]"
          aria-hidden
          animate={reduceMotion ? undefined : { opacity: [0.7, 1] }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-none flex-col justify-center px-6 py-14 md:px-10 xl:px-14 2xl:px-20">
          <motion.div
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0.92, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/72 px-3 py-2 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)] shadow-sm backdrop-blur-md">
              BUILT IN AOTEAROA
            </p>
            <KeteRotator
              ketes={ketes}
              className="mt-6 md:mt-8"
              scale="immersive"
              activeSlug={activeSlug}
              onActiveSlugChange={setActiveSlug}
              body={(
                <p>
                  We help New Zealand teams run the work that has to be reviewed,
                  trusted, and explained later. The kind of work that survives an
                  audit, a board paper, an OIA request, three months from now.
                </p>
              )}
              actions={(
                <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
                  <Link
                    href="/book-a-pilot"
                    className="cta-primary inline-flex h-12 w-full items-center justify-center px-8 text-base sm:w-auto md:h-14"
                  >
                    Book a pilot
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/evidence-pack"
                    className="btn-ghost inline-flex h-12 w-full items-center justify-center bg-white/62 px-8 text-base backdrop-blur-md sm:w-auto md:h-14"
                  >
                    See an evidence pack
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
              )}
            />
          </motion.div>

        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1500px] gap-8 md:px-2 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              WHAT WE DO
            </p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              The work that doesn't survive a chatbot.
            </h2>
          </div>
          <div>
            <p className="max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Some work moves through your team fast and doesn't need a paper
              trail. Other work has to be reviewed by a named person, filed
              against a contract, sourced against legislation, and explained
              three months later when someone asks how it was done. assembl is
              built for the second kind. We run that work through specialist
              agents, route it past a named reviewer in your team, and seal the
              result in an evidence pack you can stand behind.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/how-it-works" className="cta-primary inline-flex h-12 items-center justify-center px-6">
                How it works
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/evidence-pack" className="btn-ghost inline-flex h-12 items-center justify-center px-6">
                See an evidence pack
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] bg-white/38 px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
              HAPAI · ADOPTION TOOLS
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              The team's first taste of agentic work.
            </h2>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Hāpai (te reo Māori): to lift up, to elevate. HAPAI is a library
              of single-purpose tools your team can open in thirty seconds. No
              prompting. No training. No platform switch. Each one does one job
              and produces work in your voice. Free. Bring your own API key.
              Twelve more tools inside the Industry Pack, branded to your
              organisation.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {HAPAI_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex min-h-[390px] flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:bg-white"
              >
                <span className="relative block aspect-[16/10] border-b border-[rgba(35,33,31,0.10)] bg-white">
                  <Image
                    src={tool.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="w-fit rounded-full bg-[color:var(--assembl-pounamu)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FAF7F2]">
                    LIVE
                  </span>
                  <span className="mt-5 block font-display text-2xl font-light italic leading-none">
                    {tool.name}
                  </span>
                  <span className="mt-4 block text-sm leading-relaxed text-[color:var(--text-body)]">
                    {tool.description}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                    Open the tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </span>
              </Link>
            ))}

            <Link
              href="/hapai"
              className="group flex min-h-[300px] flex-col justify-between rounded-[8px] border border-[rgba(43,107,87,0.28)] bg-[color:var(--assembl-pounamu)] p-6 text-[#FAF7F2] transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden />
              <span>
                <span className="block font-display text-4xl font-light italic leading-none text-[#FAF7F2]">
                  See the full library.
                </span>
                <span className="mt-4 block text-sm leading-relaxed text-[#FAF7F2]/82">
                  Five live now. Five more shipping this month.
                </span>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                  Open HAPAI <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              NINE KETE · NINE INDUSTRIES
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              A specialist team for every kind of work.
            </h2>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Each kete is a vessel. In assembl, it holds a specialist team —
              agents trained on the industry's regulations, policies, and
              patterns of work; review points where a named person signs off;
              evidence packs shaped for the audience that has to read them. Try
              any of the nine in the public chat. No signup.
            </p>
          </div>
          <KeteCardGrid
            ketes={ketes}
            activeSlug={activeSlug}
            onSelect={setActiveSlug}
            reduceMotion={reduceMotion}
          />
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] bg-white/40 px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            HOW IT WORKS
          </p>
          <h2 className="mt-4 max-w-5xl font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
            Five stages. Nothing ships until a person says so.
          </h2>
          <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
            Every workflow assembl runs moves through the same five stages. The
            pace changes. The shape does not. A named human in your team signs
            off before anything leaves.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {PIPELINE_STEPS.map(([number, title, body]) => (
              <article key={title} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                  {number} — {title}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {body}
                </p>
              </article>
            ))}
          </div>
          <Link href="/how-it-works" className="mt-8 inline-flex h-12 items-center rounded-[8px] bg-[color:var(--assembl-pounamu)] px-6 font-medium text-[#FAF7F2]">
            See the full pipeline <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              EVIDENCE PACK
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              Not just an answer. A record.
            </h2>
            <p className="mt-6 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Every workflow ends in a single document with the work and its
              working. Sources cited inline. Assumptions made explicit. Checks
              logged. Review notes attached. A timestamp on every step. A hash
              chain that proves nothing has been changed since the reviewer
              signed off. File it. Forward it. Footnote it. Hand it to your
              auditor, your insurer, your board.
            </p>
            <Link href="/evidence-pack" className="mt-8 inline-flex h-12 items-center rounded-[8px] bg-[color:var(--assembl-pounamu)] px-6 font-medium text-[#FAF7F2]">
              See an evidence pack <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white shadow-[0_24px_80px_rgba(35,33,31,0.10)]">
            <Image
              src="/og/og-assembl.png"
              alt="assembl evidence pack preview"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] bg-white/42 px-6 py-32 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            START HERE
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-2xl font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              Three ways in.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PRICING_ENTRY_POINTS.map(([name, price, body, cta, href, accent]) => (
              <article
                key={name}
                className="rounded-[8px] border border-[rgba(35,33,31,0.10)] border-t-[5px] bg-[color:var(--assembl-paper)] p-6"
                style={{ borderTopColor: accent }}
              >
                <h3 className="font-display text-4xl font-light italic leading-none">
                  {name}
                </h3>
                <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  {price}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {body}
                </p>
                <Link href={href} className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
          <Link href="/pricing" className="mt-8 inline-flex h-12 items-center justify-center rounded-[8px] border border-[rgba(35,33,31,0.14)] px-6 font-medium text-[color:var(--text-primary)]">
            See full pricing <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="bg-[color:var(--assembl-pounamu)] px-6 py-32 text-[#FAF7F2] md:px-12 md:py-40">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-8 text-center">
          <h2 className="max-w-4xl font-display text-[clamp(3rem,7vw,6rem)] font-normal italic leading-tight text-[#FAF7F2]">
            Bring one workflow. Leave with proof.
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-[#FAF7F2]/86 md:text-base">
            Ten working days. One job your team actually runs. An evidence pack
            you can hand to anyone.
          </p>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/book-a-pilot" className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#FAF7F2] px-6 font-medium text-[color:var(--assembl-pounamu)]">
              Book a pilot <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/hapai" className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#FAF7F2]/45 px-6 font-medium text-[#FAF7F2]">
              Try a HAPAI tool <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/evidence-pack" className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#FAF7F2]/45 px-6 font-medium text-[#FAF7F2]">
              See an evidence pack <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <AssemblConciergeWidget />
      </div>
    </main>
  );
}

function KeteCardGrid({
  ketes,
  activeSlug,
  onSelect,
  reduceMotion,
}: {
  ketes: Kete[];
  activeSlug: KeteSlug;
  onSelect: (slug: KeteSlug) => void;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Choose a kete">
      {ketes.map((kete) => {
        const active = kete.slug === activeSlug;
        return (
          <motion.div
            key={kete.slug}
            style={{ '--tile-accent': kete.accent } as CSSProperties}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <article
              onMouseEnter={() => onSelect(kete.slug)}
              className={[
                'group block min-h-[360px] overflow-hidden rounded-[8px] border bg-white/55 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
                active
                  ? 'border-[color:var(--tile-accent)] bg-white shadow-[0_8px_24px_rgba(35,33,31,0.08)]'
                  : 'border-[rgba(35,33,31,0.12)] bg-white/45 hover:border-[color:var(--tile-accent)] hover:bg-white/75',
              ].join(' ')}
              aria-current={active ? 'true' : undefined}
            >
              <span
                className="relative block aspect-[16/10] w-full overflow-hidden border-b border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)]"
                aria-hidden
              >
                <Image
                  src={kete.heroImage}
                  alt=""
                  fill
                  sizes="170px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ objectPosition: "50% 35%" }}
                />
                <span
                  className="absolute inset-x-0 top-0 h-1.5 bg-[color:var(--tile-accent)]"
                  aria-hidden
                />
              </span>
              <span className="block p-5">
                <span className="block font-display text-4xl font-light italic leading-none text-[color:var(--text-primary)]">
                  {kete.name} · {kete.industry}
                </span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                  {KETE_ACCENT_NAMES[kete.slug]}
                </span>
                <span className="mt-4 block min-h-[66px] text-sm leading-relaxed text-[color:var(--text-body)]">
                  {KETE_CARD_COPY[kete.slug]}
                </span>
                <span className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/kete/${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="inline-flex h-10 items-center rounded-[8px] bg-[color:var(--tile-accent)] px-4 text-sm font-medium text-white"
                  >
                    Learn more
                  </Link>
                  <Link
                    href={`/c/${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="inline-flex h-10 items-center rounded-[8px] border border-[rgba(35,33,31,0.12)] px-4 text-sm font-medium text-[color:var(--text-primary)]"
                  >
                    Try the chat
                  </Link>
                </span>
              </span>
            </article>
          </motion.div>
        );
      })}
    </div>
  );
}
