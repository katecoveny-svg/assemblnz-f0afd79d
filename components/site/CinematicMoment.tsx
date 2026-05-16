'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CANON_TRANSITION, REVEAL_INITIAL, REVEAL_ANIMATE } from '@/components/motion';

export function CinematicMoment({
  eyebrow,
  title,
  children,
  media,
  accent = 'var(--assembl-pounamu)',
  className = '',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  media?: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-[color:var(--assembl-paper)] py-24 lg:py-32 ${className}`}>
      <div className="absolute inset-0 -z-10 opacity-80">
        {media}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--assembl-paper)_0%,rgba(250,247,242,0.86)_44%,rgba(250,247,242,0.35)_100%)]" />
      </div>
      <motion.div
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={{ once: true, margin: '-120px' }}
        transition={CANON_TRANSITION}
        className="container"
      >
        <div className="max-w-3xl border-l pl-6" style={{ borderColor: accent }}>
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-4 font-display text-display-lg font-light text-[color:var(--text-primary)]">
            {title}
          </h2>
          {children && <div className="mt-6 text-body-lg text-[color:var(--text-body)]">{children}</div>}
        </div>
      </motion.div>
    </section>
  );
}
