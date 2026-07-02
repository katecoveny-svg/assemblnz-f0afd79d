'use client';

import * as React from 'react';
import { palette, typography } from '../tokens';
import { MicroLabel } from './MicroLabel';

/**
 * <KpiTrio /> — the bottom-of-dashboard row of three small KPI stats
 * (marketplace pulse / network activity / curated for you in the locked
 * reference). Values in Cormorant, labels as tracked micro-labels.
 *
 * Only ever pass REAL numbers — the locked canon forbids invented metrics.
 */
export interface KpiStat {
  /** Micro-label, e.g. "active agents". */
  label: string;
  /** The stat itself, e.g. 12 or "99.8%". */
  value: React.ReactNode;
  /** Small supporting line, e.g. "vs last 30 days". */
  hint?: React.ReactNode;
}

export interface KpiTrioProps {
  stats: [KpiStat, KpiStat, KpiStat];
  className?: string;
  style?: React.CSSProperties;
}

export function KpiTrio({ stats, className, style }: KpiTrioProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 16,
        width: '100%',
        ...style,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '18px 20px',
            borderRadius: 14,
            border: `1px solid ${palette.hairline}`,
            background: '#FFFFFF',
            color: palette.ink,
          }}
        >
          <MicroLabel>{s.label}</MicroLabel>
          <span
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: typography.display.fontWeight,
              fontSize: 32,
              lineHeight: 1.05,
              letterSpacing: typography.display.letterSpacing,
            }}
          >
            {s.value}
          </span>
          {s.hint ? (
            <span
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: 12,
                color: palette.bodyGrey,
                textTransform: 'lowercase',
              }}
            >
              {s.hint}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
