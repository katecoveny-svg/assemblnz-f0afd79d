'use client';

import { useEffect, useRef, useState } from 'react';
import { AssemblPatternStudio } from './AssemblPatternStudio';

type Mode = 'halftone' | 'dither' | 'ascii' | 'particles' | 'particleText' | 'vortex';
type Effect = 'wave' | 'pulse' | 'ripple' | 'spiral' | 'noise' | 'off';
type DotShape = 'circle' | 'square' | 'diamond' | 'triangle';
type ParticleShape = 'circle' | 'square' | 'diamond' | 'spark';

export interface AssemblPatternStudioProps {
  mode?: Mode;

  // halftone / dither / ascii
  density?: number;
  size?: number;
  intensity?: number;
  dotShape?: DotShape;
  animationEffect?: Effect;
  morphing?: boolean;

  // particles / particleText
  count?: number;
  particleShape?: ParticleShape;
  connectLines?: boolean;
  connectDistance?: number;
  mouseMode?: 'repel' | 'attract' | 'connect';
  gravity?: number;
  glow?: boolean;
  turbulence?: number;
  words?: string[];
  holdSeconds?: number;

  // shared
  speed?: number;
  mouseInteractive?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accentColor?: string;
  isAnimated?: boolean;

  // production behaviour — see HANDOFF.md "Performance & accessibility contract"
  /** Honour prefers-reduced-motion by forcing a static frame. Default true. */
  respectReducedMotion?: boolean;
  /** Pause the loop while the tab isn't visible. Default true. */
  pauseWhenHidden?: boolean;
  /** Don't construct the engine until it scrolls near the viewport. Default true. */
  lazyMount?: boolean;
}

/**
 * React wrapper for the Pattern Studio engine (Kate's handoff contract).
 * Owns the three production behaviours — reduced-motion, tab-visibility and
 * lazy-mount — so a caller can't forget them. Colour defaults are assembl's
 * canon values (Ming teal + gold on pearl); the orange from the studio demo
 * is intentionally not a default here — one restrained accent.
 */
function AssemblPatternStudioComponent({
  mode = 'halftone',
  density = 35,
  size = 35,
  intensity = 65,
  dotShape = 'circle',
  animationEffect = 'wave',
  morphing = false,
  count = 150,
  particleShape = 'circle',
  connectLines = true,
  connectDistance = 120,
  mouseMode = 'repel',
  gravity = 0,
  glow = true,
  turbulence = 30,
  words = ['assembl'],
  holdSeconds = 2.2,
  speed = 1.2,
  mouseInteractive = true,
  backgroundColor = '#ffffff',
  foregroundColor = '#3f7373',
  accentColor = '#b8964f',
  isAnimated = true,
  respectReducedMotion = true,
  pauseWhenHidden = true,
  lazyMount = true,
}: AssemblPatternStudioProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const studioRef = useRef<AssemblPatternStudio | null>(null);
  const [shouldMount, setShouldMount] = useState(!lazyMount);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const effectiveAnimated =
    isAnimated &&
    !(respectReducedMotion && reducedMotion) &&
    !(pauseWhenHidden && !tabVisible);
  const wordsKey = words.join(' ');

  const settings = {
    mode,
    density,
    size,
    intensity,
    dotShape,
    animationEffect,
    morphing,
    count,
    particleShape,
    connectLines,
    connectDistance,
    mouseMode,
    gravity,
    glow,
    turbulence,
    words,
    holdSeconds,
    speed,
    mouseInteractive,
    backgroundColor,
    foregroundColor,
    accentColor,
    isAnimated: effectiveAnimated,
  };

  useEffect(() => {
    if (!respectReducedMotion) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    queueMicrotask(() => setReducedMotion(mq.matches));
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [respectReducedMotion]);

  useEffect(() => {
    if (!pauseWhenHidden) return undefined;
    const handler = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [pauseWhenHidden]);

  useEffect(() => {
    if (!lazyMount || shouldMount || !wrapperRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [lazyMount, shouldMount]);

  useEffect(() => {
    if (!shouldMount || !canvasRef.current) return undefined;
    const canvasId = `pattern-studio-${Math.random().toString(36).slice(2, 11)}`;
    canvasRef.current.id = canvasId;
    studioRef.current = new AssemblPatternStudio(canvasId, settings);
    return () => {
      studioRef.current?.destroy();
      studioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldMount]);

  useEffect(() => {
    studioRef.current?.updateSettings(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    density,
    size,
    intensity,
    dotShape,
    animationEffect,
    morphing,
    count,
    particleShape,
    connectLines,
    connectDistance,
    mouseMode,
    gravity,
    glow,
    turbulence,
    wordsKey,
    holdSeconds,
    speed,
    mouseInteractive,
    backgroundColor,
    foregroundColor,
    accentColor,
    effectiveAnimated,
  ]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', background: backgroundColor }}>
      {shouldMount ? (
        <canvas ref={canvasRef} aria-hidden style={{ width: '100%', height: '100%', display: 'block' }} />
      ) : null}
    </div>
  );
}

export default AssemblPatternStudioComponent;
