'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Kete } from '@/lib/kete';

export function KeteCard({ kete, index = 0 }: { kete: Kete; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/kete/${kete.slug}`}
        data-kete={kete.slug}
        className="kete-card group relative block h-full overflow-hidden rounded-card border border-[rgba(35,33,31,0.08)] bg-white/55 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-[rgba(35,33,31,0.18)] hover:shadow-[0_24px_48px_rgba(43,107,87,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-soft-gold)] md:p-10"
        style={{ ['--kete-accent' as string]: kete.accent }}
      >
        {/* Accent stripe — left edge */}
        <span
          aria-hidden
          className="absolute left-0 top-8 h-12 w-1 rounded-r transition-all duration-500 group-hover:top-0 group-hover:h-full"
          style={{ backgroundColor: kete.accent }}
        />

        {/* Soft accent glow — top-right corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-40 transition-opacity duration-500 group-hover:opacity-90"
          style={{
            background: `radial-gradient(circle, ${kete.accent} 0%, transparent 70%)`,
          }}
        />

        <div className="relative">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              {kete.industry}
            </span>
            <ArrowUpRight
              className="h-5 w-5 text-[color:var(--text-secondary)] transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[color:var(--text-primary)]"
              aria-hidden
            />
          </div>

          <h3 className="mt-5 font-display text-3xl text-[color:var(--text-primary)] md:text-4xl">
            {kete.name}
          </h3>

          <p className="mt-4 text-base leading-relaxed text-[color:var(--text-body)]">
            {kete.tagline}
          </p>

          {/* Hover-only CTA — slides up on hover */}
          <div className="mt-6 flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[11px] text-[color:var(--text-secondary)]">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full transition-transform duration-500 group-hover:scale-150"
                style={{ backgroundColor: kete.accent }}
              />
              {kete.accentName}
            </span>
            <span
              className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ color: kete.accent }}
            >
              View {kete.name} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
