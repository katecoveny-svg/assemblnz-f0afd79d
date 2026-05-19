'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  body,
}: {
  ketes: Kete[];
  className?: string;
  scale?: 'standard' | 'immersive';
  activeSlug?: Kete['slug'];
  onActiveSlugChange?: (slug: Kete['slug']) => void;
  actions?: ReactNode;
  body?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ordered = useMemo(() => ketes.filter((kete) => kete.slug !== 'toro').concat(ketes.filter((kete) => kete.slug === 'toro')), [ketes]);
  const controlledIndex = activeSlug ? ordered.findIndex((kete) => kete.slug === activeSlug) : -1;
  const currentIndex = controlledIndex >= 0 ? controlledIndex : index % ordered.length;
  const current = ordered[currentIndex];
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  });
  const stageRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-4, 0, 4]);
  const stageY = useTransform(scrollYProgress, [0, 1], ['-5%', '7%']);
  const vesselScale = useTransform(scrollYProgress, [0, 0.45, 1], [1.1, 1, 0.94]);
  const sheenX = useTransform(scrollYProgress, [0, 1], ['-28%', '28%']);

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
        'grid items-center gap-10 md:grid-cols-[minmax(34rem,0.92fr)_minmax(0,1.08fr)] md:gap-10 lg:gap-14',
        className,
      ].join(' ')}
    >
      <div className="relative z-10 order-2 md:order-1 md:max-w-[50rem]">
        <h1
          className={[
            'font-display font-light leading-[0.95] tracking-normal text-[color:var(--assembl-pounamu)]',
            scale === 'immersive'
              ? 'text-[clamp(3.3rem,15vw,6rem)] md:text-[clamp(5.6rem,8.8vw,10.5rem)]'
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
                'mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display font-light italic leading-[0.98] tracking-normal',
                scale === 'immersive'
                  ? 'min-h-[clamp(2.8rem,12vw,4.5rem)] text-[clamp(2.7rem,12vw,4.5rem)] md:min-h-[clamp(4.5rem,5.4vw,6.4rem)] md:text-[clamp(4.1rem,5.4vw,6.4rem)]'
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
                scale === 'immersive' ? 'text-body-md md:text-[clamp(1.1rem,1vw,1.45rem)] md:leading-[1.55]' : 'text-body-md',
              ].join(' ')}
            >
              Specialist agents for the admin work that drains your team. Built in Aotearoa.
            </p>
            {body ? (
              <div className="mt-5 max-w-[580px] text-body-md leading-relaxed text-[color:var(--text-body)]">
                {body}
              </div>
            ) : null}
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

      <motion.div
        ref={stageRef}
        className="relative order-1 -mx-6 h-[42svh] min-h-[260px] max-h-[360px] overflow-hidden rounded-b-[34px] border-b border-[rgba(35,33,31,0.08)] bg-[#FAF7F2] shadow-[0_34px_120px_rgba(35,33,31,0.13)] [perspective:1400px] md:order-2 md:mx-0 md:-mr-10 md:h-auto md:max-h-none md:min-h-[min(76svh,860px)] md:rounded-[34px] md:border lg:-mr-14 xl:-mr-20"
        style={reduceMotion ? undefined : { rotateY: stageRotate, y: stageY }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.16] mix-blend-multiply motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/vessel-canon-landscape-poster.jpg"
          aria-hidden
        >
          <source src="/videos/vessel-canon-landscape-720p.mp4" type="video/mp4" />
        </video>
        <motion.div
          className="pointer-events-none absolute inset-y-[-12%] left-1/2 z-20 w-1/3 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.52),transparent)] blur-xl"
          style={reduceMotion ? undefined : { x: sheenX }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_54%_42%,transparent_0%,transparent_35%,rgba(250,247,242,0.32)_78%),linear-gradient(120deg,rgba(255,255,255,0.34),transparent_42%,rgba(35,33,31,0.08))]"
          aria-hidden
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={current.heroImage}
            className="absolute inset-0 z-0"
            initial={reduceMotion ? false : { opacity: 0.4, scale: 1.08, rotateX: 2 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotateX: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0.35, scale: 0.96, rotateX: -2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={reduceMotion ? undefined : { scale: vesselScale }}
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
        <div className="absolute bottom-4 left-4 right-4 z-30 grid grid-cols-3 gap-2 text-[color:var(--text-primary)] md:bottom-6 md:left-6 md:right-6">
          {[
            ['01', current.accentName],
            ['02', current.industry],
            ['03', 'proof sealed'],
          ].map(([label, value]) => (
            <div
              key={`${label}-${value}`}
              className="rounded-[16px] border border-white/38 bg-[#FAF7F2]/58 px-3 py-3 shadow-[0_18px_48px_rgba(35,33,31,0.12)] backdrop-blur-xl"
            >
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                {label}
              </span>
              <span className="mt-1 block truncate font-display text-lg italic leading-none md:text-2xl">
                {value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
