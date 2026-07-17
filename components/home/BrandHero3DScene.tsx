'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei/core/Environment';
import { Float } from '@react-three/drei/core/Float';
import { MeshDistortMaterial } from '@react-three/drei/core/MeshDistortMaterial';
import type { Mesh } from 'three';

/**
 * The playground's live 3D layer — a calm liquid-glass form in the visitor's
 * brand colour. Motion assembles (slow drift, no pops), matching the canon.
 * Kept deliberately light: one distorted sphere, one ring, soft studio light.
 */
function BrandForm({ accent }: { accent: string }) {
  const ring = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.12;
  });
  return (
    <>
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
        <mesh>
          <sphereGeometry args={[1.15, 64, 64]} />
          <MeshDistortMaterial
            color={accent}
            roughness={0.18}
            metalness={0.1}
            distort={0.32}
            speed={1.4}
          />
        </mesh>
      </Float>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.9, 0.015, 16, 128]} />
        <meshStandardMaterial color="#b8964f" roughness={0.35} metalness={0.6} />
      </mesh>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <Environment preset="studio" />
    </>
  );
}

export default function BrandHero3DScene({ accent }: { accent: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <BrandForm accent={accent} />
    </Canvas>
  );
}
