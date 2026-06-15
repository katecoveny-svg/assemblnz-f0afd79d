'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { VesselHero } from '@/components/hero/VesselHero';
import { LiveRegulationBlock } from '@/components/site/LiveRegulationBlock';

// "Pick your area" — one link per kete. English first, te reo second.
const KETE_ROWS = [
  { slug: 'waihanga', name: 'Waihanga', area: 'Construction', drafts: 'RFIs, variation packs, site logs' },
  { slug: 'manaaki', name: 'Manaaki', area: 'Hospitality', drafts: 'Allergen reports, guest replies, supplier comparisons' },
  { slug: 'pikau', name: 'Pīkau', area: 'Freight & Customs', drafts: 'Customs entries, freight exceptions, carrier compliance' },
  { slug: 'arataki', name: 'Arataki', area: 'Automotive & Fleet', drafts: 'WoF readiness, CGA disclosures, defect logs' },
  { slug: 'auaha', name: 'Auaha', area: 'Creative', drafts: 'Caption batches, briefs, tagline shortlists' },
  { slug: 'ako', name: 'Ako', area: 'Education', drafts: 'Notice rewrites, assessment summaries, parent updates' },
  { slug: 'matauranga', name: 'Mātauranga', area: 'Knowledge & Research', drafts: 'Source checks, document comparisons, submissions' },
  { slug: 'hoko', name: 'Hoko', area: 'Commerce', drafts: 'Return triage, customer replies, supplier comparisons' },
  { slug: 'toro', name: 'Tōro', area: 'Family', drafts: 'School notices, weekly plans, gear lists' },
] as const;

const ACCENT = Object.fromEntries(KETES.map((k) => [k.slug, k.accent])) as Record<string, string>;

const HOW_STEPS = [
  ['i', 'Agents draft it', 'The slow, repetitive writing — done in seconds, built on your industry’s rules.'],
  ['ii', 'You sign off', 'Nothing sends, files, or lodges until a named person on your team approves it.'],
  ['iii', 'The receipt', 'Every output carries an evidence pack: the sources used, the assumptions made, and who approved it.'],
] as const;

const GLASS =
  'rounded-[22px] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(255,255,255,0.28))] ' +
  'backdrop-blur-xl shadow-[0_18px_50px_rgba(40,30,18,0.07),inset_0_1px_0_rgba(255,255,255,0.6)]';

const EASE = [0.16, 1, 0.3, 1] as const;

// Stagger container — children reveal in sequence as the block scrolls into view.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// A single block: rises and fades up with a soft spring-like ease.
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// Headline words: each word lifts from below, clipped by its row.
const word: Variants = {
  hidden: { opacity: 0, y: '0.9em' },
  show: { opacity: 1, y: '0em', transition: { duration: 0.6, ease: EASE } },
};

const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' } as const;

