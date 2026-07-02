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

// Loader pulse constants — Kate's locked spec (2026-07-02): each dot cycles
// opacity 0.3 → 1.0 → 0.3 over 1.5s, staggered 200ms per dot.
const LOADER_OPACITY_MIN = 0.3;
const LOADER_OPACITY_MAX = 1.0;
const LOADER_CYCLE_S = 1.5;
const LOADER_STAGGER_S = 0.2;

/**
 * The branded loader pulse: opacity 0.3 → 1.0 → 0.3 over a 1.5s cycle,
 * staggered 200ms per dot. Apply to each dot; stagger via the `custom` index.
 */
export const assemblingLoader: Variants = {
  initial: { opacity: LOADER_OPACITY_MIN },
  animate: (i: number = 0) => ({
    opacity: [LOADER_OPACITY_MIN, LOADER_OPACITY_MAX, LOADER_OPACITY_MIN],
    transition: {
      duration: LOADER_CYCLE_S,
      ease: 'easeInOut',
      repeat: Infinity,
      delay: i * LOADER_STAGGER_S,
    },
  }),
};

// Matariki cluster used by the loader — 7 hand-placed dots (spec allows 5–9),
// scattered like the star cluster rather than a geometric ring. Deterministic
// literals so server and client always agree.
const LOADER_DOTS: Array<{ x: number; y: number; r: number }> = [
  { x: 12, y: 5.5, r: 2 },
  { x: 6.6, y: 9, r: 1.4 },
  { x: 17.2, y: 8.2, r: 1.6 },
  { x: 4.8, y: 15, r: 1.1 },
  { x: 12.4, y: 12.8, r: 1.8 },
  { x: 19.2, y: 14.6, r: 1.2 },
  { x: 9, y: 18.6, r: 1.5 },
];

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
 * chat (Kate's locked spec, 2026-07-02):
 *
 *   - a matariki cluster of 7 champagne-gold (#BFA37A) dots on paper white
 *   - dots pulse on a 200ms stagger, 1.5s cycle, opacity 0.3 → 1.0
 *   - below the cluster, a tiny Space Mono `ASSEMBLING…` label —
 *     uppercase, tracked 0.16em, ink at 60% opacity
 *   - fully static under prefers-reduced-motion
 *
 * Dependency-light (framer-motion + react only). This replaces every
 * "typing…" / spinner state in the pilot workspace chat UIs.
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
        flexDirection: 'column',
        alignItems: 'center',
        gap: size * 0.3,
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        {LOADER_DOTS.map((d, i) =>
          reduced ? (
            <circle
              key={i}
              cx={d.x.toFixed(2)}
              cy={d.y.toFixed(2)}
              r={d.r}
              fill={palette.accentGold}
              opacity={0.8}
            />
          ) : (
            <motion.circle
              key={i}
              cx={d.x.toFixed(2)}
              cy={d.y.toFixed(2)}
              r={d.r}
              fill={palette.accentGold}
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
          fontFamily: typography.mono.fontFamily,
          fontSize: Math.max(8, Math.round(size * 0.45)),
          letterSpacing: typography.mono.letterSpacing,
          textTransform: 'uppercase',
          color: palette.ink,
          opacity: 0.6,
        }}
      >
        {label}
      </span>
    </span>
  );
}
