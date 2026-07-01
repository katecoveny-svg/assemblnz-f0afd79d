'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type HTMLMotionProps,
} from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

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
