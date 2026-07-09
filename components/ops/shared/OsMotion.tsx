'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Shared OS motion chrome — framer ambient field used across pilot operating
 * systems. Intentionally quiet: three drifting orbs + a soft sheen so the
 * brand pattern wallpaper stays readable underneath.
 */
export function OsMotionField({
  accent = '#BFA37A',
  secondary = '#D4A5B0',
  className,
}: {
  accent?: string;
  secondary?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={['pointer-events-none absolute inset-0 overflow-hidden', className].filter(Boolean).join(' ')}
    >
      {[
        { size: 220, x: '8%', y: '12%', color: accent, dur: 18 },
        { size: 160, x: '72%', y: '18%', color: secondary, dur: 22 },
        { size: 280, x: '48%', y: '58%', color: accent, dur: 26 },
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
            background: `radial-gradient(circle, ${orb.color}55 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
          animate={{
            y: [0, -18, 0, 14, 0],
            x: [0, 10, 0, -8, 0],
            scale: [1, 1.06, 1, 0.97, 1],
          }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-20% -10%',
          background:
            'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 48%, transparent 62%)',
        }}
        animate={{ x: ['-12%', '18%', '-12%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
