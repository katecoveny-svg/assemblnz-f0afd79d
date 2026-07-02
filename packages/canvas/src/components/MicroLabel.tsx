'use client';

import * as React from 'react';
import { palette, typography } from '../tokens';

/**
 * <MicroLabel /> — the ONLY uppercase text on-brand: micro labels tracked
 * 0.16em (see "ADAPTIVE. CONNECTED. PURPOSE-BUILT." in the locked canon).
 */
export interface MicroLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  as?: 'span' | 'p' | 'h2' | 'h3' | 'div';
}

export function MicroLabel({ children, as = 'span', style, ...rest }: MicroLabelProps) {
  const Tag = as;
  return (
    <Tag
      {...rest}
      style={{
        fontFamily: typography.micro.fontFamily,
        fontSize: typography.micro.fontSize,
        letterSpacing: typography.micro.letterSpacing,
        textTransform: 'uppercase',
        color: palette.bodyGrey,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
