'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
// drei's top-level index only re-exports Html at the type level. Use the
// core subpath so the Vercel typecheck can find Environment.
import { Environment } from '@react-three/drei/core/Environment';
import type { Mesh } from 'three';
import { AGENT_PARTS, type PartId } from '@/lib/copy/editorial-home';
import { PartMesh } from './PartMesh';

/**
 * The 3D form inside a single inline vignette — one of the six agent parts,
 * slowly rotating, lit by an apartment-preset environment so the chrome and
 * obsidian read. DPR is capped so several of these embedded in the poster
 * stay cheap.
 */
function VignetteObject({ id }: { id: PartId }) {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.6;
    ref.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.15;
  });
  return <PartMesh id={id} meshRef={ref} scale={0.9} />;
}

/**
 * A tiny inline 3D object slotted between words in the poster — a live,
 * rotating agent part (Intelligence knot, Memory cubes, Voice sphere…) sized
 * to sit on the type baseline. The designbyshiv "photo between words" trick,
 * but the objects are the product's own parts: the "make AI visible" claim
 * answered by literally showing the parts inside the sentence.
 */
export function InlineVignette({ id }: { id: PartId }) {
  const part = AGENT_PARTS[id];
  return (
    <span
      aria-label={`${part.label} — a part of an assembl agent`}
      role="img"
      className="relative mx-[0.06em] inline-block h-[0.92em] w-[0.92em] translate-y-[0.08em] align-baseline"
      style={{ verticalAlign: 'baseline' }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 2.6], fov: 40 }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 2]} intensity={1.4} />
        <Suspense fallback={null}>
          <VignetteObject id={id} />
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </span>
  );
}
