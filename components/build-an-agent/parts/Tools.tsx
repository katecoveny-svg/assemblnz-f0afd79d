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
 * Tools — a warm-toned cube "tool chest". Matte with a hint of clearcoat
 * so it reads as an object with weight, not glass.
 */
export function Tools({ initialPosition = [2.4, 0.5, -0.4], reduced = false, onMove }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.5);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.14;
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
        <boxGeometry args={[0.58, 0.58, 0.58]} />
        <meshPhysicalMaterial
          color="#BFA37A"
          metalness={0.35}
          roughness={0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          envMapIntensity={0.9}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.12 : 0.08} />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.tools.label} />
    </group>
  );
}
