'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Kete } from '@/lib/kete';

/**
 * KeteVesselCard — single 1:1 kete card with locked vessel imagery.
 * Hovers lift + tints the kete accent. Status pill renders mothballed/coming-soon.
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
  const status =
    kete.status === 'active' ? 'Live' : kete.status === 'coming-soon' ? 'Coming soon' : 'Pending';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.02,
              transition: { type: 'spring', stiffness: 320, damping: 28, mass: 0.6 },
            }
      }
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/kete/${kete.slug}`}
        className="kete-card group block overflow-hidden"
        style={{ ['--kete-accent' as string]: `${kete.accent}59` }}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={vesselSrc}
            alt={`${kete.name} vessel — ${kete.industry}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(180deg, transparent 50%, ${kete.accent}33 100%)`,
            }}
          />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[rgba(250,247,242,0.85)] px-3 py-1 backdrop-blur-md">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: kete.accent }}
              aria-hidden
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
              {status}
            </span>
          </div>
        </div>
        <div className="p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
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
