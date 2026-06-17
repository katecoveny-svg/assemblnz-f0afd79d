'use client';

import { useRef } from 'react';
import Image from 'next/image';
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
import { LiveRegulationBlock } from '@/components/site/LiveRegulationBlock';
import { LandscapeBand } from '@/components/site/LandscapeBand';
import { WATCHED_SOURCE_COUNT } from '@/lib/watched-sources';

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

const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' } as const;

/**
 * A heading whose words rise one-by-one as the page loads.
 *
 * Deliberately pure CSS (see `.reveal-word` in globals.css) rather than a
 * scroll-triggered framer-motion reveal. The earlier version hid every word at
 * `opacity: 0` and depended on an IntersectionObserver firing after hydration —
 * which it did NOT do reliably for the hero (content already in view at mount),
 * leaving the headline frozen and invisible. CSS runs on load without JS, and
 * the resting state is fully visible, so the words can never get stuck.
 */
function RevealWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.flatMap((w, i, arr) => {
        const span = (
          <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
            <span className="reveal-word" style={{ animationDelay: `${0.05 + i * 0.06}s` }}>
              {w}
            </span>
          </span>
        );
        // The inter-word space is a plain text node between the clip spans, so
        // it is never swallowed by overflow-hidden.
        return i < arr.length - 1 ? [span, ' '] : [span];
      })}
    </span>
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
      {/* 1 · Hero — the stacked vessel, larger and present, with live data-node
          sparkles. Copy leads on the left in strong ink. */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_30%_28%,#f7f0e3_0%,#ece3d2_52%,#ddd2bd_100%)]"
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

        {/* Text leads on the left; the vessel is a dominant presence on the
            right — roughly 40% of the row. Copy is first in the DOM, so on
            mobile the headline sits above the vessel. */}
        <div className="container relative grid min-h-[82vh] items-center gap-8 py-16 lg:grid-cols-[1fr_minmax(0,700px)] lg:gap-14 lg:py-20">
          <motion.div style={{ y: copyY, opacity: copyOpacity }}>
            <motion.div
              className="max-w-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.p
                variants={item}
                className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]"
              >
                Aotearoa-built AI
              </motion.p>
              <h1 className="mt-5 font-display text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.94] tracking-[-0.025em]">
                <RevealWords text="Built in Aotearoa for the real bottleneck —" className="block" />
                <RevealWords text="trust and uptake." className="mt-1 block text-[color:var(--assembl-pounamu)]" />
              </h1>
              <motion.p
                variants={item}
                className="mt-6 max-w-xl text-[clamp(1.15rem,2vw,1.4rem)] font-medium leading-[1.5] text-[color:var(--text-primary)]"
              >
                assembl ships HAPAI: a public library of single-purpose tools that each do one
                ordinary job — draft-only, reviewed by a named human, with a downloadable evidence
                pack on every output.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                  Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
                  Book a Pilot Sprint
                </Link>
              </motion.div>

              {/* Proof strip — a little of the dark band's evidence brought up
                  to the first screen, so the hero reads as substantiated, not
                  just a promise. Honest, standing facts only. */}
              <motion.ul
                variants={item}
                className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[rgba(43,107,87,0.18)] pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]"
              >
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
                  {WATCHED_SOURCE_COUNT} NZ government sources watched
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
                  Every output signed off
                </li>
              </motion.ul>
            </motion.div>
          </motion.div>

          {/* The signature evidence-vessel — Kate's canonical hero image. The
              gold-thread sparkles are baked into the asset, so there is no
              procedural overlay. Sits on the right; its own negative space and
              thread-trail lean toward the headline on the left. */}
          <motion.div
            className="relative h-[clamp(420px,56vh,680px)] w-full overflow-hidden"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <Image
              src="/images/site/hero-evidence-vessel.png"
              alt="A stack of translucent glass discs held in a fine gold wire frame, threads of gold light connecting points across them — assembl's evidence vessel."
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="select-none object-cover object-[68%_center]"
            />
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

      {/* 2 · The promise (cream paper) */}
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

      {/* 3 · Pick your area — the eight industry kete, glass cards (off-white tint).
          Kate's signal-threads texture sits underneath at low opacity — a
          delicate data-flow whisper, cream-on-cream, never loud. */}
      <section className="relative overflow-hidden bg-[#F4EFE6] py-24 lg:py-32">
        <Image
          src="/images/site/signal-threads-background.png"
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="pointer-events-none select-none object-cover opacity-[0.22] mix-blend-multiply"
        />
        <div className="container relative">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mb-12"
          >
            <Eyebrow label="Eight kete" accent="var(--assembl-gold-thread)" />
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

      {/* 3.5 · Aotearoa landscape band — full-bleed Bay of Islands golden hour,
          the grounded "made here" moment and the transition into the dark stat
          bar that follows. */}
      <LandscapeBand />

      {/* 4 · Live regulation — the one dark pounamu band + big stat */}
      <LiveRegulationBlock />

      {/* 5 · How it works (cream paper) */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mb-10"
          >
            <Eyebrow label="How it works" accent="var(--assembl-gold-thread)" />
            <h2 className="font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Draft. Sign off." className="block" />
              <RevealWords text="Sealed receipt." className="block text-assembl-clay" />
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

          {/* Evidence detail — the proof points as a constellation on the
              glass. Kate's macro reference, framed. */}
          <motion.figure
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-10 overflow-hidden rounded-[22px] border border-white/60 shadow-[0_18px_50px_rgba(40,30,18,0.08)]"
          >
            <Image
              src="/images/site/vessel-macro-proof-detail.png"
              alt="Macro detail of the evidence vessel — antique-gold nodes connected by fine gold thread across the glass discs, a constellation of proof points."
              width={1448}
              height={1086}
              sizes="(min-width: 768px) 100vw, 100vw"
              className="h-[clamp(220px,30vw,360px)] w-full object-cover object-center"
            />
            <figcaption className="bg-white/55 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Every output carries its evidence — the sources, the assumptions, the sign-off.
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* 6 · Built by — founder credibility marker */}
      <FounderBand />

      {/* 7 · Closing CTA — the vessel motif with a thread of light running out
          of it, paired with the invitation to start. */}
      <section className="bg-[#F4EFE6] py-24 lg:py-32">
        <div className="container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16"
          >
            <div>
              <Eyebrow label="Start" accent="var(--assembl-pounamu)" />
              <h2 className="font-display text-display-lg font-light leading-[1.02]">
                <RevealWords text="Let's build" className="block" />
                <RevealWords text="what's next." className="block text-[color:var(--assembl-pounamu)]" />
              </h2>
              <motion.p variants={item} className="mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">
                Free tools, a Pilot Sprint proven on your data, a kete pack for your industry, and a
                Tōro option for whānau. Simple and honest — start with the work in front of you.
              </motion.p>
              <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                  Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/pricing" className="btn-ghost inline-flex h-12 items-center px-6">See pricing</Link>
              </motion.div>
            </div>
            <motion.div variants={item} className="relative">
              <Image
                src="/images/site/vessel-cta-motif.png"
                alt=""
                aria-hidden
                width={1672}
                height={941}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full select-none"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/**
 * Founder band — "Built by Kate Hudson, Aotearoa". A small credibility marker.
 * Text only by design: the one founder portrait site-wide lives on /about, so
 * this band carries the name and links through rather than repeating the photo.
 */
function FounderBand() {
  return (
    <section className="border-b border-[rgba(35,33,31,0.08)] py-20 lg:py-24">
      <div className="container">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className={`mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10 ${GLASS}`}
        >
          <motion.p
            variants={item}
            className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]"
          >
            Built in Aotearoa
          </motion.p>
          <motion.h2 variants={item} className="font-display text-display-md font-light leading-[1.04]">
            Built by Kate Hudson.
          </motion.h2>
          <motion.p variants={item} className="max-w-md text-body-md text-[color:var(--text-body)]">
            assembl is made in Aotearoa, for the work New Zealand teams actually do — with NZ rules,
            NZ sources, and a human signing off every output.
          </motion.p>
          <motion.div variants={item}>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all hover:gap-2.5"
            >
              Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
