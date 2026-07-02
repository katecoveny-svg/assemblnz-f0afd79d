'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTokens, palette } from '../tokens';
import { gauss, mulberry32 } from '../seeded';

/**
 * <ParticulateLandscape /> — the silvery-gold particulate mountain-and-wave
 * landscape from DIRECTION-LOCKED-2026-07-01, generated as SVG.
 *
 * The field is deterministic (seeded PRNG, computed once at module load —
 * never Math.random() at render) so SSR and client hydration always agree.
 *
 * Motion: the whole scene drifts slowly (5–10% opacity shift, 60s cycle).
 * prefers-reduced-motion → the same SVG rendered static, or the optional
 * `staticSrc` PNG if one is provided.
 */

const VIEW_W = 1600;
const VIEW_H = 600;

type Dot = { x: number; y: number; r: number; fill: string; opacity: number };

// Weighted particulate palette — silvers dominate, blue undertone cools the
// shadows, gold flecks stay sparse and ornamental (per the locked spec).
function pickFill(rand: () => number): string {
  const t = rand();
  if (t < 0.34) return palette.silver; // #D8D6CE
  if (t < 0.6) return palette.silverDeep; // #B5B0A2
  if (t < 0.76) return palette.cream; // #C9C5BA
  if (t < 0.92) return palette.blueUndertone; // #8DA0B8
  return rand() < 0.5 ? palette.gold : palette.goldSoft; // #BFA37A / #D9B87A
}

/** Mountain ridge line — two overlapping peaks left-of-centre. */
function ridgeY(x: number): number {
  const peak1 = 210 * Math.exp(-(((x - 430) / 240) ** 2));
  const peak2 = 120 * Math.exp(-(((x - 760) / 320) ** 2));
  const swell = 24 * Math.sin(x / 210);
  return 468 - peak1 - peak2 - swell;
}

/** Wave flow — a band curling from mid-frame up to the right edge. */
function waveY(x: number): number {
  const t = (x - 640) / (VIEW_W - 640);
  return 470 - 130 * t + 46 * Math.sin(t * Math.PI * 2.2);
}

function buildField(seed: number): { dots: Dot[]; ridgePath: string; wavePath: string } {
  const rand = mulberry32(seed);
  const dots: Dot[] = [];

  // Mountain body: dots cluster at the ridge crest and thin out below it.
  for (let i = 0; i < 420; i++) {
    const x = rand() * VIEW_W;
    const spread = 26 + rand() * 130;
    const y = ridgeY(x) + Math.abs(gauss(rand)) * spread;
    if (y > VIEW_H - 8) continue;
    dots.push({
      x,
      y,
      r: 0.6 + rand() * 1.4,
      fill: pickFill(rand),
      opacity: 0.08 + rand() * 0.48,
    });
  }

  // Crest sparkle: a finer, brighter line of dust right on the ridge.
  for (let i = 0; i < 150; i++) {
    const x = rand() * VIEW_W;
    const y = ridgeY(x) + gauss(rand) * 7;
    dots.push({
      x,
      y,
      r: 0.4 + rand() * 0.9,
      fill: rand() < 0.14 ? palette.gold : palette.silver,
      opacity: 0.2 + rand() * 0.45,
    });
  }

  // Wave flow to the right, breaking over the mountains.
  for (let i = 0; i < 230; i++) {
    const x = 640 + rand() * (VIEW_W - 640);
    const y = waveY(x) + gauss(rand) * 22;
    if (y > VIEW_H - 8 || y < 8) continue;
    dots.push({
      x,
      y,
      r: 0.5 + rand() * 1.3,
      fill: pickFill(rand),
      opacity: 0.1 + rand() * 0.45,
    });
  }

  // Sparse high drift — a few particles lifting off into the paper.
  for (let i = 0; i < 60; i++) {
    const x = rand() * VIEW_W;
    const y = 60 + rand() * 220;
    if (y > ridgeY(x) - 30) continue;
    dots.push({
      x,
      y,
      r: 0.4 + rand() * 0.8,
      fill: rand() < 0.2 ? palette.goldSoft : palette.silver,
      opacity: 0.06 + rand() * 0.24,
    });
  }

  // Fine connective strokes: the ridge contour and one gold thread on the wave.
  const ridgePts: string[] = [];
  for (let x = 0; x <= VIEW_W; x += 40) {
    ridgePts.push(`${x},${ridgeY(x).toFixed(1)}`);
  }
  const wavePts: string[] = [];
  for (let x = 640; x <= VIEW_W; x += 40) {
    wavePts.push(`${x},${waveY(x).toFixed(1)}`);
  }

  return {
    dots,
    ridgePath: `M${ridgePts.join(' L')}`,
    wavePath: `M${wavePts.join(' L')}`,
  };
}

// Default field, computed once at module scope from a fixed seed.
const DEFAULT_SEED = 20260701; // the day the direction locked
const DEFAULT_FIELD = buildField(DEFAULT_SEED);

export interface ParticulateLandscapeProps {
  className?: string;
  style?: React.CSSProperties;
  /** Optional pre-rendered PNG used under prefers-reduced-motion. */
  staticSrc?: string;
  /** Alternate deterministic seed (defaults to the locked-direction date). */
  seed?: number;
  /** Accessible label; the art is decorative by default. */
  'aria-label'?: string;
}

function LandscapeSvg({
  field,
  animated,
  className,
  style,
}: {
  field: ReturnType<typeof buildField>;
  animated: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const svgProps = {
    viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
    preserveAspectRatio: 'xMidYMax slice',
    fill: 'none',
    'aria-hidden': true,
    className,
    style: { display: 'block', width: '100%', height: '100%', ...style } as React.CSSProperties,
  };

  const content = (
    <>
      <path d={field.ridgePath} stroke={palette.silver} strokeWidth="0.8" opacity="0.35" />
      <path d={field.wavePath} stroke={palette.goldSoft} strokeWidth="0.7" opacity="0.35" />
      {field.dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x.toFixed(1)}
          cy={d.y.toFixed(1)}
          r={d.r.toFixed(2)}
          fill={d.fill}
          opacity={d.opacity.toFixed(3)}
        />
      ))}
    </>
  );

  if (!animated) return <svg {...svgProps}>{content}</svg>;

  return (
    <motion.svg
      {...svgProps}
      initial={{ opacity: motionTokens.drift.opacityMax }}
      animate={{
        opacity: [
          motionTokens.drift.opacityMax,
          motionTokens.drift.opacityMin,
          motionTokens.drift.opacityMax,
        ],
      }}
      transition={{
        duration: motionTokens.drift.durationS,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
    >
      {content}
    </motion.svg>
  );
}

export function ParticulateLandscape({
  className,
  style,
  staticSrc,
  seed,
  ...rest
}: ParticulateLandscapeProps) {
  const reduced = useReducedMotion();
  const field = React.useMemo(
    () => (seed === undefined || seed === DEFAULT_SEED ? DEFAULT_FIELD : buildField(seed)),
    [seed],
  );

  if (reduced && staticSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- decorative static fallback
      <img
        src={staticSrc}
        alt=""
        aria-hidden
        draggable={false}
        className={className}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...style }}
        {...rest}
      />
    );
  }

  return (
    <LandscapeSvg field={field} animated={!reduced} className={className} style={style} />
  );
}
