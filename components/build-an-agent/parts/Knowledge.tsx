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
 * Knowledge — a glass cylinder that reads as a tube of light. Transmission
 * and low roughness so the studio HDRI shows through it.
 */
export function Knowledge({ initialPosition = [-1.4, 0.55, 1.6], reduced = false, onMove }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.22;
    meshRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.05;
    if (onMove) onMove(drag.position);
  });

  return (
    <group position={[drag.position[0], 0, drag.position[2]]}>
      <mesh
        ref={meshRef}
        position={[0, drag.position[1], 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = drag.isDragging ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        {...drag.handlers}
      >
        <cylinderGeometry args={[0.18, 0.18, 0.72, 48, 1, false]} />
        <meshPhysicalMaterial
          color="#F5F1E8"
          metalness={0.05}
          roughness={0.06}
          transmission={0.9}
          thickness={0.5}
          ior={1.4}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.4}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.4, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.12 : 0.08} />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.connectors.label} />
    </group>
  );
}
