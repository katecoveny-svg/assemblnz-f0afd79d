'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { CANON_TRANSITION, REVEAL_ANIMATE, REVEAL_INITIAL } from '@/components/motion';

/**
 * Wrap a section with a scroll-triggered fade-up reveal.
 * Stagger child reveals by passing different `delay` values.
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
} as const;

export function SectionReveal({
  children,
  delay = 0,
  className,
  as = 'div',
  id,
  once = true,
  margin = '-80px',
  y = 12,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof MOTION_TAGS;
  id?: string;
  once?: boolean;
  margin?: string;
  y?: number;
}) {
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      id={id}
      className={className}
      initial={{ ...REVEAL_INITIAL, y }}
      whileInView={REVEAL_ANIMATE}
      viewport={{ once, margin }}
      transition={{ ...CANON_TRANSITION, delay }}
    >
      {children}
    </MotionTag>
  );
}
