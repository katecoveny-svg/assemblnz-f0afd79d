'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Kete } from '@/lib/kete';

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
  const { scrollYProgress } = useScroll();
  const stageRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-4, 0, 4]);
  const stageY = useTransform(scrollYProgress, [0, 1], ['-5%', '7%']);
  const vesselScale = useTransform(scrollYProgress, [0, 0.45, 1], [1.1, 1, 0.94]);
  const sheenX = useTransform(scrollYProgress, [0, 1], ['-28%', '28%']);
  const immersive = scale === 'immersive';

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

  if (immersive) {
    return (
      <div
        className={[
          'relative grid min-h-[calc(100svh-5.5rem)] items-center gap-8 overflow-hidden md:grid-cols-[minmax(26rem,0.78fr)_minmax(36rem,1.22fr)] md:gap-10 lg:gap-14',
          className,
        ].join(' ')}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_78%_34%,color-mix(in_srgb,var(--kete-accent)_18%,transparent),transparent_30%),linear-gradient(90deg,#FAF7F2_0%,#FAF7F2_44%,rgba(250,247,242,0.78)_66%,rgba(250,247,242,0.2)_100%)]"
          aria-hidden
        />

        <div className="relative z-20 order-2 max-w-[42rem] pb-12 md:order-1 md:pb-0">
          <h1 className="font-display text-[clamp(4rem,17vw,5.75rem)] font-light leading-[0.9] tracking-normal text-[#0F4A3E] md:text-[clamp(6.2rem,7.2vw,9.6rem)] md:leading-[0.88]">
            Mahi that earns its proof.
          </h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={reduceMotion ? false : { opacity: 0.92, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0.72, y: -8 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mt-3 font-display text-[clamp(2.55rem,11vw,3.8rem)] font-light italic leading-[0.95] text-[color:var(--text-primary)] md:text-[clamp(3.6rem,4.5vw,5.8rem)] md:leading-[0.92]">
                for <span lang="mi" style={{ color: current.accent }}>{current.name}</span>.
              </p>
              <p className="mt-6 max-w-[36rem] text-[clamp(1.05rem,4.7vw,1.35rem)] font-medium leading-[1.35] text-[#23211F] md:mt-7 md:text-[clamp(1.32rem,1.28vw,1.72rem)]">
                Practical assistants for the admin work that drains your team. Built in Aotearoa.
              </p>
              {body ? (
                <div className="mt-5 max-w-[34rem] text-[0.98rem] leading-[1.65] text-[#3D4250] md:text-[1.04rem] [&_p]:font-medium">
                  {body}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
          {actions}
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(35,33,31,0.16)] bg-white/58 text-[color:var(--text-secondary)] shadow-[0_14px_38px_rgba(35,33,31,0.08)] backdrop-blur-md transition hover:border-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            aria-pressed={paused || Boolean(reduceMotion)}
            aria-label={paused || reduceMotion ? 'Resume animation' : 'Pause animation'}
          >
            {paused || reduceMotion ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
          </button>
        </div>

        <motion.div
          ref={stageRef}
          className="relative z-10 order-1 -mx-6 h-[46svh] min-h-[300px] overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[#F7F1E9] shadow-[0_34px_120px_rgba(35,33,31,0.1)] md:order-2 md:-mr-[7vw] md:mx-0 md:h-[min(78svh,850px)] md:min-h-[620px] md:rounded-l-[34px] md:border md:border-r-0 md:shadow-[0_46px_160px_rgba(35,33,31,0.14)]"
          style={reduceMotion ? undefined : { y: stageY, rotateY: stageRotate }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-multiply motion-reduce:hidden"
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
          <AnimatePresence mode="wait">
            <motion.div
              key={current.heroImage}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0.6, scale: 1.05, x: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0.52, scale: 0.98, x: -18 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={reduceMotion ? undefined : { scale: vesselScale }}
            >
              <Image
                src={current.heroImage}
                alt={`${current.name} vessel — ${current.industry}`}
                fill
                priority={currentIndex === 0}
                loading={currentIndex === 0 ? undefined : 'lazy'}
                sizes="(min-width: 1280px) 58vw, (min-width: 768px) 54vw, 100vw"
                className="object-cover"
                style={{ objectPosition: current.slug === 'toro' ? '50% 44%' : '50% 50%' }}
              />
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="pointer-events-none absolute inset-y-[-12%] left-1/2 z-20 w-1/3 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] blur-xl"
            style={reduceMotion ? undefined : { x: sheenX }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(250,247,242,0.22)_0%,transparent_28%,transparent_100%),radial-gradient(circle_at_48%_50%,transparent_0%,transparent_54%,rgba(35,33,31,0.08)_100%)]"
            aria-hidden
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={[
        immersive
          ? 'grid items-center gap-8 md:grid-cols-[minmax(26rem,0.82fr)_minmax(0,1.18fr)] md:gap-12 lg:gap-16 xl:gap-20'
          : 'grid items-center gap-10 md:grid-cols-[minmax(34rem,0.92fr)_minmax(0,1.08fr)] md:gap-10 lg:gap-14',
        className,
      ].join(' ')}
    >
      <div className={immersive ? 'relative z-10 order-2 md:order-1 md:max-w-[44rem] xl:max-w-[48rem]' : 'relative z-10 order-2 md:order-1 md:max-w-[50rem]'}>
        <h1
          className={[
            'font-display font-light leading-[0.95] tracking-normal text-[color:var(--assembl-pounamu)]',
            immersive
              ? 'text-[clamp(4rem,17vw,6.5rem)] md:text-[clamp(6.2rem,7.5vw,9.4rem)] xl:text-[clamp(6.8rem,7vw,10rem)]'
              : 'text-display-xl',
          ].join(' ')}
        >
          Mahi that earns its proof.
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
                immersive
                  ? 'min-h-[clamp(2.8rem,12vw,4.5rem)] text-[clamp(2.7rem,12vw,4.5rem)] md:min-h-[clamp(4.1rem,4.8vw,5.8rem)] md:text-[clamp(3.8rem,4.8vw,5.8rem)]'
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
                immersive ? 'text-body-md md:text-[clamp(1.05rem,0.92vw,1.28rem)] md:leading-[1.55]' : 'text-body-md',
              ].join(' ')}
            >
              Practical assistants for the admin work that drains your team. Built in Aotearoa.
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
        className={[
          'relative order-1 overflow-hidden bg-[#FAF7F2] [perspective:1400px] md:order-2',
          immersive
            ? '-mx-6 h-[42svh] min-h-[300px] rounded-b-[28px] border-b border-[rgba(35,33,31,0.08)] shadow-[0_34px_120px_rgba(35,33,31,0.10)] md:mx-0 md:-mr-10 md:h-[min(78svh,860px)] md:min-h-[620px] md:rounded-none md:border-0 md:bg-transparent md:shadow-none lg:-mr-16 xl:-mr-24 2xl:-mr-32'
            : '-mx-6 h-[42svh] min-h-[260px] max-h-[360px] rounded-b-[34px] border-b border-[rgba(35,33,31,0.08)] shadow-[0_34px_120px_rgba(35,33,31,0.13)] md:mx-0 md:-mr-10 md:h-auto md:max-h-none md:min-h-[min(76svh,860px)] md:rounded-[34px] md:border lg:-mr-14 xl:-mr-20',
        ].join(' ')}
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
              className={[
                'rounded-[16px] border border-white/38 bg-[#FAF7F2]/58 px-3 py-3 shadow-[0_18px_48px_rgba(35,33,31,0.12)] backdrop-blur-xl',
                immersive ? 'md:bg-[#FAF7F2]/42 md:shadow-[0_16px_42px_rgba(35,33,31,0.08)]' : '',
              ].join(' ')}
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
