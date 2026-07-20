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
 * Memory — stacked glass cubes (canon: stacked cubes = memory). Two clear
 * volumes, the upper slightly rotated, gently breathing above the base.
 */
export function Memory({ initialPosition = [-2.4, 0.55, -0.4], reduced = false, onMove }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = t * 0.14;
    if (topRef.current) topRef.current.position.y = 0.46 + Math.sin(t * 0.7) * 0.03;
    if (onMove) onMove(drag.position);
  });

  return (
    <group position={[drag.position[0], 0, drag.position[2]]}>
      <group
        ref={groupRef}
        position={[0, drag.position[1] - 0.2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = drag.isDragging ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        {...drag.handlers}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.44, 0.44, 0.44]} />
          <meshPhysicalMaterial
            color="#F2F2EE"
            metalness={0.05}
            roughness={0.08}
            transmission={0.75}
            thickness={0.5}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh ref={topRef} position={[0, 0.46, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <meshPhysicalMaterial
            color="#F2F2EE"
            metalness={0.05}
            roughness={0.08}
            transmission={0.75}
            thickness={0.4}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={1.2}
          />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.48, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.12 : 0.08} />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.memory.label} />
    </group>
  );
}
