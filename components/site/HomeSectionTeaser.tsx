'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Background = 'paper' | 'mist';

/**
 * HomeSectionTeaser — numbered teaser block on the homepage.
 * Eyebrow (mono-caps), Cormorant headline (last line gilded), Inter body, single CTA.
 *
 * Used for the 5 numbered teasers that flank the kete grid + scroll story
 * (01 Pilot Sprint, 02 How it works, 04 Evidence pack, 05 Pricing, 06 Get started).
 */
export function HomeSectionTeaser({
  eyebrow,
  headline,
  body,
  cta,
  background = 'paper',
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
  const bgVar =
    background === 'mist' ? 'var(--assembl-pounamu-paper)' : 'var(--assembl-paper)';

  return (
    <section className="relative py-24 md:py-32" style={{ backgroundColor: bgVar }}>
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            {eyebrow}
          </p>
          <h2
            className="mt-6 font-display leading-[0.98] tracking-tight text-[color:var(--text-primary)]"
            style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.6vw, 4rem)' }}
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
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            {body}
          </p>
          <div className="mt-10">
            <Link
              href={cta.href}
              className={`${primary ? 'cta-primary' : 'btn-ghost'} inline-flex h-12 items-center px-8 text-sm transition-transform hover:-translate-y-0.5 md:text-base`}
            >
              {cta.label}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
