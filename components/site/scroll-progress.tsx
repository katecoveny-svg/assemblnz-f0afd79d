'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin scroll-progress bar pinned to the top of the page.
 * Pairs with the sticky SiteHeader to give "you're somewhere mid-page" feedback.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-[color:var(--assembl-pounamu)]"
      style={{ scaleX }}
    />
  );
}
