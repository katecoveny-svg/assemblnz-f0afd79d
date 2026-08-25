'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Kete } from '@/lib/kete';

/**
 * KeteVesselCard — single 1:1 kete card with locked vessel imagery.
 * Hovers lift + tints the kete accent. Status pill renders the public launch state.
 */
export function KeteVesselCard({
  kete,
  vesselSrc,
  index = 0,
}: {
  kete: Kete;
  vesselSrc: string;
  index?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0.7, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.02,
              y: -2,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            }
      }
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="focus-within:-translate-y-0.5 focus-within:scale-[1.02] transition-transform duration-300"
    >
      <Link
        href={`/kete/${kete.slug}`}
        className="kete-card group block overflow-hidden rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] focus-visible:outline-offset-2"
        style={{ ['--kete-accent' as string]: `${kete.accent}59` }}
      >
        <div className="relative aspect-square overflow-hidden">
          {vesselSrc ? (
            <img
              src={vesselSrc}
              alt={`${kete.name} vessel — ${kete.industry}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-display text-7xl font-light text-[color:var(--assembl-paper)]"
              style={{ backgroundColor: kete.accent }}
              aria-label={`${kete.name} vessel placeholder`}
            >
              {kete.name.slice(0, 1)}
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{
              background: `linear-gradient(180deg, transparent 50%, ${kete.accent}33 100%)`,
            }}
          />
        </div>
        <div className="p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            {kete.industry} · {kete.accentName}
          </p>
          <h3 className="mt-2 font-display text-3xl text-[color:var(--text-primary)]">
            {kete.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
            {kete.tagline}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
