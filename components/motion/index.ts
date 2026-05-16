'use client';

import { useReducedMotion } from 'framer-motion';

export const CANON_EASE = [0.16, 1, 0.3, 1] as const;

export const CANON_TRANSITION = {
  duration: 0.48,
  ease: CANON_EASE,
};

export const REVEAL_INITIAL = {
  opacity: 0.6,
  y: 12,
};

export const REVEAL_ANIMATE = {
  opacity: 1,
  y: 0,
};

export const hoverLift = {
  y: -4,
  scale: 1.01,
};

export const wordRevealContainer = {
  visible: {
    transition: {
      staggerChildren: 0.035,
    },
  },
};

export const wordRevealItem = {
  hidden: {
    opacity: 0.6,
    y: '0.35em',
  },
  visible: {
    opacity: 1,
    y: '0em',
    transition: CANON_TRANSITION,
  },
};

export function useCanonMotion() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    transition: prefersReducedMotion ? { duration: 0 } : CANON_TRANSITION,
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : REVEAL_INITIAL,
    animate: REVEAL_ANIMATE,
  };
}
