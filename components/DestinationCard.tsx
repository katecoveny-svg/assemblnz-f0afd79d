'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Big destination card on the new minimal homepage.
 * Click → routes to that page. Image-dominant, hover-rich.
 */
export function DestinationCard({
  href,
  eyebrow,
  title,
  description,
  accent,
  visual,
  index = 0,
  bg = 'paper',
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  visual: ReactNode;
  index?: number;
  bg?: 'paper' | 'mist' | 'ink';
}) {
  const bgClass =
    bg === 'ink'
      ? 'bg-[color:var(--assembl-taupe-deep)] text-[color:var(--assembl-paper)]'
      : bg === 'mist'
        ? 'bg-[color:var(--assembl-mist)]/60'
        : 'bg-[color:var(--assembl-paper)]';

  const eyebrowClass =
    bg === 'ink' ? 'text-[rgba(250,247,242,0.55)]' : 'text-[color:var(--text-secondary)]';
  const titleClass =
    bg === 'ink' ? 'text-[color:var(--assembl-paper)]' : 'text-[color:var(--text-primary)]';
  const descClass =
    bg === 'ink' ? 'text-[rgba(250,247,242,0.75)]' : 'text-[color:var(--text-body)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={href}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-[rgba(35,33,31,0.08)] p-10 transition-all duration-700 hover:-translate-y-1 hover:border-[rgba(35,33,31,0.20)] hover:shadow-[0_32px_64px_rgba(58,56,50,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:-translate-y-1 md:p-14 ${bgClass}`}
        style={{ ['--card-accent' as string]: accent, minHeight: '420px' }}
      >
        {/* Soft accent halo — top-right, intensifies on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-2xl transition-opacity duration-700 group-hover:opacity-80 group-focus-visible:opacity-80"
          style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
        />

        {/* Visual block — top */}
        <div className="relative z-10">{visual}</div>

        {/* Text block — bottom */}
        <div className="relative z-10 mt-8">
          <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${eyebrowClass}`}>
            {eyebrow}
          </p>
          <h3
            className={`mt-4 font-display leading-[0.95] tracking-tight ${titleClass}`}
            style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}
          >
            {title}
          </h3>
          <p className={`mt-5 max-w-md text-base leading-relaxed ${descClass}`}>{description}</p>
          <div className="mt-7 flex items-center gap-2">
            <span
              className="font-mono text-xs uppercase tracking-[0.28em]"
              style={{ color: bg === 'ink' ? 'var(--assembl-soft-gold)' : accent }}
            >
              Enter →
            </span>
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1"
              style={{ color: bg === 'ink' ? 'var(--assembl-soft-gold)' : accent }}
              aria-hidden
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
