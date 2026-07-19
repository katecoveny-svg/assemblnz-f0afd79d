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
 * Voice — a torus-knot "petal" form that gently pulses. Warm champagne
 * with high iridescence so it feels alive when spoken to.
 */
export function Voice({ initialPosition = [1.4, 0.55, 1.6], reduced = false, onMove }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.28;
    const pulse = 1 + Math.sin(t * 1.4) * 0.03;
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
        <torusKnotGeometry args={[0.24, 0.08, 128, 24, 2, 3]} />
        <meshPhysicalMaterial
          color="#EBD9B8"
          metalness={0.55}
          roughness={0.15}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          iridescence={0.7}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[200, 720]}
          envMapIntensity={1.2}
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
