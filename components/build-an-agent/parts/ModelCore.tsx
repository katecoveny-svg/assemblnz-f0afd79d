'use client';

import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';
import { useDrag3D } from '../hooks/useDrag3D';

interface Props {
  initialPosition?: [number, number, number];
  reduced?: boolean;
  onMove?: (position: [number, number, number]) => void;
}

/**
 * The model core — a chrome-family iridescent sphere.
 * Draggable across the y=0 plane. Breathes on its own so it feels alive.
 */
export function ModelCore({ initialPosition = [0, 0.6, 0], reduced = false, onMove }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.6);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) {
      meshRef.current.rotation.set(0, 0, 0);
      return;
    }
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.25;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
    if (!drag.isDragging) {
      meshRef.current.position.y = drag.position[1] + Math.sin(t * 0.9) * 0.03;
    } else {
      meshRef.current.position.y = drag.position[1];
    }
    if (onMove) onMove(drag.position);
  });

  return (
    <group position={[drag.position[0], 0, drag.position[2]]}>
      <mesh
        ref={meshRef}
        position={[0, drag.position[1], 0]}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = drag.isDragging ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        {...drag.handlers}
      >
        <sphereGeometry args={[0.42, 96, 96]} />
        <meshPhysicalMaterial
          color="#F5F1E8"
          metalness={0.85}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
          iridescence={0.9}
          iridescenceIOR={1.35}
          iridescenceThicknessRange={[120, 640]}
          transmission={0.05}
          ior={1.5}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Shadow disc — a soft round shadow underneath, cheaper than shadow mapping. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.14 : 0.09} />
      </mesh>

      {/* Label — Space Mono uppercase, sits just below the part. */}
      <Text
        position={[0, -0.05, 0.62]}
        fontSize={0.11}
        color="#1A1918"
        anchorX="center"
        anchorY="top"
        letterSpacing={0.08}
        maxWidth={2}
      >
        {BUILD_AN_AGENT.parts.modelCore.label.toUpperCase()}
      </Text>
    </group>
  );
}
