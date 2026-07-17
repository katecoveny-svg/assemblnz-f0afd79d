'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { setVisualForm } from '@/lib/motion/visual-state';

const MotionCanvas = dynamic(
  () => import('@/components/motion/MotionCanvas').then((m) => ({ default: m.MotionCanvas })),
  { ssr: false },
);

/**
 * The Living Interface sculpture as the /genome hero backdrop — the kōtuku
 * particle field settling into its genome-network formation (Kate's call
 * 2026-07-18: the wordmark particles stay on the homepage; the sculpture
 * lives here). Purely decorative: the hero's own headings carry the
 * meaning, and the canvas fills the section's reserved box, so mounting
 * never shifts layout.
 */
export function GenomeMotionBackdrop() {
  useEffect(() => {
    setVisualForm('network');
  }, []);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0 }}>
      <MotionCanvas />
    </div>
  );
}
