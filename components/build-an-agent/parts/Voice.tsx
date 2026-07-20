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
 * Voice — an upright matte-ceramic capsule that gently pulses as it "speaks".
 * Warm white ceramic distinguishes it from the chrome abilities capsule
 * (which lies horizontal); the pulse is the tell that this one talks.
 */
export function Voice({ initialPosition = [1.4, 0.55, 1.6], reduced = false, onMove }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.2;
    const pulse = 1 + Math.sin(t * 1.6) * 0.035;
    meshRef.current.scale.setScalar(pulse);
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
        <capsuleGeometry args={[0.16, 0.36, 12, 32]} />
        <meshPhysicalMaterial
          color="#F7F5F0"
          metalness={0.05}
          roughness={0.42}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
          envMapIntensity={0.8}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.42, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.12 : 0.08} />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.prompt.label} />
    </group>
  );
}
