'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { AssemblPatternStudioProps } from './AssemblPatternStudioComponent';

const PatternStudio = dynamic(() => import('./AssemblPatternStudioComponent'), { ssr: false });

/** Resolve an --a-* token to a concrete colour (canvas can't read CSS vars). */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

type ColorRole = 'accent' | 'gold' | 'ink';

export interface PatternBackdropProps
  extends Omit<
    AssemblPatternStudioProps,
    'backgroundColor' | 'foregroundColor' | 'accentColor'
  > {
  /** Which --a-* token drives the marks. Default: the teal accent. */
  colorRole?: ColorRole;
  /**
   * Whether the canvas receives pointer events. Off (default) lets clicks pass
   * through to content in front — use for backgrounds. On for standalone bands.
   */
  interactive?: boolean;
  /** Opacity of the whole layer — dial down when text sits in front. */
  opacity?: number;
  className?: string;
}

const FOREGROUND: Record<ColorRole, [string, string]> = {
  accent: ['--a-accent', '#3f7373'],
  gold: ['--a-gold', '#b8964f'],
  ink: ['--a-text', '#313c42'],
};

/**
 * A Pattern Studio layer that fills its positioned parent — the reusable way to
 * drop a generator behind or between content across the site. Resolves the
 * --a-* tokens to concrete colours (so the one accent stays the single source),
 * and carries the engine's production behaviours (reduced-motion, tab-visibility,
 * lazy-mount) through the wrapper.
 */
export function PatternBackdrop({
  colorRole = 'accent',
  interactive = false,
  opacity = 1,
  className,
  mouseInteractive,
  ...studio
}: PatternBackdropProps) {
  const [colors, setColors] = useState({
    background: '#ffffff',
    foreground: FOREGROUND[colorRole][1],
    accent: '#b8964f',
  });

  useEffect(() => {
    const [fgVar, fgFallback] = FOREGROUND[colorRole];
    queueMicrotask(() => {
      setColors({
        background: token('--a-paper', '#ffffff'),
        foreground: token(fgVar, fgFallback),
        accent: token('--a-gold', '#b8964f'),
      });
    });
  }, [colorRole]);

  return (
    <div
      className={className}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      <PatternStudio
        {...studio}
        mouseInteractive={interactive && (mouseInteractive ?? true)}
        backgroundColor={colors.background}
        foregroundColor={colors.foreground}
        accentColor={colors.accent}
      />
    </div>
  );
}
