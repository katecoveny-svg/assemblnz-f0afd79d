'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance to travel upward (px). Default: 30 */
  distance?: number;
}

/**
 * Scroll-triggered fade-up.
 * Per Interactive Web Canon §8.3: 400ms, 30px, easeOutExpo.
 * Respects prefers-reduced-motion.
 */
export function FadeUp({ children, className, delay = 0, distance = 30 }: FadeUpProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
