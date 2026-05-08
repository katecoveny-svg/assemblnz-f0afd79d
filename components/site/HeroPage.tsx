'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface HeroPageProps {
  eyebrow: string;
  headline: string | string[];
  /** Body / lede paragraph below the headline */
  body?: string;
  /** Vessel image URL */
  vesselSrc?: string;
  /** Vessel image alt text */
  vesselAlt?: string;
  /** Kete accent tint hex — applied as subtle background wash */
  accentTint?: string;
  /** Primary CTA button (pounamu fill) */
  ctaPrimary?: { label: string; href: string };
  /** Secondary CTA button (gold-thread border) */
  ctaSecondary?: { label: string; href: string };
  /** When true, renders headline-only (no image column). Widens copy to 3 cols. */
  noImage?: boolean;
}

/**
 * Interior page hero — two-column grid (copy + vessel image).
 * Per Interactive Web Canon §3.2.
 * Supports noImage variant for index pages where the page content IS the visual.
 * Framer Motion fade-in on mount; prefers-reduced-motion fallback to plain div.
 */
export function HeroPage({
  eyebrow,
  headline,
  body,
  vesselSrc,
  vesselAlt,
  accentTint,
  ctaPrimary,
  ctaSecondary,
  noImage = false,
}: HeroPageProps) {
  const shouldReduce = useReducedMotion();
  const headlineLines = Array.isArray(headline) ? headline : [headline];

  const Wrap = shouldReduce ? 'div' : motion.div;
  const fadeProps = shouldReduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      };

  const hasImage = !noImage && !!vesselSrc;

  return (
    <section
      className="relative bg-[color:var(--assembl-paper)] pb-16 pt-28 md:pb-24 md:pt-36"
      style={accentTint ? ({ '--kete-accent': accentTint } as React.CSSProperties) : undefined}
      aria-label={eyebrow}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div
          className={`grid items-center gap-12 ${
            hasImage ? 'grid-cols-1 md:grid-cols-2 lg:gap-20' : 'max-w-3xl'
          }`}
        >
          {/* Copy */}
          <Wrap {...(fadeProps as Record<string, unknown>)}>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              {eyebrow}
            </p>
            <h1
              className="mt-6 font-display leading-[0.96] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 4.4vw, 5rem)' }}
            >
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {body && (
              <p className="mt-6 max-w-prose font-body text-[1.125rem] leading-relaxed text-[color:var(--text-body)]">
                {body}
              </p>
            )}

            {(ctaPrimary || ctaSecondary) && (
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                {ctaPrimary && (
                  <Link
                    href={ctaPrimary.href}
                    className="inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 text-sm font-medium text-[#FAF7F2] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] md:text-base"
                  >
                    {ctaPrimary.label}
                  </Link>
                )}
                {ctaSecondary && (
                  <Link
                    href={ctaSecondary.href}
                    className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
                  >
                    {ctaSecondary.label}
                  </Link>
                )}
              </div>
            )}
          </Wrap>

          {/* Vessel image */}
          {hasImage && (
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl"
              style={accentTint ? { backgroundColor: `${accentTint}20` } : undefined}
            >
              <Image
                src={vesselSrc!}
                alt={vesselAlt ?? eyebrow}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hairline gold rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-30"
        aria-hidden="true"
      />
    </section>
  );
}
