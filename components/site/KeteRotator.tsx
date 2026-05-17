'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Kete } from '@/lib/kete';
import { TeReo } from './TeReo';

const INITIAL_ROTATION_DELAY_MS = 11000;
const ROTATION_DELAY_MS = 2500;

export function KeteRotator({
  ketes,
  className = '',
  scale = 'standard',
  activeSlug,
  onActiveSlugChange,
  actions,
}: {
  ketes: Kete[];
  className?: string;
  scale?: 'standard' | 'immersive';
  activeSlug?: Kete['slug'];
  onActiveSlugChange?: (slug: Kete['slug']) => void;
  actions?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ordered = useMemo(() => ketes.filter((kete) => kete.slug !== 'toro').concat(ketes.filter((kete) => kete.slug === 'toro')), [ketes]);
  const controlledIndex = activeSlug ? ordered.findIndex((kete) => kete.slug === activeSlug) : -1;
  const currentIndex = controlledIndex >= 0 ? controlledIndex : index % ordered.length;
  const current = ordered[currentIndex];

  useEffect(() => {
    if (paused || reduceMotion || ordered.length < 2) return undefined;
    const delay = currentIndex === 0 ? INITIAL_ROTATION_DELAY_MS : ROTATION_DELAY_MS;
    const timer = window.setTimeout(() => {
      const nextIndex = (currentIndex + 1) % ordered.length;
      const nextSlug = ordered[nextIndex].slug;
      if (onActiveSlugChange) {
        onActiveSlugChange(nextSlug);
      } else {
        setIndex(nextIndex);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [currentIndex, onActiveSlugChange, ordered, paused, reduceMotion]);

  return (
    <div
      className={[
        'grid items-center gap-10 md:grid-cols-[minmax(24rem,0.82fr)_minmax(0,1.22fr)] md:gap-8 lg:gap-12',
        className,
      ].join(' ')}
    >
      <div className="relative z-10 md:max-w-[42rem]">
        <h1
          className={[
            'font-display font-light leading-[0.95] tracking-[-0.02em] text-[color:var(--text-primary)]',
            scale === 'immersive'
              ? 'text-[clamp(3.3rem,15vw,6rem)] md:text-[clamp(4rem,7.4vw,7.8rem)]'
              : 'text-display-xl',
          ].join(' ')}
        >
          <TeReo title="work">Mahi</TeReo> that earns its proof.
        </h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.slug}
            initial={reduceMotion ? false : { opacity: 0.6, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0.6, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={[
                'mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display font-light leading-[0.98] tracking-[-0.02em]',
                scale === 'immersive'
                  ? 'min-h-[clamp(2.8rem,12vw,4.5rem)] text-[clamp(2.7rem,12vw,4.5rem)] md:min-h-[clamp(3.4rem,5vw,5.6rem)] md:text-[clamp(3rem,5vw,5.8rem)]'
                  : 'min-h-[3.5rem] text-display-lg',
              ].join(' ')}
            >
              <span>for</span>
              <span lang="mi" style={{ color: current.accent }}>
                {current.name}
              </span>
              <span>.</span>
            </div>
            <p
              className={[
                'mt-6 max-w-2xl text-[color:var(--text-body)]',
                scale === 'immersive' ? 'text-body-md md:text-body-lg' : 'text-body-md',
              ].join(' ')}
            >
              {current.industry} specialist agents. Human review. Evidence packs.
            </p>
          </motion.div>
        </AnimatePresence>
        {actions}
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="mt-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(35,33,31,0.16)] bg-white/55 text-[color:var(--text-secondary)] transition hover:border-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
          aria-pressed={paused || Boolean(reduceMotion)}
          aria-label={paused || reduceMotion ? 'Resume animation' : 'Pause animation'}
        >
          {paused || reduceMotion ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
        </button>
      </div>

      <div className="relative -mx-6 aspect-[5/4] overflow-hidden bg-[#FAF7F2] md:mx-0 md:-mr-10 md:min-h-[min(68svh,760px)] lg:-mr-14 xl:-mr-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.heroImage}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0.6, scale: 1.015 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0.6, scale: 0.992 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={current.heroImage}
              alt={`${current.name} vessel — ${current.industry}`}
              fill
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? undefined : 'lazy'}
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 50%' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
