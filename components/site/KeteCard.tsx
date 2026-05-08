'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Kete } from '@/lib/site-config';

interface KeteCardProps {
  kete: Kete;
  variant?: 'home' | 'index' | 'large';
}

const STATUS_LABELS: Record<Kete['status'], string> = {
  pilot: 'Pilot live',
  shortly: 'Shortly',
  roadmap: 'Roadmap',
};

/**
 * Kete vessel card — 1:1 vessel image + industry + name + tagline.
 * Hover: 2px lift + subtle scale (Linear-style hover precision).
 * Per Interactive Web Canon §6.
 */
export function KeteCard({ kete, variant = 'home' }: KeteCardProps) {
  const isLarge = variant === 'large' || variant === 'index';

  return (
    <motion.article
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group relative"
    >
      <Link
        href={`/kete/${kete.slug}`}
        className="block overflow-hidden rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-mist)] transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)]"
        style={{ '--kete-bg': `${kete.accentTint}18` } as React.CSSProperties}
        aria-label={`${kete.name} — ${kete.industry}`}
      >
        {/* Vessel image */}
        <div
          className={`relative ${isLarge ? 'aspect-square' : 'aspect-square'} overflow-hidden`}
          style={{ backgroundColor: `${kete.accentTint}20` }}
        >
          <Image
            src={kete.vesselSquare}
            alt={`${kete.name} vessel — ${kete.industry}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>

        {/* Card body */}
        <div className="p-4 md:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
            {kete.industry}
          </p>
          <h3
            className="mt-1 font-display text-xl leading-tight text-[color:var(--text-primary)]"
            style={{ fontWeight: 400 }}
          >
            {kete.name}
          </h3>
          {isLarge && (
            <p className="mt-2 font-body text-sm leading-relaxed text-[color:var(--text-body)] line-clamp-3">
              {kete.tagline}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                kete.status === 'pilot'
                  ? 'bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu)]'
                  : kete.status === 'shortly'
                  ? 'bg-[color:var(--assembl-mist)] text-[color:var(--text-secondary)]'
                  : 'bg-transparent text-[color:var(--text-tertiary)]'
              }`}
            >
              {STATUS_LABELS[kete.status]}
            </span>
            <span
              className="font-mono text-[11px] text-[color:var(--assembl-pounamu)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
