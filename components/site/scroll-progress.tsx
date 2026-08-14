'use client';

import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { isCreativeStudio } from '@/components/site/site-header';

/**
 * Thin scroll-progress bar pinned to the top of the page.
 * Pairs with the sticky SiteHeader to give "you're somewhere mid-page" feedback.
 */
export function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // the "/" coming-soon splash carries no chrome at all
  if (pathname === '/' || isCreativeStudio(pathname)) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-[color:var(--assembl-pounamu)]"
      style={{ scaleX }}
    />
  );
}
