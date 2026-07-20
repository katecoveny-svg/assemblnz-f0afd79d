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
  speaking?: boolean;
  onMove?: (position: [number, number, number]) => void;
}

/**
 * The model core — a chrome-family iridescent sphere. Draggable across
 * the y=0 plane. Breathes on its own so the scene feels alive at rest.
 * When `speaking` is true (a real Claude answer is streaming below), the
 * sphere pulses faster + a warm halo appears around it.
 */
export function ModelCore({
  initialPosition = [0, 0.6, 0],
  reduced = false,
  speaking = false,
  onMove,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.6);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      if (reduced) {
        meshRef.current.rotation.set(0, 0, 0);
      } else {
        const spin = speaking ? 0.7 : 0.25;
        meshRef.current.rotation.y = t * spin;
        meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
      }
      if (!drag.isDragging && !reduced) {
        const bobAmp = speaking ? 0.08 : 0.03;
        const bobFreq = speaking ? 2.4 : 0.9;
        meshRef.current.position.y = drag.position[1] + Math.sin(t * bobFreq) * bobAmp;
      } else {
        meshRef.current.position.y = drag.position[1];
      }
      const scale = speaking && !reduced ? 1 + Math.sin(t * 3) * 0.04 : 1;
      meshRef.current.scale.setScalar(scale);
      if (onMove) onMove(drag.position);
    }
    if (haloRef.current) {
      const targetOpacity = speaking ? 0.35 + (Math.sin(t * 2.4) + 1) * 0.14 : 0;
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity += (targetOpacity - m.opacity) * 0.12;
    }
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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.14 : 0.09} />
      </mesh>

      {/* Speaking halo — warm champagne, faded in via useFrame while streaming. */}
      <mesh ref={haloRef} position={[0, drag.position[1], 0]}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshBasicMaterial
          color="#BFA37A"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.modelCore.label} />
    </group>
  );
}
