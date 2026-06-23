'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { DASH_TOOLS } from '@/lib/hapai/dash/tools';
import { HeroGolden } from '@/components/homepage/HeroGolden';
import { LiveRegulationBlock } from '@/components/site/LiveRegulationBlock';
import { LandscapeBand } from '@/components/site/LandscapeBand';
import { HeroThreads } from '@/components/site/HeroThreads';
import { ShaderGradient } from '@/components/site/ShaderGradient';
import { Reveal } from '@/components/site/Reveal';
import { MagneticButton } from '@/components/site/MagneticButton';

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

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* 1 · Hero — Kate's golden-spheres Three.js scene with the brand headline
          overlaid. Client-only + a static snapshot on mobile / reduced-motion. */}
      <HeroGolden />

      {/* 2 · The promise (cream paper) */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <Eyebrow label="The promise" accent="var(--assembl-pounamu)" />
          <h2 className="rise max-w-3xl font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-light leading-[0.99] tracking-[-0.02em]">
            <RevealWords text="Your best hour," className="block" />
            <RevealWords text="better spent." className="block text-[color:var(--assembl-pounamu)]" />
          </h2>
          <p className="rise mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
            Hospitality teams shouldn’t spend their best hour writing the allergen report. Builders
            shouldn’t spend it checking a variation against clause 24A. Schools shouldn’t spend it
            rewording the same notice for a fourth year group. That’s the work assembl picks up — so
            your people get those hours back.
          </p>
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
          <div className="mb-12">
            <Eyebrow label="Eight kete" accent="var(--assembl-gold-thread)" />
            <h2 className="rise font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-light leading-[0.99] tracking-[-0.02em]">
              <RevealWords text="Pick the pack" className="block" />
              <RevealWords text="for your work." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <p className="rise mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              A kete is a kit for one kind of work — the agents, tools, and rules shaped for it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {KETE_ROWS.map((row, i) => (
              <Reveal key={row.slug} delay={i * 0.07} className="h-full">
                <motion.div
                  className="h-full"
                  whileHover={reduce ? undefined : { y: -10, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                <Link
                  href={`/kete/${row.slug}`}
                  className={`group relative flex h-full flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] hover:shadow-[0_34px_80px_rgba(40,30,18,0.18)] focus-visible:-translate-y-2 focus-visible:scale-[1.015] focus-visible:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] focus-visible:shadow-[0_34px_80px_rgba(40,30,18,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] focus-visible:outline-offset-4 ${GLASS}`}
                >
                  {/* sheen sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.55),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">{row.area}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover:scale-150 group-focus-visible:scale-150"
                      style={{ backgroundColor: ACCENT[row.slug] }}
                      aria-hidden
                    />
                  </div>
                  <div className="mt-8">
                    <h3 className="font-display text-2xl font-light">
                      {row.name} <span className="text-[color:var(--text-secondary)]">· {row.area}</span>
                    </h3>
                    <p className="mt-3 text-body-md text-[color:var(--text-body)]">{row.drafts}</p>
                  </div>
                  <span className="relative mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all group-hover:gap-2.5 group-focus-visible:gap-2.5">
                    Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3.25 · New free HAPAI tools — the five Kiwi-specific viral tools, the
          public library's newest hits. Canary dot is the nod to the Dash brand. */}
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <Eyebrow label="New free tools" accent="#FFD42A" />
            <h2 className="rise font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-light leading-[0.99] tracking-[-0.02em]">
              <RevealWords text="Five new tools," className="block" />
              <RevealWords text="built for here." className="block text-[color:var(--assembl-pounamu)]" />
            </h2>
            <p className="rise mt-6 text-body-lg text-[color:var(--text-body)]">
              Free, shareable, and tuned for Aotearoa — the rates notice, the school
              newsletter, your rental, the bus fare, the holiday pay. One task, one
              result you can send.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {DASH_TOOLS.map((tool, i) => (
              <Reveal key={tool.slug} delay={i * 0.07} className="h-full">
                <motion.div
                  className="h-full"
                  whileHover={reduce ? undefined : { y: -10, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                  <Link
                    href={`/hapai/${tool.slug}`}
                    className={`group relative flex h-full flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] hover:shadow-[0_34px_80px_rgba(40,30,18,0.18)] focus-visible:-translate-y-2 focus-visible:scale-[1.015] focus-visible:bg-[linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))] focus-visible:shadow-[0_34px_80px_rgba(40,30,18,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] focus-visible:outline-offset-4 ${GLASS}`}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.55),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                        Free tool
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-[#FFD42A] transition-transform duration-300 group-hover:scale-150 group-focus-visible:scale-150"
                        aria-hidden
                      />
                    </div>
                    <div className="mt-8">
                      <h3 className="font-display text-2xl font-light">{tool.name}</h3>
                      <p className="mt-3 text-body-md text-[color:var(--text-body)]">{tool.description}</p>
                    </div>
                    <span className="relative mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all group-hover:gap-2.5 group-focus-visible:gap-2.5">
                      Open tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
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
          <div className="mb-10">
            <Eyebrow label="How it works" accent="var(--assembl-gold-thread)" />
            <h2 className="rise font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-light leading-[0.99] tracking-[-0.02em]">
              <RevealWords text="Draft. Sign off." className="block" />
              <RevealWords text="Sealed receipt." className="block text-assembl-clay" />
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {HOW_STEPS.map(([n, title, body], i) => (
              <Reveal key={title} delay={i * 0.12} className="h-full">
                <motion.article
                  className={`h-full p-7 ${GLASS}`}
                  whileHover={reduce ? undefined : { y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <p className="font-display text-4xl font-light text-[#b9ad9c]">{n}</p>
                  <h3 className="mt-3 font-display text-display-md font-light">{title}</h3>
                  <p className="mt-4 text-body-md text-[color:var(--text-body)]">{body}</p>
                </motion.article>
              </Reveal>
            ))}
          </div>

          {/* Evidence detail — the proof points as a constellation on the
              glass. Kate's macro reference, framed. */}
          <figure className="rise mt-10 overflow-hidden rounded-[22px] border border-white/60 shadow-[0_18px_50px_rgba(40,30,18,0.08)]">
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
          </figure>
        </div>
      </section>

      {/* 6 · Built by — founder credibility marker */}
      <FounderBand />

      {/* 7 · Closing CTA — bookends the hero with the same live flowing-gradient,
          the vessel motif, and the invitation to start. */}
      <section className="relative overflow-hidden bg-[#F4EFE6] py-24 lg:py-32">
        {/* signature gradient backdrop (calmer than the hero) */}
        <ShaderGradient className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(244,239,230,0.82)_0%,rgba(244,239,230,0.4)_42%,transparent_70%)]"
        />
        <HeroThreads className="pointer-events-none absolute inset-0 z-0" />
        <div className="container relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
            <div>
              <Eyebrow label="Start" accent="var(--assembl-pounamu)" />
              <h2 className="rise font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.98] tracking-[-0.02em]">
                <RevealWords text="Let's build" className="block" />
                <RevealWords text="what's next." className="block text-[color:var(--assembl-pounamu)]" />
              </h2>
              <p className="rise mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">
                Free tools, a Pilot Sprint proven on your data, a kete pack for your industry, and a
                Tōro option for whānau. Simple and honest — start with the work in front of you.
              </p>
              <div className="rise mt-9 flex flex-wrap items-center gap-4">
                <MagneticButton>
                  <Link href="/hapai" className="cta-primary cta-glow inline-flex h-12 items-center gap-2 px-7">
                    Try a free tool <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link href="/pricing" className="btn-ghost inline-flex h-12 items-center px-6">
                    See pricing
                  </Link>
                </MagneticButton>
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
                // Feather the rectangular edges so the motif melts into the
                // gradient rather than reading as a pasted square.
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 80% 84% at 52% 50%, #000 42%, transparent 82%)',
                  maskImage:
                    'radial-gradient(ellipse 80% 84% at 52% 50%, #000 42%, transparent 82%)',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * "Made here" band — a small Aotearoa credibility marker. Carries the place,
 * not a personal name; the founder story lives on /about for anyone who wants it.
 */
function FounderBand() {
  return (
    <section className="border-b border-[rgba(35,33,31,0.08)] py-20 lg:py-24">
      <div className="container">
        <div className={`rise mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10 ${GLASS}`}>
          <p className="font-mono text-eyebrow uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]">
            Made here
          </p>
          <h2 className="font-display text-display-md font-light leading-[1.04]">Built in Aotearoa.</h2>
          <p className="max-w-md text-body-md text-[color:var(--text-body)]">
            assembl is made in Aotearoa, for the work New Zealand teams actually do — with NZ rules,
            NZ sources, and a human signing off every output.
          </p>
          <div>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)] transition-all hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
