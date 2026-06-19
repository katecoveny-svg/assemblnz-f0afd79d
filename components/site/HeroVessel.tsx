'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The signature evidence-vessel hero image, brought to life:
 *  - a soft entrance (fade + scale),
 *  - a slow continuous float,
 *  - a 3D parallax tilt that follows the pointer,
 *  - a gold light-glint that sweeps across the glass on a loop.
 *
 * All motion is gated on prefers-reduced-motion / coarse pointers; the resting
 * state is the plain, fully-visible image.
 */
export function HeroVessel() {
  const reduce = useReducedMotion();
  const tiltRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduce) return;
    const el = tiltRef.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const cy = (e.clientY - (r.top + r.height / 2)) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1200px) rotateY(${cx * 7}deg) rotateX(${-cy * 7}deg) scale(1.02)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1)';
    };
    window.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce]);

  return (
    <motion.div
      className="relative h-[clamp(440px,60vh,720px)] w-full lg:min-w-[400px]"
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={reduce ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      <div
        ref={tiltRef}
        className="relative h-full w-full"
        style={{ transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)', transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="relative h-full w-full overflow-hidden"
          // Feather the image's rectangular edges into transparency so the
          // vessel reads as a floating object dissolving into the gradient —
          // not a hard cream square pasted on top.
          style={{
            WebkitMaskImage:
              'radial-gradient(ellipse 72% 86% at 60% 48%, #000 38%, rgba(0,0,0,0.6) 60%, transparent 80%)',
            maskImage:
              'radial-gradient(ellipse 72% 86% at 60% 48%, #000 38%, rgba(0,0,0,0.6) 60%, transparent 80%)',
          }}
          animate={reduce ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/images/site/hero-evidence-vessel.png"
            alt="A stack of translucent glass discs held in a fine gold wire frame, threads of gold light connecting points across them — assembl's evidence vessel."
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="select-none object-cover object-[62%_center]"
          />
          {/* gold light-glint sweeping across the glass */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12"
              style={{
                background:
                  'linear-gradient(100deg, transparent, rgba(255,244,214,0.55), transparent)',
                mixBlendMode: 'soft-light',
              }}
              animate={{ x: ['0%', '320%'] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
