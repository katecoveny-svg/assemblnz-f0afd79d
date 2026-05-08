'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { TextReveal } from '@/components/motion/TextReveal';
import { HERO_COPY, VESSEL_ASSETS } from '@/lib/site-config';

/**
 * Homepage cinematic vessel hero.
 * Sculptural canon: two-column grid, vessel image + copy.
 * Video: autoplay muted loop (silent rotation); falls back to static 16:9 image.
 * Per Interactive Web Canon §3.1 + §5.
 */
export function HeroSignature() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="relative bg-[color:var(--assembl-paper)] overflow-hidden"
      aria-label="assembl homepage hero"
    >
      {/* Skip-to-content target */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid min-h-[90vh] grid-cols-1 items-center gap-12 py-24 md:grid-cols-2 md:py-32 lg:gap-20">
          {/* LEFT: Copy */}
          <div className="relative z-10 order-2 md:order-1">
            {/* Eyebrow */}
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              {HERO_COPY.eyebrow}
            </p>

            {/* Display headline — word-reveal */}
            <h1
              className="mt-6 font-display leading-[0.96] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 5.5vw, 5.5rem)' }}
            >
              <TextReveal lines={HERO_COPY.headlineLines} />
            </h1>

            {/* Lede */}
            <p className="mt-8 max-w-prose font-body text-[1.125rem] leading-relaxed text-[color:var(--text-body)]">
              {HERO_COPY.lede}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href={HERO_COPY.ctaPrimary.href}
                className="inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 text-sm font-medium text-[#FAF7F2] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
              >
                {HERO_COPY.ctaPrimary.label}
              </Link>
              <Link
                href={HERO_COPY.ctaSecondary.href}
                className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
              >
                {HERO_COPY.ctaSecondary.label}
              </Link>
            </div>

            {/* Bottom labels */}
            <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
              {HERO_COPY.bottomLabels}
            </p>
          </div>

          {/* RIGHT: Vessel image / video */}
          <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-2xl md:order-2">
            {!shouldReduce ? (
              <>
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={VESSEL_ASSETS.portrait4x5}
                  aria-hidden="true"
                >
                  <source src={VESSEL_ASSETS.cinematicVideo} type="video/mp4" />
                </video>
                {/* Fallback if video fails */}
                <noscript>
                  <Image
                    src={VESSEL_ASSETS.portrait4x5}
                    alt="assembl Evidence Vessel — cream ceramic with pounamu glass plates"
                    fill
                    className="object-cover"
                    priority
                  />
                </noscript>
              </>
            ) : (
              <Image
                src={VESSEL_ASSETS.portrait4x5}
                alt="assembl Evidence Vessel — cream ceramic with pounamu glass plates"
                fill
                className="object-cover"
                priority
              />
            )}

            {/* Subtle grain overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'repeat',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Hairline rule bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-40" aria-hidden="true" />
    </section>
  );
}
