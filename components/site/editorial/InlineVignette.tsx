'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import type { Mesh } from 'three';
import { CONCEPT_VIGNETTES } from '@/lib/copy/editorial-home';

type VignetteId = keyof typeof CONCEPT_VIGNETTES;

/**
 * The 3D form inside a single inline vignette. Kept minimal: one primitive
 * per concept, a slow constant rotation, an apartment-preset environment
 * for the chrome/glass reflections. Runs at pixel-density-capped DPR so 3
 * of these embedded inside the hero H1 stay cheap.
 */
function VignetteObject({ id }: { id: VignetteId }) {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.6;
    ref.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.15;
  });
  const shape = CONCEPT_VIGNETTES[id].shape;

  if (shape === 'sphere') {
    return (
      <mesh ref={ref}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshPhysicalMaterial
          color="#f2f2f2"
          metalness={1}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
    );
  }

  if (shape === 'block') {
    return (
      <mesh ref={ref}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshPhysicalMaterial
          color="#ffd28a"
          transmission={1}
          thickness={0.6}
          roughness={0.06}
          ior={1.42}
          attenuationColor="#ff9a63"
          attenuationDistance={1.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    );
  }

  // torus — Air NZ, iridescent chrome
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.7, 0.28, 48, 128]} />
      <meshPhysicalMaterial
        color="#e8e6e2"
        metalness={1}
        roughness={0.12}
        iridescence={1}
        iridescenceIOR={1.6}
        iridescenceThicknessRange={[100, 800]}
      />
    </mesh>
  );
}

/**
 * A tiny inline 3D card slotted between words in the hero H1 — a live,
 * rotating physical object (chrome sphere / glass block / iridescent koru)
 * sized to sit on the type baseline. Replaces the flat coloured chip
 * approach; makes the "make AI visible" claim by literally showing 3D
 * objects made of light inside the sentence.
 *
 * Wrapped in a link out to the concept-studio microsite — click the object,
 * open the demo.
 */
export function InlineVignette({ id }: { id: VignetteId }) {
  const vig = CONCEPT_VIGNETTES[id];
  return (
    <a
      href={vig.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Concept demo — ${vig.label}`}
      className="relative mx-[0.06em] inline-block h-[0.9em] w-[0.9em] translate-y-[0.08em] rounded-full align-baseline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1918] focus-visible:ring-offset-2"
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
    </a>
  );
}
