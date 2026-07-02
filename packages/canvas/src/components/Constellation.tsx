'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTokens, palette } from '../tokens';

/**
 * <Constellation /> — the matariki dot-cluster mark: nine gold stars with
 * fine connecting lines on a transparent ground.
 *
 * Motion: soft pulse (1.5s ease, 40% opacity range), staggered so the
 * cluster shimmers rather than blinks. prefers-reduced-motion → still.
 *
 * Geometry is fixed (no randomness) so SSR and client always agree.
 */

// Nine stars — the matariki cluster, hand-placed to echo the reference art.
const STARS: Array<{ x: number; y: number; r: number; bright?: boolean }> = [
  { x: 50, y: 42, r: 2.6, bright: true }, // matariki (centre)
  { x: 30, y: 26, r: 1.7 },
  { x: 66, y: 20, r: 1.9, bright: true },
  { x: 82, y: 38, r: 1.5 },
  { x: 74, y: 62, r: 1.8 },
  { x: 52, y: 74, r: 1.4 },
  { x: 28, y: 66, r: 1.9, bright: true },
  { x: 16, y: 46, r: 1.4 },
  { x: 42, y: 12, r: 1.2 },
];

// Fine connecting lines between neighbouring stars (indices into STARS).
const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 4],
  [0, 6],
  [1, 8],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 1],
  [8, 2],
];

export interface ConstellationProps {
  /** Rendered size in px (square). */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Constellation({ size = 100, className, style }: ConstellationProps) {
  const reduced = useReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={className}
      style={style}
    >
      {LINKS.map(([a, b], i) => (
        <line
          key={`l${i}`}
          x1={STARS[a].x}
          y1={STARS[a].y}
          x2={STARS[b].x}
          y2={STARS[b].y}
          stroke={palette.goldSoft}
          strokeWidth="0.5"
          opacity="0.45"
        />
      ))}
      {STARS.map((s, i) => {
        const fill = s.bright ? palette.gold : palette.goldSoft;
        if (reduced) {
          return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={fill} opacity={0.8} />;
        }
        return (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={fill}
            initial={{ opacity: motionTokens.pulse.opacityMin }}
            animate={{
              opacity: [motionTokens.pulse.opacityMin, motionTokens.pulse.opacityMax],
            }}
            transition={{
              duration: motionTokens.pulse.durationS,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse',
              delay: (i % 3) * 0.5,
            }}
          />
        );
      })}
    </svg>
  );
}
