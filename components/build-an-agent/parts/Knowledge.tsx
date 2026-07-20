'use client';

import { useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';
import { useDrag3D } from '../hooks/useDrag3D';
import { PartLabel } from './PartLabel';

interface Props {
  initialPosition?: [number, number, number];
  reduced?: boolean;
  /** Live core position + this part's port angle — magnetic docking hub. */
  corePosition: [number, number, number];
  dockAngle: number;
  onMove?: (position: [number, number, number]) => void;
  onDock?: (docked: boolean) => void;
}

/**
 * Knowledge — a single frosted translucent cube (canon: translucent cube =
 * knowledge source). Larger and calmer than memory's stacked clear cubes.
 */
export function Knowledge({
  initialPosition = [-1.4, 0.55, 1.6],
  reduced = false,
  corePosition,
  dockAngle,
  onMove,
  onDock,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55, {
    center: corePosition,
    angle: dockAngle,
    radius: 1.7,
    threshold: 1.6,
    onDock,
  });

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.16;
    meshRef.current.rotation.x = Math.sin(t * 0.25) * 0.05;
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
        <boxGeometry args={[0.52, 0.52, 0.52]} />
        <meshPhysicalMaterial
          color="#F5F4EF"
          metalness={0.02}
          roughness={0.32}
          transmission={0.6}
          thickness={0.7}
          ior={1.4}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          envMapIntensity={0.9}
        />
      </mesh>

      {drag.docked && (
        <Line
          points={[
            [0, drag.position[1], 0],
            [corePosition[0] - drag.position[0], 0.6, corePosition[2] - drag.position[2]],
          ]}
          color="#7FA8A0"
          lineWidth={1.5}
          transparent
          opacity={0.85}
        />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial color="#1A1918" transparent opacity={drag.isDragging ? 0.12 : 0.08} />
      </mesh>

      <PartLabel text={BUILD_AN_AGENT.parts.connectors.label} />
    </group>
  );
}
