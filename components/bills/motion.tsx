'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useMotionValue, animate } from 'framer-motion';

const fmt = (v: number, decimals: number) =>
  v.toLocaleString('en-NZ', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Animated count-up. Fires on MOUNT (not gated on an intersection observer) so
 * the number never sticks at 0 if the observer is slow — the initial rendered
 * text is already the final value, then it animates up from 0 once hydrated.
 */
export function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.3,
  className,
  style,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const mv = useMotionValue(0);
  // SSR / pre-hydration shows the real number, so it's never blank or $0.
  const [txt, setTxt] = useState(() => fmt(to, decimals));

  useEffect(() => {
    const controls = animate(mv, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setTxt(fmt(v, decimals)),
    });
    return () => controls.stop();
  }, [to, duration, decimals, mv]);

  return (
    <span className={className} style={style}>
      {prefix}
      {txt}
      {suffix}
    </span>
  );
}

/**
 * Fade + rise reveal — PURE CSS (no framer/JS). The entrance is a CSS keyframe
 * (`.bills-rise`, defined in the layout), so content can never be left blank by
 * a hydration hiccup — the repo has been bitten by framer whileInView blanking
 * before. Reduced-motion disables it. `y` kept for API compat (unused).
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <div className={`bills-rise ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
