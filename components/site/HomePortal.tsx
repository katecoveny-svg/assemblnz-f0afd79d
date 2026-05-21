'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kete, KeteSlug } from '@/lib/kete';
import { AssemblConciergeWidget } from './AssemblConciergeWidget';
import { EvidencePackPreview } from './EvidencePackPreview';
import { HapaiToolPreview } from '@/components/hapai/HapaiToolPreview';
import { HAPAI_TOOLS as ALL_HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';
import { MarketplaceStrip } from './MarketplaceStrip';
import { ThreeSteps } from './ThreeSteps';

interface HomePortalProps {
  ketes: Kete[];
}

const FEATURED_HAPAI_TOOL_SLUGS = ['study-helper', 'meeting-recorder', '9am-brief'] as const;

const FEATURED_HAPAI_TOOLS = FEATURED_HAPAI_TOOL_SLUGS.map((slug) =>
  ALL_HAPAI_TOOLS.find((tool) => tool.slug === slug),
).filter((tool): tool is (typeof ALL_HAPAI_TOOLS)[number] => Boolean(tool));

const HAPAI_CARD_STYLES = [
  {
    label: 'school night',
    glow: 'rgba(43,107,87,0.20)',
    wash: 'radial-gradient(circle at 22% 10%, rgba(255,255,255,0.94), transparent 34%), linear-gradient(135deg, rgba(232,239,233,0.82), rgba(250,247,242,0.70) 52%, rgba(217,168,90,0.16))',
  },
  {
    label: 'meeting room',
    glow: 'rgba(37,95,148,0.18)',
    wash: 'radial-gradient(circle at 80% 0%, rgba(255,255,255,0.96), transparent 38%), linear-gradient(135deg, rgba(239,234,225,0.92), rgba(250,247,242,0.72) 46%, rgba(220,232,225,0.62))',
  },
  {
    label: 'morning desk',
    glow: 'rgba(217,168,90,0.22)',
    wash: 'radial-gradient(circle at 18% 14%, rgba(255,255,255,0.96), transparent 36%), linear-gradient(135deg, rgba(250,247,242,0.86), rgba(232,239,233,0.70) 54%, rgba(217,168,90,0.22))',
  },
] as const;

const PRICING_ENTRY_POINTS = [
  [
    'PILOT SPRINT',
    '$5,000 + GST',
    'Bring one workflow. We map it, build the agent, set the review points, run a real job, seal it in an evidence pack. Ten working days. You leave with a working proof and a path forward.',
    'Book a pilot',
    '/pilot-sprint',
    '#2B6B57',
  ],
  [
    'INDUSTRY PACK',
    '$5,000 / month',
    'The full specialist fleet for your industry, plus HAPAI white-labelled to your organisation. Your wordmark, your voice. Practical tools your team can open in thirty seconds.',
    'See industry packs',
    '/industry-pack',
    '#D4A853',
  ],
  [
    'HAPAI',
    'Public tools',
    'Small useful tools for real work: meeting notes, travel desk, 9am Brief, share cards, food logs, captions, and more.',
    'Open HAPAI',
    '/hapai',
    '#23211F',
  ],
] as const;

const KETE_CARD_COPY: Record<KeteSlug, string> = {
  waihanga: 'RFI drafter, variation pack builder, site observation logger, and six more.',
  manaaki: 'Allergen incident logger, guest reply drafter, supplier comparison, and six more.',
  pikau: 'Customs entry drafter, freight exception report, carrier compliance review, and six more.',
  arataki: 'WoF readiness check, CGA disclosure generator, fleet defect log, and six more.',
  auaha: 'Caption batch composer, brief drafter, tagline shortlist, and six more.',
  ako: 'School notice rewriter, assessment summary, parent update drafter, and six more.',
  matauranga: 'Source verifier, document comparison, submission drafter, and six more.',
  hoko: 'Return triage, customer reply drafter, supplier comparison, and six more.',
  toro: 'School notice parser, weekly plan, gear list generator, and six more.',
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

function AssemblHeroObject({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="relative min-h-[430px] overflow-visible md:min-h-[600px] lg:min-h-[min(78svh,820px)]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_52%_42%,rgba(255,255,255,0.90),rgba(232,239,233,0.28)_32%,rgba(217,168,90,0.12)_58%,transparent_82%)]" aria-hidden />
      <div className="pointer-events-none absolute bottom-[13%] left-1/2 z-0 h-[18%] w-[72%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(35,33,31,0.24),rgba(35,33,31,0.07)_56%,transparent_78%)] blur-xl" aria-hidden />
      <motion.div
        className="pointer-events-none absolute inset-[-2%] z-20 drop-shadow-[0_48px_80px_rgba(35,33,31,0.18)]"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -8, 0],
                rotate: [-0.8, 0.8, -0.8],
                scale: [1, 1.018, 1],
              }
        }
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <Image
          src="/img/home/assembl-hero-vessel-original.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-contain opacity-[0.96] mix-blend-multiply"
          style={{
            maskImage:
              'radial-gradient(ellipse at center, black 58%, rgba(0,0,0,0.82) 70%, transparent 86%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 58%, rgba(0,0,0,0.82) 70%, transparent 86%)',
          }}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-30">
        {Array.from({ length: 11 }).map((_, index) => (
          <motion.span
            key={`hero-spark-${index}`}
            aria-hidden
            className="absolute h-px rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.96),0_0_34px_rgba(212,168,83,0.42)]"
            style={{
              left: `${18 + index * 6.7}%`,
              top: `${18 + (index % 5) * 13}%`,
              width: `${20 + (index % 4) * 13}px`,
              transform: `rotate(${index % 2 === 0 ? 32 : -26}deg)`,
            }}
            animate={reduceMotion ? undefined : { opacity: [0, 0.9, 0], scaleX: [0.52, 1.25, 0.52] }}
            transition={{ duration: 3.2, delay: index * 0.28, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-16 top-10 z-30 h-px bg-gradient-to-r from-transparent via-white/82 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-16 bottom-10 z-30 h-px bg-gradient-to-r from-transparent via-[#D4A853]/44 to-transparent" aria-hidden />
      <div className="relative z-30 flex min-h-[430px] items-end justify-center p-6 md:min-h-[600px] md:p-10 lg:min-h-[min(78svh,820px)]">
        <div className="h-[1px] w-[74%] rounded-full bg-white/70 shadow-[0_0_44px_rgba(255,255,255,0.70)]" aria-hidden />
      </div>
    </div>
  );
}

export function HomePortal({ ketes }: HomePortalProps) {
  const pageRef = useRef<HTMLElement | null>(null);
  const [activeSlug, setActiveSlug] = useState<KeteSlug>('waihanga');
  const reduceMotion = useReducedMotion();
  const activeKete = useMemo(
    () => ketes.find((kete) => kete.slug === activeSlug) ?? ketes[0],
    [activeSlug, ketes],
  );
  const activeStyle = { '--kete-accent': activeKete.accent } as CSSProperties;

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-x-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
      style={activeStyle}
    >
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F6F0E8_58%,#FAF7F2_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,242,1)_0%,rgba(250,247,242,0.95)_52%,rgba(246,240,232,0.74)_100%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FAF7F2] to-transparent" aria-hidden />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-[1680px] items-center gap-10 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)] lg:gap-12 xl:px-10 2xl:px-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 1, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 max-w-[720px]"
          >
            <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/72 px-3 py-2 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)] shadow-sm backdrop-blur-md">
              BUILT IN AOTEAROA
            </p>
            <h1 className="mt-6 max-w-[780px] font-display text-[clamp(4.2rem,11vw,9.6rem)] font-light italic leading-[0.83] tracking-normal text-[#103F35] lg:text-[clamp(5.8rem,7.8vw,10.2rem)]">
              Mahi that earns its proof.
            </h1>
            <p className="mt-6 max-w-[620px] text-[clamp(1.08rem,2vw,1.45rem)] font-medium leading-[1.42] text-[#23211F] md:mt-7">
              assembl turns real work into reviewed outputs with sources, actions,
              and a record you can stand behind.
            </p>
            <div className="mt-5 max-w-[620px] text-[0.98rem] leading-[1.65] text-[#3D4250] md:text-[1.04rem]">
              <p>
                Start with a public HAPAI tool, a specialist kete, or one workflow
                your team repeats. The useful work becomes draft, review, sign-off,
                and proof.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
              <Link
                href="#product-map"
                className="cta-primary inline-flex h-12 w-full items-center justify-center px-8 text-base sm:w-auto md:h-14"
              >
                See what to use
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/hapai"
                className="btn-ghost inline-flex h-12 w-full items-center justify-center bg-white/62 px-8 text-base backdrop-blur-md sm:w-auto md:h-14"
              >
                Open HAPAI tools
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative z-10 lg:min-w-[720px]"
            initial={reduceMotion ? false : { opacity: 1, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.82, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <AssemblHeroObject reduceMotion={reduceMotion} />
          </motion.div>
        </div>
      </section>

      <RevealSection id="product-map" className="scroll-mt-24 border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-28 md:px-12 md:py-36" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            HOW TO READ ASSEMBL
          </p>
          <div className="mt-4 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5rem)] font-normal italic leading-tight">
              Pick the right door.
            </h2>
            <p className="max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              HAPAI is the shareable tool library. Kete are specialist packs.
              Workflows are repeatable jobs with review and evidence. They are
              different doors into the same operating layer.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['HAPAI tools', 'Public one-task tools: study, meetings, travel, share cards, logs, briefs, and useful everyday jobs.', '/hapai', 'Try the tools'],
              ['Kete packs', 'Specialist operating areas with agents, tools, live knowledge, and review rules.', '#kete-workflows', 'See the kete'],
              ['Workflows', 'Repeatable jobs with inputs, reviewers, outputs, and evidence packs.', '/workflows', 'Browse workflows'],
            ].map(([title, body, href, cta]) => (
              <Link
                key={title}
                href={href}
                className="group rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/54 p-6 transition-all hover:-translate-y-0.5 hover:border-[color:var(--assembl-pounamu)] hover:bg-white hover:shadow-[0_22px_70px_rgba(35,33,31,0.08)]"
              >
                <span className="block font-display text-3xl font-light italic leading-none text-[#103F35]">
                  {title}
                </span>
                <span className="mt-4 block min-h-[96px] text-sm leading-relaxed text-[color:var(--text-body)]">
                  {body}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto grid max-w-[1500px] gap-8 md:px-2 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              WHAT WE DO
            </p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              Less admin. More mahi.
            </h2>
          </div>
          <div>
            <p className="max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Hospitality teams shouldn&apos;t spend their best hour writing the
              allergen incident report. Construction teams shouldn&apos;t spend their
              best hour cross-referencing the variation against clause 24A of the
              contract. Schools shouldn&apos;t spend their best hour rewording the
              same notice for the fourth year group.
            </p>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Those are the jobs assembl picks up. Specialist agents — trained
              on your industry&apos;s regulations and your business&apos;s voice — handle
              the admin layer. Your team reviews the output, signs it off, and
              goes back to the work they care about.
            </p>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              The output gets sealed with a trail of how it was made, so it
              stands up later.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/hapai" className="cta-primary inline-flex h-12 items-center justify-center px-6">
                Open HAPAI tools
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/c/waihanga" className="btn-ghost inline-flex h-12 items-center justify-center px-6">
                Try a kete chat
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-white/42 px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <ThreeSteps />
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <MarketplaceStrip />
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-white/38 px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
              HAPAI · PUBLIC TOOLS
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5rem)] font-normal italic leading-tight">
              Try one useful tool.
            </h2>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              HAPAI is the apps and tools page: single-purpose public tools for
              real work. Open one, get a useful result, then turn the win into a
              private internal tool if it earns its keep.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {FEATURED_HAPAI_TOOLS.map((tool, index) => (
              <motion.div
                key={tool.href}
                initial={reduceMotion ? false : { opacity: 1, y: 22 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.26 }}
                transition={{ duration: 0.52, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                <Link
                  href={tool.href}
                  className="group relative flex min-h-[460px] flex-col overflow-hidden rounded-[30px] border border-white/68 p-3 shadow-[0_24px_90px_rgba(35,33,31,0.09)] transition-all duration-300 hover:-translate-y-1 hover:border-white hover:shadow-[0_34px_120px_rgba(35,33,31,0.13)]"
                  style={{
                    background: HAPAI_CARD_STYLES[index % HAPAI_CARD_STYLES.length].wash,
                    boxShadow: `0 24px 90px rgba(35,33,31,0.09), 0 0 70px ${HAPAI_CARD_STYLES[index % HAPAI_CARD_STYLES.length].glow}`,
                  }}
                >
                  <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden />
                  <span className="relative block aspect-[16/11] overflow-hidden rounded-[24px] border border-white/72 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_55px_rgba(35,33,31,0.08)] backdrop-blur-xl">
                    <span className="block h-full transition-transform duration-700 group-hover:scale-[1.035]">
                      <HapaiToolPreview visual={tool.visual} />
                    </span>
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_42%,rgba(35,33,31,0.04))]" aria-hidden />
                  </span>
                  <span className="flex flex-1 flex-col px-4 pb-4 pt-5">
                    <span className="flex items-center justify-between gap-3">
                      <span className="w-fit rounded-full border border-white/70 bg-white/58 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2B6B57] shadow-sm backdrop-blur-md">
                        {HAPAI_CARD_STYLES[index % HAPAI_CARD_STYLES.length].label}
                      </span>
                      <span className="rounded-full border border-[rgba(43,107,87,0.16)] bg-white/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2B6B57] backdrop-blur-md">
                        live
                      </span>
                    </span>
                    <span className="mt-6 block font-display text-[clamp(2rem,3.2vw,3rem)] font-light italic leading-[0.9] text-[#103F35]">
                      {tool.name}
                    </span>
                    <span className="mt-4 block min-h-[74px] text-[15px] leading-relaxed text-[#23211F]/82">
                      {tool.description}
                    </span>
                    <span className="mt-auto flex items-center justify-between gap-4 pt-7">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">
                        shareable · draft only
                      </span>
                      <span className="inline-flex h-11 items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 text-sm font-medium text-[#103F35] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_30px_rgba(43,107,87,0.10)] backdrop-blur-md transition-colors group-hover:bg-white">
                        Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={reduceMotion ? false : { opacity: 1, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.26 }}
              transition={{ duration: 0.52, delay: FEATURED_HAPAI_TOOLS.length * 0.045, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <Link
              href="/hapai"
              className="group relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/50 bg-[radial-gradient(circle_at_22%_14%,rgba(255,255,255,0.34),transparent_34%),linear-gradient(135deg,#2B6B57,#153F35_62%,#0D2822)] p-7 text-[#FAF7F2] shadow-[0_30px_100px_rgba(43,107,87,0.24)] transition-transform hover:-translate-y-1"
              >
                <span className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/14" aria-hidden />
                <span className="pointer-events-none absolute bottom-0 left-0 h-44 w-full bg-[linear-gradient(0deg,rgba(255,255,255,0.16),transparent)]" aria-hidden />
                <span className="relative font-mono text-[10px] uppercase tracking-[0.20em] text-[#D9A85A]">
                  full HAPAI library
                </span>
                <span>
                  <span className="relative block font-display text-[clamp(2.7rem,4vw,4.2rem)] font-light italic leading-[0.88] text-[#FAF7F2]">
                    See the full library.
                  </span>
                  <span className="relative mt-5 block max-w-sm text-base leading-relaxed text-[#FAF7F2]/82">
                    Tools for study, meetings, travel, school notices, food logs, cards, briefs, and the jobs people actually need done.
                  </span>
                  <span className="relative mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/16 px-4 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md">
                    Open HAPAI <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </RevealSection>

      <RevealSection id="kete-workflows" className="scroll-mt-24 border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              NINE KETE · NINE INDUSTRIES
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              A specialist team for every kind of work.
            </h2>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Each pack holds a specialist team: assistants trained on the
              industry&apos;s regulations, policies, and patterns of work; review
              points where a named person signs off; evidence packs shaped for
              the audience that has to read them. Try any of the nine in the
              public chat. No signup.
            </p>
          </div>
          <KeteCardGrid
            ketes={ketes}
            activeSlug={activeSlug}
            onSelect={setActiveSlug}
            reduceMotion={reduceMotion}
          />
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
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
          <div className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#EFEAE1]/58 p-4 shadow-[0_24px_80px_rgba(35,33,31,0.10)] md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 82% 18%, rgba(43,107,87,0.10), transparent 42%), linear-gradient(180deg, rgba(250,247,242,0.88), rgba(239,234,225,0.54))',
              }}
            />
            <div className="relative grid gap-4">
              <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#FAF7F2]/88 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                  sealed example
                </p>
                <h3 className="mt-3 max-w-lg font-display text-[clamp(2.2rem,4vw,4.2rem)] font-light italic leading-[0.94]">
                  Consent variation pack.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--text-body)]">
                  A fileable record of the inputs, checks, draft, reviewer notes,
                  and the final sign-off trail.
                </p>
              </div>
              <EvidencePackPreview
                title="Kitchen extract consent response"
                workflowId="ASM-MAN-0429"
                reviewer="Mere Wilson"
                generatedAt="21 May 2026 · 09:42 NZST"
                citations={['Building Act 2004', 'Food Act 2014', 'Privacy Act 2020']}
                checks={['Source documents attached', 'Reviewer note recorded', 'Hash-chain entry sealed']}
                className="bg-white/82"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {['inputs logged', 'citations inline', 'human signed off'].map((label) => (
                  <div
                    key={label}
                    className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-white/42 px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
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
            {PRICING_ENTRY_POINTS.map(([name, price, body, cta, href, accent], index) => (
              <motion.article
                key={name}
                className="rounded-[8px] border border-[rgba(35,33,31,0.10)] border-t-[5px] bg-[color:var(--assembl-paper)] p-6"
                style={{ borderTopColor: accent }}
                initial={reduceMotion ? false : { opacity: 1, y: 22 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.34 }}
                transition={{ duration: 0.5, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
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
              </motion.article>
            ))}
          </div>
          <Link href="/pricing" className="mt-8 inline-flex h-12 items-center justify-center rounded-[8px] border border-[rgba(35,33,31,0.14)] px-6 font-medium text-[color:var(--text-primary)]">
            See full pricing <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </RevealSection>

      <RevealSection className="bg-[color:var(--assembl-pounamu)] px-6 py-32 text-[#FAF7F2] md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-8 text-center">
          <h2 className="max-w-4xl font-display text-[clamp(3rem,7vw,6rem)] font-normal italic leading-tight text-[#FAF7F2]">
            Bring one workflow. Leave with proof.
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-[#FAF7F2]/86 md:text-base">
            Ten working days. One job your team actually runs. An evidence pack
            you can hand to anyone.
          </p>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/pilot-sprint" className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#FAF7F2] px-6 font-medium text-[color:var(--assembl-pounamu)]">
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
      </RevealSection>

      <div className="hidden md:block">
        <AssemblConciergeWidget />
      </div>
    </main>
  );
}

function RevealSection({
  children,
  className,
  reduceMotion,
  id,
}: {
  children: React.ReactNode;
  className: string;
  reduceMotion: boolean | null;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduceMotion ? false : { opacity: 1, y: 34 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.12, margin: '-80px 0px' }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
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
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Choose a kete">
      {ketes.map((kete, index) => {
        const active = kete.slug === activeSlug;
        return (
          <motion.div
            key={kete.slug}
            style={{ '--tile-accent': kete.accent } as CSSProperties}
            initial={reduceMotion ? false : { opacity: 1, y: 24, scale: 0.985 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.24 }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.5, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
          >
            <article
              onMouseEnter={() => onSelect(kete.slug)}
              className={[
                'group relative flex min-h-[360px] flex-col overflow-hidden rounded-[8px] border bg-white/65 text-left shadow-[0_10px_36px_rgba(35,33,31,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
                active
                  ? 'border-[color:var(--tile-accent)] bg-white'
                  : 'border-[rgba(35,33,31,0.12)] hover:border-[color:var(--tile-accent)] hover:bg-white/78',
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
              <span className="flex flex-1 flex-col p-7">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {kete.industry}
                </span>
                <span className="block font-display text-[28px] font-medium leading-none text-[color:var(--tile-accent)]">
                  {kete.name}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                  {KETE_ACCENT_NAMES[kete.slug]}
                </span>
                <span className="mt-4 block min-h-[74px] text-[14.5px] leading-relaxed text-[#2A2825]">
                  {KETE_CARD_COPY[kete.slug]}
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-4 pt-6 text-[13px]">
                  <Link
                    href={`/kete/${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="font-medium text-[color:var(--text-primary)] underline-offset-4 hover:text-[color:var(--assembl-pounamu)] hover:underline"
                  >
                    Learn more →
                  </Link>
                  <Link
                    href={`/c/${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="font-medium text-[color:var(--assembl-pounamu)] underline-offset-4 hover:underline"
                  >
                    Try the chat →
                  </Link>
                  <Link
                    href={`/workflows?kete=${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="text-[12px] text-[color:var(--text-secondary)] underline-offset-4 hover:underline"
                  >
                    See workflows →
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
