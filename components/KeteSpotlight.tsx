'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Kete } from '@/lib/kete';
import { KeteIllustration } from '@/components/KeteIllustration';
import { agentCountByKete } from '@/lib/agents';

const COUNTS = agentCountByKete();

/**
 * Full-bleed kete spotlight — Joby-style alternating layout.
 * Each kete gets its own section with a huge illustration on one side
 * and editorial copy on the other. Reverses left/right based on `flip`.
 */
export function KeteSpotlight({
  kete,
  description,
  flip = false,
  bg = 'paper',
}: {
  kete: Kete;
  description: string;
  flip?: boolean;
  bg?: 'paper' | 'mist';
}) {
  const count = COUNTS[kete.slug] ?? 0;
  const bgClass = bg === 'mist' ? 'bg-[color:var(--assembl-mist)]/40' : 'bg-[color:var(--assembl-paper)]';

  return (
    <section className={`relative overflow-hidden ${bgClass} py-24 md:py-40`}>
      <div className="container">
        <div
          className={`grid items-center gap-12 lg:gap-20 ${
            flip ? 'lg:grid-cols-[1fr_1.1fr]' : 'lg:grid-cols-[1.1fr_1fr]'
          }`}
        >
          {/* Text */}
          <motion.div
            className={flip ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}
            initial={{ opacity: 0, x: flip ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              {kete.industry}
            </span>
            <h2
              className="mt-5 font-display text-6xl leading-[0.95] tracking-tight text-[color:var(--text-primary)] md:text-7xl lg:text-8xl"
              style={{ fontWeight: 300 }}
            >
              {kete.name}
            </h2>
            <p
              className="mt-6 max-w-xl font-display text-2xl leading-snug text-[color:var(--text-body)] md:text-3xl"
              style={{ fontWeight: 300 }}
            >
              {kete.tagline}
            </p>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              {description}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href={`/kete/${kete.slug}`}
                className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--text-primary)]"
              >
                <span className="border-b border-[color:var(--text-primary)] pb-1 transition-all duration-300 group-hover:border-[color:var(--assembl-soft-gold)] group-hover:text-[color:var(--assembl-sage-mist)]">
                  Explore {kete.name}
                </span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>

              {count > 0 && (
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: kete.accent }}
                >
                  ◆ {count} {count === 1 ? 'agent' : 'agents'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            className={`relative flex justify-center ${flip ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}`}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Soft accent halo behind the kete */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${kete.accent}30 0%, transparent 60%)`,
              }}
            />
            <KeteIllustration
              slug={kete.slug}
              accent={kete.accent}
              className="h-[22rem] w-auto md:h-[30rem] lg:h-[36rem]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
