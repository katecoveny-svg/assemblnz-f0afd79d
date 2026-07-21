'use client';

import { useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';
import { CHROME, CHROME_MATERIAL } from './chrome';
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
 * Memory — stacked glass cubes (canon: stacked cubes = memory). Two clear
 * volumes, the upper slightly rotated, gently breathing above the base.
 */
export function Memory({
  initialPosition = [-2.4, 0.55, -0.4],
  reduced = false,
  corePosition,
  dockAngle,
  onMove,
  onDock,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.55, {
    center: corePosition,
    angle: dockAngle,
    radius: 1.7,
    threshold: 1.6,
    onDock,
  });

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
          <boxGeometry args={[0.36, 0.36, 0.36]} />
          <meshPhysicalMaterial color={CHROME.memory} {...CHROME_MATERIAL} roughness={0.2} />
        </mesh>
        <mesh ref={topRef} position={[0, 0.38, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshPhysicalMaterial color={CHROME.memory} {...CHROME_MATERIAL} roughness={0.2} />
        </mesh>
      </group>

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

      <PartLabel text={BUILD_AN_AGENT.parts.memory.label} y={drag.position[1] + 0.52} />
    </group>
  );
}
