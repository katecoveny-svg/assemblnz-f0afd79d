'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type HTMLMotionProps,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Motion budget: at most 2 concurrent animations per widget, hero targets 30 fps.
 * All primitives respect prefers-reduced-motion — when reduced motion is on,
 * they skip transitions and render the final state immediately.
 */

type FadeInProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  durationMs?: number;
};

export function FadeIn({
  children,
  delay = 0,
  durationMs = 260,
  ...rest
}: FadeInProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <motion.div {...rest}>{children}</motion.div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: durationMs / 1000, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type SlideUpProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
  distance?: number;
  durationMs?: number;
};

export function SlideUp({
  children,
  delay = 0,
  distance = 8,
  durationMs = 320,
  ...rest
}: SlideUpProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <motion.div {...rest}>{children}</motion.div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: durationMs / 1000, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type HoverLiftProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  lift?: number;
};

export function HoverLift({ children, lift = 2, ...rest }: HoverLiftProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <motion.div {...rest}>{children}</motion.div>;
  }
  return (
    <motion.div
      whileHover={{ y: -lift }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type TickerNumberProps = {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
};

/**
 * Softly animates a number from its previous value to the new value using a
 * spring on a motion value. Respects reduced motion by snapping to the value.
 */
export function TickerNumber({
  value,
  decimals = 0,
  durationMs = 600,
  className,
  prefix = '',
  suffix = '',
}: TickerNumberProps) {
  const reduce = useReducedMotion();
  const prevRef = useRef<number>(value);
  const mv = useMotionValue<number>(value);
  const spring = useSpring(mv, {
    stiffness: 120,
    damping: 22,
    duration: durationMs,
  });
  const formatted = useTransform(spring, (v) => {
    const num = Number.isFinite(v) ? v : value;
    return `${prefix}${num.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    // `set` moves the source value; the spring rides that. For reduced motion,
    // we also snap the spring by re-setting to the same value on next tick.
    mv.set(value);
    if (reduce) {
      spring.set(value);
    }
    prevRef.current = value;
  }, [value, mv, spring, reduce]);

  return <motion.span className={className}>{formatted}</motion.span>;
}

type TickerTextProps = {
  /** The rotating strings, cycled in order. */
  labels: readonly string[];
  /** Milliseconds between swaps. Default 4000. */
  intervalMs?: number;
  /** Fade duration in ms. Default 400. */
  durationMs?: number;
  className?: string;
};

/**
 * Fades through a list of short strings — e.g. Aironaut's service-line labels
 * ticking over on the hero. Respects reduced motion by freezing on the first
 * label. Uses `AnimatePresence` so each label crossfades cleanly. Keep the list
 * short (2–6 items) and each string short — this is decoration, not content.
 */
export function TickerText({
  labels,
  intervalMs = 4000,
  durationMs = 400,
  className,
}: TickerTextProps) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || labels.length <= 1) return;
    const id = window.setInterval(() => {
      setI((prev) => (prev + 1) % labels.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [labels.length, intervalMs, reduce]);

  const current = labels[i] ?? '';

  if (reduce) {
    return <span className={className}>{labels[0] ?? ''}</span>;
  }

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
