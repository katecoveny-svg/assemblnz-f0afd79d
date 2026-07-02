'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTokens, palette, typography } from '../tokens';
import { MicroLabel } from './MicroLabel';

/**
 * <BundleCard /> — the floating bundle card from the locked marketplace
 * reference: radial dot-cluster ornament, lowercase Cormorant title, quiet
 * body copy, levitate on hover (2–4px translate-y, 400ms ease).
 * prefers-reduced-motion → no levitation.
 */

// Radial matariki dot-cluster ornament — deterministic trig, aligned with
// the pilot-chrome MatarikiCluster (PR #644) so the mark reads the same
// everywhere.
const ORNAMENT_DOTS: Array<{ x: number; y: number; r: number }> = (() => {
  const dots = [{ x: 14, y: 14, r: 1.6 }];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 + 0.4;
    dots.push({ x: 14 + 5.5 * Math.cos(a), y: 14 + 5.5 * Math.sin(a), r: 1.1 });
  }
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10;
    dots.push({ x: 14 + 10.5 * Math.cos(a), y: 14 + 10.5 * Math.sin(a), r: 0.8 });
  }
  return dots;
})();

function ClusterOrnament({ gold = false, size = 28 }: { gold?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      {ORNAMENT_DOTS.map((d, i) => (
        <circle
          key={i}
          cx={d.x.toFixed(2)}
          cy={d.y.toFixed(2)}
          r={d.r}
          fill={gold ? palette.goldSoft : palette.silverDeep}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

export interface BundleCardProps {
  /** Bundle name — rendered lowercase in Cormorant. */
  title: string;
  /** One-line capability description (lowercase, warm grey). */
  description?: string;
  /** Small tag chips, e.g. ['risk', 'compliance']. */
  tags?: string[];
  /** Footer text, e.g. an agent count. Only pass REAL numbers. */
  meta?: React.ReactNode;
  /** Gold ornament instead of silver. */
  gold?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function BundleCard({
  title,
  description,
  tags,
  meta,
  gold = false,
  onClick,
  className,
  style,
  children,
}: BundleCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      className={className}
      initial="rest"
      whileHover={reduced ? undefined : 'hover'}
      variants={{
        rest: { y: 0, boxShadow: '0 8px 28px rgba(26, 25, 24, 0.05)' },
        hover: {
          y: motionTokens.levitate.translateYPx,
          boxShadow: '0 14px 36px rgba(26, 25, 24, 0.08)',
          transition: {
            duration: motionTokens.levitate.durationMs / 1000,
            ease: 'easeOut',
          },
        },
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        maxWidth: 300,
        padding: '22px 24px',
        borderRadius: 16,
        border: `1px solid ${palette.hairline}`,
        background: '#FFFFFF',
        color: palette.ink,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ClusterOrnament gold={gold} />
        <h3
          style={{
            fontFamily: typography.display.fontFamily,
            fontWeight: typography.display.fontWeight,
            fontSize: 24,
            letterSpacing: typography.display.letterSpacing,
            textTransform: 'lowercase',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h3>
      </div>
      {description ? (
        <p
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: 13.5,
            lineHeight: typography.body.lineHeight,
            color: palette.bodyGrey,
            margin: 0,
            textTransform: 'lowercase',
          }}
        >
          {description}
        </p>
      ) : null}
      {tags && tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: 11,
                lineHeight: 1,
                padding: '5px 9px',
                borderRadius: 999,
                background: palette.paperDeep,
                border: `1px solid ${palette.hairline}`,
                color: palette.bodyGrey,
                textTransform: 'lowercase',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {children}
      {meta ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 2,
          }}
        >
          <MicroLabel>{meta}</MicroLabel>
          <span aria-hidden style={{ color: palette.canary, fontSize: 14, lineHeight: 1 }}>
            •
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}
