'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';
import { useDrag3D } from '../hooks/useDrag3D';
import { PartLabel } from './PartLabel';

interface Props {
  initialPosition?: [number, number, number];
  reduced?: boolean;
  onMove?: (position: [number, number, number]) => void;
}

/**
 * Memory — a hexagonal crystal cluster. Softly refractive so it reads
 * as glass, not chrome, and gently rotates on its own.
 */
export function Memory({ initialPosition = [-2.4, 0.55, -0.4], reduced = false, onMove }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.18;
    meshRef.current.rotation.z = Math.sin(t * 0.35) * 0.06;
    if (onMove) onMove(drag.position);
  });

  return (
    <group position={[drag.position[0], 0, drag.position[2]]}>
      <mesh
        ref={meshRef}
        position={[0, drag.position[1], 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = drag.isDragging ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        {...drag.handlers}
      >
        <icosahedronGeometry args={[0.36, 0]} />
        <meshPhysicalMaterial
          color="#EAE7DD"
          metalness={0.15}
          roughness={0.12}
          transmission={0.55}
          thickness={0.6}
          ior={1.45}
          clearcoat={0.85}
          clearcoatRoughness={0.15}
          envMapIntensity={1.15}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.12 : 0.08} />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.memory.label} />
    </group>
  );
}
