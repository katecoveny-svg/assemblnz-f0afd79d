'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Immersive plum field — soft particle drift on deep plum `#240B21`.
 * Abstract assembly language only: no robots, orbs-as-brains, or glow clichés.
 * Decorative; aria-hidden at the canvas wrapper.
 */

const COUNT = 420;
const PLUM = new THREE.Color('#240B21');
const ROSE = new THREE.Color('#916A70');
const CHALK = new THREE.Color('#F5F1F2');

function FieldParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, seeds, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT * 4);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      // Soft volumetric cloud, denser mid-field
      const r = 4.2 + Math.random() * 7.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = (Math.random() - 0.5) * 5.2;
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.55;

      seeds[i4] = Math.random() * Math.PI * 2;
      seeds[i4 + 1] = 0.15 + Math.random() * 0.35;
      seeds[i4 + 2] = 0.02 + Math.random() * 0.06;
      seeds[i4 + 3] = Math.random();

      const c = seeds[i4 + 3] > 0.82 ? CHALK : ROSE;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return { positions, seeds, colors };
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion || !pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const phase = seeds[i4];
      const speed = seeds[i4 + 1];
      const amp = seeds[i4 + 2];
      arr[i3 + 1] += Math.sin(t * speed + phase) * amp * 0.016;
      arr[i3] += Math.cos(t * speed * 0.7 + phase) * amp * 0.01;
    }
    pos.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.018;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.72}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

function SoftPlanes({ reducedMotion }: { reducedMotion: boolean }) {
  const g1 = useRef<THREE.Mesh>(null);
  const g2 = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (g1.current) {
      g1.current.rotation.z = t * 0.04;
      g1.current.position.y = Math.sin(t * 0.2) * 0.15;
    }
    if (g2.current) {
      g2.current.rotation.z = -t * 0.03;
      g2.current.position.y = Math.cos(t * 0.18) * 0.12;
    }
  });
  return (
    <>
      <mesh ref={g1} position={[-2.2, 0.4, -3]} rotation={[0.4, 0.2, 0.1]}>
        <planeGeometry args={[5.5, 3.2]} />
        <meshBasicMaterial color="#654A4E" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={g2} position={[2.8, -0.6, -4]} rotation={[-0.3, -0.4, 0.2]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial color="#916A70" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

export function PlumFieldCanvas({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.2], fov: 42, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={[PLUM.getStyle()]} />
      <SoftPlanes reducedMotion={reducedMotion} />
      <FieldParticles reducedMotion={reducedMotion} />
    </Canvas>
  );
}