/** A heading whose words rise one-by-one as it enters the viewport. */
function RevealWords({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      aria-label={text}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
          <motion.span variants={word} className="inline-block">
            {w}
            {i < text.split(' ').length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** A small mono kicker with an accent rule — gives each header a lead-in. */
function Eyebrow({ label, accent, className = '' }: { label: string; accent: string; className?: string }) {
  return (
    <motion.div variants={item} className={`mb-5 flex items-center gap-3 ${className}`}>
      <span className="h-[2px] w-9 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
      <span className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">{label}</span>
    </motion.div>
  );
}

export function HomeLaunch() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);

  // Scroll-linked parallax: the hero copy drifts up and fades a touch as you
  // scroll past it, so the section feels layered rather than flat.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.15]);

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* 1 · Hero — the stacked vessel + the line, in clean space */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_28%_30%,#f7f0e3_0%,#ece3d2_52%,#ddd2bd_100%)]"
      >
        {/* Slow ambient light blooms — the "motion graphic" backdrop */}
        {!reduce && (
          <>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-32 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(58,125,110,0.16),transparent_68%)] blur-2xl"
              animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.18),transparent_68%)] blur-2xl"
              animate={{ x: [0, -36, 0], y: [0, 26, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Text leads on the left; the vessel is the accent on the right,
            capped so it never dominates. Copy is first in the DOM, so on
            mobile the headline sits above the vessel. */}
        <div className="container relative grid min-h-[76vh] items-center gap-10 py-20 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16 lg:py-24">
          <motion.div style={{ y: copyY, opacity: copyOpacity }}>
            <motion.div
              className="max-w-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.p
                variants={item}
                className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--text-secondary)]"
              >
                Built in Aotearoa
              </motion.p>
              <h1 className="mt-5 font-display text-[clamp(3.5rem,7vw,6rem)] font-light leading-[0.96] tracking-[-0.025em]">
                <RevealWords text="Mahi that earns" className="block" />
                <RevealWords text="its proof." className="mt-1 block text-[color:var(--assembl-pounamu)]" />
              </h1>
              <motion.p
                variants={item}
                className="mt-6 max-w-md text-body-lg leading-relaxed text-[color:var(--text-body)]"
              >
                Specialist agents draft the admin-heavy work. A named person signs it off. Every
                output is sealed in an evidence pack — the receipt.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                  Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
                  Book a Pilot Sprint
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative h-[38vh] min-h-[300px] lg:h-[460px]"
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <VesselHero />
          </motion.div>
        </div>

        {/* Scroll cue */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
              Scroll
            </span>
            <motion.span
              className="h-9 w-[1px] origin-top bg-[rgba(35,33,31,0.3)]"
              animate={{ scaleY: [0.2, 1, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </section>

      {/* 2 · The promise */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={VIEWPORT}>
            <Eyebrow label="The promise" accent="var(--assembl-pounamu)" />
            <h2 className="max-w-3xl font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Less admin," className="block" />
              <RevealWords text="more mahi." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <motion.p variants={item} className="mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
              Hospitality teams shouldn’t spend their best hour writing the allergen report. Builders
              shouldn’t spend it checking a variation against clause 24A. Schools shouldn’t spend it
              rewording the same notice for a fourth year group. That’s the work assembl picks up — so
              your people get those hours back.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 3 · Pick your area — the nine kete, glass cards, one link each */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mb-12"
          >
            <Eyebrow label="Nine kete" accent="var(--assembl-gold)" />
            <h2 className="font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Pick the pack" className="block" />
              <RevealWords text="for your work." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <motion.p variants={item} className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              A kete is a kit for one kind of work — the agents, tools, and rules shaped for it.
            </motion.p>
          </motion.div>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
          >
            {KETE_ROWS.map((row) => (
              <motion.div
                key={row.slug}
                variants={item}
                whileHover={reduce ? undefined : { y: -8, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              >
                <Link
                  href={`/kete/${row.slug}`}
                  className={`group flex h-full flex-col justify-between p-6 transition-[box-shadow,background] duration-300 hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] hover:shadow-[0_34px_80px_rgba(40,30,18,0.14)] ${GLASS}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">{row.area}</span>
                    <motion.span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: ACCENT[row.slug] }}
                      aria-hidden
                      whileHover={{ scale: 1.6 }}
                    />
                  </div>
                  <div className="mt-8">
                    <h3 className="font-display text-2xl font-light">
                      {row.name} <span className="text-[color:var(--text-secondary)]">· {row.area}</span>
                    </h3>
                    <p className="mt-3 text-body-md text-[color:var(--text-body)]">{row.drafts}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all group-hover:gap-2.5">
                    Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4 · How it works */}
      <section className="border-y border-[rgba(212,168,83,0.36)] bg-[radial-gradient(120%_70%_at_50%_0%,#f6efe4,transparent_60%)] py-24 lg:py-32">
        <div className="container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mb-10"
          >
            <Eyebrow label="How it works" accent="var(--assembl-clay)" />
            <h2 className="font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Draft. Sign off." className="block" />
              <RevealWords text="Sealed receipt." className="block text-[color:var(--assembl-clay)]" />
            </h2>
          </motion.div>
          <motion.div
            className="grid gap-4 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
          >
            {HOW_STEPS.map(([n, title, body]) => (
              <motion.article
                key={title}
                variants={item}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`h-full p-7 ${GLASS}`}
              >
                <p className="font-display text-4xl font-light text-[#b9ad9c]">{n}</p>
                <h3 className="mt-3 font-display text-display-md font-light">{title}</h3>
                <p className="mt-4 text-body-md text-[color:var(--text-body)]">{body}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4.5 · Live regulation — the proof number, customer-readable */}
      <LiveRegulationBlock />

      {/* 5 · Pricing teaser */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mx-auto max-w-3xl text-center"
          >
            <Eyebrow label="Pricing" accent="var(--assembl-pounamu)" className="justify-center" />
            <h2 className="font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Start with the work" className="block" />
              <RevealWords text="in front of you." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">
              Free tools, a Pilot Sprint proven on your data, a kete pack for your industry, and a
              Tōro option for whānau. Simple and honest.
            </motion.p>
            <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pricing" className="btn-ghost inline-flex h-12 items-center px-6">See pricing</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
