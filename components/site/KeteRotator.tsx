'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Kete } from '@/lib/kete';
import { TeReo } from './TeReo';

export function KeteRotator({ ketes, className = '' }: { ketes: Kete[]; className?: string }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ordered = useMemo(() => ketes.filter((kete) => kete.slug !== 'toro').concat(ketes.filter((kete) => kete.slug === 'toro')), [ketes]);
  const current = ordered[index % ordered.length];

  useEffect(() => {
    if (paused || reduceMotion || ordered.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % ordered.length), 2500);
    return () => window.clearInterval(timer);
  }, [ordered.length, paused, reduceMotion]);

  return (
    <div className={className}>
      <h1 className="font-display text-display-xl font-light text-[color:var(--text-primary)]">
        <TeReo title="work">Mahi</TeReo> that earns its proof.
      </h1>
      <div className="mt-3 flex min-h-[3.5rem] flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-display-lg font-light">
        <span>for</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={current.slug}
            lang="mi"
            initial={reduceMotion ? false : { opacity: 0.6, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0.6, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: current.accent }}
          >
            {current.name}
          </motion.span>
        </AnimatePresence>
        <span>.</span>
      </div>
      <p className="mt-6 max-w-2xl text-body-md text-[color:var(--text-body)]">
        Specialist agents for NZ operators. Every workflow reviewed by a named person and sealed with an evidence pack.
      </p>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] bg-white/55 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--assembl-pounamu)]"
        aria-pressed={paused || Boolean(reduceMotion)}
      >
        {paused || reduceMotion ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
        {paused || reduceMotion ? 'Resume animation' : 'Pause animation'}
      </button>
    </div>
  );
}
