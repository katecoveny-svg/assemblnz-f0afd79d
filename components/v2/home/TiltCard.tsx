'use client';

import { useRef, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

/**
 * A gentle 3D tilt-on-hover card: the surface leans toward the pointer
 * (max ~5°) and a soft champagne sheen follows the cursor. Springs settle it
 * back on leave. Disabled under reduced-motion and on touch pointers —
 * the card is then a plain block, still fully clickable and focusable.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 210, damping: 20, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 210, damping: 20, mass: 0.6 });

  const sheen = useMotionTemplate`radial-gradient(340px circle at ${gx}% ${gy}%, rgba(217, 184, 122, 0.14), transparent 65%)`;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 9);
    rx.set((0.5 - py) * 7);
    gx.set(px * 100);
    gy.set(py * 100);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      initial="rest"
      whileHover="hover"
      variants={{
        rest: { y: 0 },
        hover: { y: -4, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
        height: '100%',
        position: 'relative',
      }}
    >
      {children}
      <motion.div
        aria-hidden
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 1, transition: { duration: 0.35 } },
        }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 18,
          background: sheen,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
