'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import type { Mesh } from 'three';

/**
 * Softbody-ish volumetric DO blob — rose/plum only (Spatial C).
 * Distorts and breathes; no purple grape glow.
 */
function BlobMesh() {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(
    () => ({
      color: '#916A70',
      emissive: '#240B21',
      emissiveIntensity: 0.35,
      roughness: 0.28,
      metalness: 0.12,
      distort: 0.42,
      speed: 2.1,
    }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;
    mesh.current.rotation.y = t * 0.28;
    mesh.current.rotation.x = Math.sin(t * 0.35) * 0.18;
    const s = 1 + Math.sin(t * 1.4) * 0.045;
    mesh.current.scale.setScalar(s);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 24]} />
      <MeshDistortMaterial
        color={material.color}
        emissive={material.emissive}
        emissiveIntensity={material.emissiveIntensity}
        roughness={material.roughness}
        metalness={material.metalness}
        distort={material.distort}
        speed={material.speed}
      />
    </mesh>
  );
}

export function DoLivingBlobScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.15} color="#F5F1F2" />
      <pointLight position={[-2, -1, 2]} intensity={0.85} color="#D6A5BD" />
      <BlobMesh />
    </Canvas>
  );
}
