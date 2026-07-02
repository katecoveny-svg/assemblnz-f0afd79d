'use client';

import * as React from 'react';
import { palette, typography } from '../tokens';
import { MicroLabel } from './MicroLabel';

/**
 * <RightRail /> — the context rail from the locked dashboard reference:
 * bundle detail / collection member agents live here. A quiet paper panel
 * with a micro-label eyebrow, a lowercase Cormorant title, and a slot for
 * whatever the surface needs (agent rows, detail copy, actions).
 */
export interface RightRailProps {
  /** Micro-label eyebrow, e.g. "collection". */
  eyebrow?: string;
  /** Rail title — rendered lowercase in Cormorant. */
  title?: string;
  /** Small line under the title (e.g. "compliance & risk"). */
  subtitle?: React.ReactNode;
  /** Footer slot (e.g. a "view collection" link). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function RightRail({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
  className,
  style,
}: RightRailProps) {
  return (
    <aside
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: '100%',
        maxWidth: 320,
        padding: '24px 22px',
        borderRadius: 16,
        border: `1px solid ${palette.hairline}`,
        background: palette.paper,
        color: palette.ink,
        ...style,
      }}
    >
      {eyebrow ? <MicroLabel>{eyebrow}</MicroLabel> : null}
      {title ? (
        <h2
          style={{
            fontFamily: typography.display.fontFamily,
            fontWeight: typography.display.fontWeight,
            fontSize: 30,
            letterSpacing: typography.display.letterSpacing,
            textTransform: 'lowercase',
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <div
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: 13,
            color: palette.bodyGrey,
            textTransform: 'lowercase',
          }}
        >
          {subtitle}
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
      {footer ? (
        <div
          style={{
            marginTop: 4,
            paddingTop: 14,
            borderTop: `1px solid ${palette.hairline}`,
            fontFamily: typography.body.fontFamily,
            fontSize: 13,
            color: palette.bodyGrey,
          }}
        >
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
