'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { LiveRegulationBlock } from '@/components/site/LiveRegulationBlock';
import { LandscapeBand } from '@/components/site/LandscapeBand';
import { WATCHED_SOURCE_COUNT } from '@/lib/watched-sources';
import { getHapaiTool, HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';

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

// "Try a tool right now" — a deliberate six pulled from the /hapai source of
// truth (HAPAI_TOOLS), so name, link, and live status never drift from the
// library. The card blurb is a homepage-tight one-liner; the canonical longer
// description lives on /hapai.
const HOME_TOOL_PICKS = [
  ['customs-entry', 'Paste a commercial invoice. Get a structured entry draft your broker can check and file.'],
  ['meeting-recorder', 'Record or paste a hui. Walk away with the minutes, the actions, and an evidence pack.'],
  ['admin-tax', 'Add up the admin hours your team loses each week. See the yearly cost in one number.'],
  ['9am-brief', 'Turn the school notice, the sports draw, and the weather into a five-line morning brief.'],
  ['food-temp-log', 'Log the day’s fridge and cook temps. Get a Food Act 2014 record, dated and filed.'],
  ['privacy-act', 'Map your data flows to the 13 privacy principles. Get a plain-English one-pager.'],
] as const;

const HOME_TOOLS = HOME_TOOL_PICKS.map(([slug, blurb]) => {
  const tool = getHapaiTool(slug);
  if (!tool) throw new Error(`HomeLaunch: unknown HAPAI tool slug "${slug}"`);
  return { name: tool.name, href: tool.href, blurb };
});

const TOOL_COUNT = HAPAI_TOOLS.length;

const HOW_STEPS = [
  ['i', 'Agents draft it', 'The slow, repetitive writing — done in seconds, built on your industry’s rules.'],
  ['ii', 'You sign off', 'Nothing sends, files, or lodges until a named person on your team approves it.'],
  ['iii', 'The receipt', 'Every output carries an evidence pack: the sources used, the assumptions made, and who approved it.'],
] as const;

const GLASS =
  'rounded-[22px] border border-white/65 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(255,255,255,0.28))] ' +
  'backdrop-blur-xl shadow-[0_18px_50px_rgba(40,30,18,0.07),inset_0_1px_0_rgba(255,255,255,0.6)]';

// A sample sealed receipt — the proof that rides with every output. Drawn from
// a real hospitality allergen reply so the fields are concrete, not abstract.
const RECEIPT_FIELDS = [
  ['Signature', 'ed25519 · verified'],
  ['Sources', 'Food Act 2014, MPI allergen guidance, your menu'],
  ['Tikanga check', 'Passed'],
  ['Consent', '3-gate record · captured'],
  ['Format', 'Citation-ready PDF'],
  ['Signed off by', 'A named person · 19 Jun 2026'],
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

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

/**
 * A small mono kicker with an accent rule — gives each header a lead-in.
 *
 * Uses the pure-CSS `.rise` reveal (visible at rest) rather than a framer
 * `whileInView` variant, so it is never hidden if JS fails to hydrate.
 */
function Eyebrow({ label, accent, className = '' }: { label: string; accent: string; className?: string }) {
  return (
    <div className={`rise mb-5 flex items-center gap-3 ${className}`}>
      <span className="h-[2px] w-9 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
      <span className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">{label}</span>
    </div>
  );
}

export function HomeLaunch() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);

  // Scroll-linked parallax: the hero copy drifts up and fades a touch as you
  // scroll past it, so the section feels layered rather than flat. The resting
  // value is fully visible (opacity 1), so the copy shows even without JS.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.15]);

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* 1 · Hero — copy fills the left ~60%, the signature evidence-vessel holds
          the right ~40%. Both expand to use the full desktop width. */}
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

        {/* Two-column row on desktop: ~60% copy / ~40% vessel. Copy is first in
            the DOM, so on mobile the headline sits above the vessel. */}
        <div className="container relative grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-20">
          <motion.div style={{ y: copyY, opacity: copyOpacity }} className="max-w-2xl lg:max-w-none">
            <p className="rise font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]">
              Built in Aotearoa
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,8.5vw,7rem)] font-semibold not-italic leading-[0.92] tracking-[-0.025em]">
              <RevealWords text="Less admin." className="block" />
              <RevealWords text="More mahi." className="mt-1 block text-[color:var(--assembl-pounamu)]" />
            </h1>
            <p className="rise mt-6 max-w-xl text-[clamp(1.15rem,2vw,1.4rem)] font-medium leading-[1.5] text-[color:var(--text-primary)]">
              A library of single-purpose tools for NZ teams. Each one does a single ordinary job.
              Every output you can file, forward, or footnote.
            </p>
            <div className="rise mt-8 flex flex-wrap items-center gap-4">
              <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center px-6">
                Book a Pilot Sprint
              </Link>
            </div>

            {/* Proof strip — a little of the dark band's evidence brought up to
                the first screen, so the hero reads as substantiated. Honest,
                standing facts only. */}
            <ul className="rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[rgba(43,107,87,0.18)] pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
                {WATCHED_SOURCE_COUNT} NZ government sources watched
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
                Every output signed off
              </li>
            </ul>
          </motion.div>

          {/* The signature evidence-vessel — Kate's canonical hero image. The
              gold-thread sparkles are baked into the asset, so there is no
              procedural overlay. Sits on the right and fills its column. */}
          <motion.div
            className="relative h-[clamp(440px,60vh,720px)] w-full overflow-hidden"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <Image
              src="/images/site/hero-evidence-vessel.png"
              alt="A stack of translucent glass discs held in a fine gold wire frame, threads of gold light connecting points across them — assembl's evidence vessel."
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="select-none object-cover object-[62%_center]"
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

      {/* 2 · The receipt — amplified, directly after the hero. The strongest
          part of the page: draft, sign off, sealed receipt. Larger vessel image
          paired with a live sample receipt and a route into /evidence-pack. */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <Eyebrow label="The receipt" accent="var(--assembl-gold-thread)" />
            <h2 className="rise font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Draft. Sign off." className="block" />
              <RevealWords text="Sealed receipt." className="block text-assembl-clay" />
            </h2>
            <p className="rise mt-6 text-body-lg text-[color:var(--text-body)]">
              Every output leaves with its proof: the sources it drew on, the assumptions it made,
              and the person who approved it. One file to keep, forward, or footnote.
            </p>
          </div>

          {/* The three moves — draft, sign off, receipt. */}
          <div className="mb-10 grid gap-4 lg:grid-cols-3">
            {HOW_STEPS.map(([n, title, body]) => (
              <motion.article
                key={title}
                className={`rise h-full p-7 ${GLASS}`}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <p className="font-display text-4xl font-light text-[#b9ad9c]">{n}</p>
                <h3 className="mt-3 font-display text-display-md font-light">{title}</h3>
                <p className="mt-4 text-body-md text-[color:var(--text-body)]">{body}</p>
              </motion.article>
            ))}
          </div>

          {/* Larger vessel image + a live sample receipt, side by side. */}
          <div className="grid items-stretch gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <figure className="rise relative overflow-hidden rounded-[22px] border border-white/60 shadow-[0_18px_50px_rgba(40,30,18,0.08)]">
              <Image
                src="/images/site/vessel-macro-proof-detail.png"
                alt="Macro detail of the evidence vessel — antique-gold nodes connected by fine gold thread across the glass discs, a constellation of proof points."
                width={1448}
                height={1086}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full min-h-[320px] w-full object-cover object-center"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-white/55 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] backdrop-blur">
                One output. Every proof point threaded back to its source.
              </figcaption>
            </figure>

            <div className={`rise flex flex-col p-7 lg:p-8 ${GLASS}`}>
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[color:var(--assembl-gold-thread)]" aria-hidden />
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                  Evidence pack · sealed
                </p>
              </div>
              <p className="mt-4 text-body-md text-[color:var(--text-body)]">
                Sample: a hospitality reply to a guest’s nut-allergy query.
              </p>
              <dl className="mt-5 divide-y divide-[rgba(35,33,31,0.10)]">
                {RECEIPT_FIELDS.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                      {label}
                    </dt>
                    <dd className="text-right text-sm font-medium text-[color:var(--text-primary)]">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto pt-7">
                <Link
                  href="/evidence-pack"
                  className="cta-primary inline-flex h-12 items-center gap-2 px-7"
                >
                  See a receipt <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Try a tool right now — surface the HAPAI library on the homepage.
          Six tools pulled from the /hapai source of truth; the full set lives
          one click away. */}
      <section className="relative overflow-hidden bg-[#F4EFE6] py-24 lg:py-32">
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <Eyebrow label="Public tools" accent="var(--assembl-pounamu)" />
            <h2 className="rise font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="Try a tool" className="block" />
              <RevealWords text="right now." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <p className="rise mt-6 text-body-lg text-[color:var(--text-body)]">
              No sign-up, no demo. Open one, run a real job, keep the result.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {HOME_TOOLS.map((tool) => (
              <motion.div
                key={tool.href}
                className="rise"
                whileHover={reduce ? undefined : { y: -8, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              >
                <Link
                  href={tool.href}
                  className={`group flex h-full flex-col p-6 transition-[box-shadow,background] duration-300 hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] hover:shadow-[0_34px_80px_rgba(40,30,18,0.14)] ${GLASS}`}
                >
                  <h3 className="font-display text-2xl font-light leading-tight text-[color:var(--assembl-pounamu)]">
                    {tool.name}
                  </h3>
                  <p className="mt-3 flex-1 text-body-md text-[color:var(--text-body)]">{tool.blurb}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all group-hover:gap-2.5">
                    Open tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="rise mt-10">
            <Link
              href="/hapai"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all hover:gap-2.5"
            >
              See all {TOOL_COUNT} tools <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · The promise (cream paper) — rewritten plain warm-direct. */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <Eyebrow label="The promise" accent="var(--assembl-pounamu)" />
          <h2 className="rise max-w-3xl font-display text-display-lg font-light leading-[1.02]">
            <RevealWords text="The slow writing," className="block" />
            <RevealWords text="done in minutes." className="block text-[color:var(--assembl-pounamu)]" />
          </h2>
          <p className="rise mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
            Hospitality teams shouldn’t lose their best hour to the allergen report. Builders
            shouldn’t lose it checking a variation against clause 24A. assembl drafts that work —
            checked, sourced, and signed off before it goes anywhere.
          </p>
        </div>
      </section>

      {/* 5 · Pick your area — the eight industry kete, glass cards (off-white tint).
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
          <div className="mb-12">
            <Eyebrow label="Eight kete" accent="var(--assembl-gold-thread)" />
            <h2 className="rise font-display text-display-lg font-light leading-[1.02]">
              <RevealWords text="A kete for" className="block" />
              <RevealWords text="your industry." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <p className="rise mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Each kete groups the tools, agents, and NZ rules for one kind of work.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {KETE_ROWS.map((row) => (
              <motion.div
                key={row.slug}
                className="rise"
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
          </div>
        </div>
      </section>

      {/* 3.5 · Aotearoa landscape band — full-bleed Bay of Islands golden hour,
          the grounded "made here" moment and the transition into the dark stat
          bar that follows. */}
      <LandscapeBand />

      {/* Live regulation — the one dark pounamu band + big stat */}
      <LiveRegulationBlock />

      {/* Built by — founder credibility marker */}
      <FounderBand />

      {/* 7 · Closing CTA — the vessel motif with a thread of light running out
          of it, paired with the invitation to start. */}
      <section className="bg-[#F4EFE6] py-24 lg:py-32">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
            <div>
              <Eyebrow label="Start" accent="var(--assembl-pounamu)" />
              <h2 className="rise font-display text-display-lg font-light leading-[1.02]">
                <RevealWords text="Start with" className="block" />
                <RevealWords text="one tool." className="block text-[color:var(--assembl-pounamu)]" />
              </h2>
              <p className="rise mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">
                Open a free tool today. When it earns its place, we make it your team’s — branded,
                private, reviewed. Build the system from there.
              </p>
              <div className="rise mt-9 flex flex-wrap items-center gap-4">
                <Link href="/hapai" className="cta-primary inline-flex h-12 items-center gap-2 px-7">
                  Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/pricing" className="btn-ghost inline-flex h-12 items-center px-6">See pricing</Link>
              </div>
            </div>
            <div className="rise relative">
              <Image
                src="/images/site/vessel-cta-motif.png"
                alt=""
                aria-hidden
                width={1672}
                height={941}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full select-none"
              />
            </div>
          </div>
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
        <div className={`rise mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10 ${GLASS}`}>
          <p className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]">
            Built in Aotearoa
          </p>
          <h2 className="font-display text-display-md font-light leading-[1.04]">Built by Kate Hudson.</h2>
          <p className="max-w-md text-body-md text-[color:var(--text-body)]">
            assembl is made in Aotearoa, for the work New Zealand teams actually do — with NZ rules,
            NZ sources, and a human signing off every output.
          </p>
          <div>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all hover:gap-2.5"
            >
              Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
