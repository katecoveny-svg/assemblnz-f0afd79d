'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

/**
 * Softbody-ish volumetric DO blob — rose/plum only (Spatial C).
 * Distorts via scale breathing + rotation; no purple grape glow.
 * Uses standard mesh materials (drei MeshDistortMaterial types are flaky in this toolchain).
 */
function BlobMesh() {
  const mesh = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.28;
      mesh.current.rotation.x = Math.sin(t * 0.35) * 0.18;
      const s = 1 + Math.sin(t * 1.4) * 0.045;
      mesh.current.scale.setScalar(s);
    }
    if (inner.current) {
      inner.current.rotation.z = -t * 0.22;
      const s = 0.72 + Math.sin(t * 1.9) * 0.03;
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#916A70"
          emissive="#240B21"
          emissiveIntensity={0.35}
          roughness={0.28}
          metalness={0.12}
          flatShading
        />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshStandardMaterial
          color="#D6A5BD"
          emissive="#654A4E"
          emissiveIntensity={0.22}
          roughness={0.4}
          metalness={0.08}
          transparent
          opacity={0.55}
          flatShading
        />
      </mesh>
    </group>
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
