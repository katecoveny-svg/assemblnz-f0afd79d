'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionProps,
} from 'framer-motion';
import { useRef } from 'react';

/**
 * Shared OS motion chrome — ambient fields, scroll reveals, hover lift.
 * Used across every pilot operating system for wow-factor consistency.
 */

export function OsMotionField({
  accent = '#BFA37A',
  secondary = '#D4A5B0',
  className,
  intensity = 'medium',
}: {
  accent?: string;
  secondary?: string;
  className?: string;
  intensity?: 'soft' | 'medium' | 'bold';
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const alpha = intensity === 'bold' ? '66' : intensity === 'soft' ? '33' : '55';

  return (
    <div
      aria-hidden
      className={['pointer-events-none absolute inset-0 overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
    >
      {[
        { size: 280, x: '4%', y: '8%', color: accent, dur: 16 },
        { size: 200, x: '70%', y: '12%', color: secondary, dur: 20 },
        { size: 340, x: '42%', y: '52%', color: accent, dur: 24 },
        { size: 160, x: '82%', y: '68%', color: secondary, dur: 18 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}${alpha} 0%, transparent 70%)`,
            filter: 'blur(4px)',
            willChange: 'transform',
          }}
          animate={{
            y: [0, -22, 0, 16, 0],
            x: [0, 14, 0, -12, 0],
            scale: [1, 1.08, 1, 0.96, 1],
          }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-30% -15%',
          background:
            'linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.22) 48%, transparent 64%)',
          willChange: 'transform',
        }}
        animate={{ x: ['-18%', '22%', '-18%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export function OsReveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-triggered reveal — fires when the block enters the viewport. */
export function OsScrollReveal({
  children,
  delay = 0,
  className,
  style,
  y = 36,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Hover lift card — used for programme / lead / agent tiles. */
export function OsHoverLift({
  children,
  className,
  style,
  accent,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  accent?: string;
}) {
  const reduce = useReducedMotion();
  const hoverShadow = accent
    ? `0 18px 40px ${accent}33, 0 2px 0 rgba(255,255,255,0.4) inset`
    : '0 18px 40px rgba(0,0,0,0.12), 0 2px 0 rgba(255,255,255,0.4) inset';

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: 'transform' }}
      whileHover={{
        y: -6,
        scale: 1.015,
        boxShadow: hoverShadow,
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

export function OsStagger({
  children,
  className,
  style,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-6% 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const osStaggerItem: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 22, filter: 'blur(3px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Parallax brand-pattern layer that drifts on scroll. */
export function OsParallaxPattern({
  src,
  opacity = 0.1,
  size = 340,
}: {
  src: string;
  opacity?: number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{
          position: 'absolute',
          inset: '-20% 0',
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'repeat',
          backgroundSize: `${size}px auto`,
          opacity,
          y: reduce ? 0 : y,
          willChange: 'transform',
        }}
      />
    </div>
  );
}
