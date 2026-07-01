'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import type { Hero3DSceneId } from '@/lib/brand/brand-config';
import { HappyTailsHero } from '@/components/ops/hero3d/HappyTailsHero';
import { AirNZHero } from '@/components/ops/hero3d/AirNZHero';
import { EverydayRewardsHero } from '@/components/ops/hero3d/EverydayRewardsHero';
import { AucklandZooHero } from '@/components/ops/hero3d/AucklandZooHero';
import { AironautHero } from '@/components/ops/hero3d/AironautHero';
import { LulaInnHero } from '@/components/ops/hero3d/LulaInnHero';

function Scene({ hero }: { hero: Hero3DSceneId }) {
  switch (hero) {
    case 'happy-tails':
      return <HappyTailsHero />;
    case 'air-nz':
      return <AirNZHero />;
    case 'everyday-rewards':
      return <EverydayRewardsHero />;
    case 'auckland-zoo':
      return <AucklandZooHero />;
    case 'aironaut':
      return <AironautHero />;
    case 'lula-inn':
      return <LulaInnHero />;
  }
}

/**
 * Internal — only imported dynamically by `<Brand3DHero>` to keep three.js
 * out of the initial page bundle. Frameloop is `demand`-style capped by
 * limiting dpr to ~1.5 (implicit 30fps target for the ops hero budget).
 */
export function Brand3DCanvas({ hero }: { hero: Hero3DSceneId }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 3.2], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Scene hero={hero} />
      {/* Environment streams an HDR from a remote CDN. Isolate its suspense
          so a slow or blocked download can never blank the whole scene —
          the heroes light acceptably from their own lights while it loads. */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
