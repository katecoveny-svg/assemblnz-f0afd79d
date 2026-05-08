'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Background = 'paper' | 'mist';

/**
 * HomeSectionTeaser — numbered teaser block on the homepage.
 * Eyebrow (mono-caps), Cormorant headline (last line gilded), Inter body, single CTA.
 *
 * Editorial register: full-bleed cream band, 12-col grid inside max-w-7xl, copy in
 * cols 2-7 with breathing in cols 8-12. Hairline gold-thread rule at 20% opacity
 * separates each chapter; the `background` prop is preserved for back-compat but
 * normalised to a single cream paper register so adjacent sections don't strobe.
 */
export function HomeSectionTeaser({
  eyebrow,
  headline,
  body,
  cta,
  primary = false,
}: {
  eyebrow: string;
  headline: readonly string[];
  body: string;
  cta: { href: string; label: string };
  background?: Background;
  primary?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative py-32 md:py-48"
      style={{ backgroundColor: 'var(--assembl-paper)' }}
    >
      {/* Top hairline — gold-thread at 20% opacity, full-bleed inside max-w-7xl */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto max-w-7xl px-6 md:px-12"
      >
        <div
          className="h-px w-full"
          style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 gap-y-8 pt-20 md:pt-28 lg:grid-cols-12"
        >
          <div className="lg:col-start-2 lg:col-span-6">
            <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:mb-8">
              {eyebrow}
            </p>
            <h2
              className="font-display text-5xl font-light leading-[1.05] tracking-tight text-[color:var(--text-primary)] md:text-6xl lg:text-7xl"
            >
              {headline.map((line, i) => (
                <span key={i} className="block">
                  {i === headline.length - 1 ? (
                    <em className="not-italic text-gradient-hero">{line}</em>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h2>
            <p className="mt-10 text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              {body}
            </p>
            <div className="mt-12">
              <Link
                href={cta.href}
                className={`${primary ? 'cta-primary' : 'btn-ghost'} inline-flex items-center px-8 py-4 text-base transition-transform hover:-translate-y-0.5 md:text-lg`}
              >
                {cta.label}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
