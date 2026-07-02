'use client';

/**
 * @assembl/canvas/motion — framer-motion primitives from the locked spec
 * (DIRECTION-LOCKED-2026-07-01):
 *
 *   - drift     — particulate landscape, 5–10% opacity shift, 60s cycle
 *   - pulse     — constellation dots, 1.5s ease, 40% opacity range
 *   - levitate  — cards, 2–4px translate-y, 400ms ease
 *   - assemblingLoader — the branded typing/loading state
 *
 * Every consumer must hold still under prefers-reduced-motion; the
 * `<AssemblingLoader />` component here does that for you.
 */

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { motionTokens, palette, typography } from './tokens';

/** Landscape drift: 5–10% opacity shift over a 60s cycle. */
export const drift: Variants = {
  initial: { opacity: motionTokens.drift.opacityMax },
  animate: {
    opacity: [
      motionTokens.drift.opacityMax,
      motionTokens.drift.opacityMin,
      motionTokens.drift.opacityMax,
    ],
    transition: {
      duration: motionTokens.drift.durationS,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/** Constellation pulse: 1.5s ease, 40% opacity range (0.5 → 0.9). */
export const pulse: Variants = {
  initial: { opacity: motionTokens.pulse.opacityMin },
  animate: {
    opacity: [motionTokens.pulse.opacityMin, motionTokens.pulse.opacityMax],
    transition: {
      duration: motionTokens.pulse.durationS,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

/** Card levitate on hover: 2–4px translate-y, 400ms ease. */
export const levitate: Variants = {
  rest: { y: 0 },
  hover: {
    y: motionTokens.levitate.translateYPx,
    transition: {
      duration: motionTokens.levitate.durationMs / 1000,
      ease: 'easeOut',
    },
  },
};

/**
 * The branded loader: the matariki dots breathing at the constellation-pulse
 * cadence while "assembling…" sits beside them in lowercase Cormorant.
 * Apply to each dot; stagger via the `custom` index.
 */
export const assemblingLoader: Variants = {
  initial: { opacity: motionTokens.pulse.opacityMin },
  animate: (i: number = 0) => ({
    opacity: [motionTokens.pulse.opacityMin, motionTokens.pulse.opacityMax],
    transition: {
      duration: motionTokens.pulse.durationS,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
      delay: (i % 3) * 0.25,
    },
  }),
};

// Small radial matariki cluster used by the loader (deterministic trig —
// same geometry as the pilot-chrome ornament, so server and client agree).
const LOADER_DOTS: Array<{ x: number; y: number; r: number }> = (() => {
  const dots = [{ x: 10, y: 10, r: 1.5 }];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 + 0.4;
    dots.push({ x: 10 + 4.4 * Math.cos(a), y: 10 + 4.4 * Math.sin(a), r: 1 });
  }
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    dots.push({ x: 10 + 7.8 * Math.cos(a), y: 10 + 7.8 * Math.sin(a), r: 0.7 });
  }
  return dots;
})();

export interface AssemblingLoaderProps {
  /** Loader copy — lowercase on-brand. Defaults to "assembling…". */
  label?: string;
  /** Cluster size in px. Text scales with it. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * <AssemblingLoader /> — the branded typing/loading state for every agent
 * chat: gently pulsing matariki dot cluster + "assembling…" in lowercase
 * Cormorant. Dependency-light (framer-motion + react only); holds still
 * under prefers-reduced-motion.
 */
export function AssemblingLoader({
  label = 'assembling…',
  size = 20,
  className,
  style,
}: AssemblingLoaderProps) {
  const reduced = useReducedMotion();

  return (
    <span
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.45,
        color: palette.bodyGrey,
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
        {LOADER_DOTS.map((d, i) =>
          reduced ? (
            <circle
              key={i}
              cx={d.x.toFixed(2)}
              cy={d.y.toFixed(2)}
              r={d.r}
              fill={i === 0 ? palette.gold : palette.goldSoft}
              opacity={0.8}
            />
          ) : (
            <motion.circle
              key={i}
              cx={d.x.toFixed(2)}
              cy={d.y.toFixed(2)}
              r={d.r}
              fill={i === 0 ? palette.gold : palette.goldSoft}
              variants={assemblingLoader}
              custom={i}
              initial="initial"
              animate="animate"
            />
          ),
        )}
      </svg>
      <span
        style={{
          fontFamily: typography.display.fontFamily,
          fontWeight: typography.display.fontWeightMin,
          fontSize: size * 0.9,
          letterSpacing: typography.display.letterSpacing,
          textTransform: 'lowercase',
        }}
      >
        {label}
      </span>
    </span>
  );
}
