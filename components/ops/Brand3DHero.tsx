'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { StaticFallback } from '@/components/ops/hero3d/StaticFallback';

/**
 * Brand3DHero — lazily loads @react-three/fiber and the appropriate scene.
 * Server-side rendering is disabled (WebGL needs a real DOM). If the user
 * prefers reduced motion, we skip the 3D layer entirely and show a static SVG.
 */
const R3FCanvas = dynamic(() => import('./Brand3DCanvas').then((m) => m.Brand3DCanvas), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[240px] w-full animate-pulse rounded-2xl bg-[color:var(--brand-surface)]/60" />
  ),
});

export function Brand3DHero({ config }: { config: BrandConfig }) {
  const reduce = useReducedMotion();
  if (reduce) return <StaticFallback config={config} />;
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl" data-brand-hero={config.hero3D}>
      <R3FCanvas hero={config.hero3D} />
    </div>
  );
}
