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
 * Abilities — a horizontal chrome capsule (canon: chrome capsule = ability).
 * Brushed silver, precision-machined feel; slow roll on its long axis.
 */
export function Tools({
  initialPosition = [2.4, 0.5, -0.4],
  reduced = false,
  corePosition,
  dockAngle,
  onMove,
  onDock,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drag = useDrag3D(initialPosition, 0.5, {
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
    meshRef.current.rotation.x = t * 0.22;
    meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.12;
    if (onMove) onMove(drag.position);
  });

  return (
    <group position={[drag.position[0], 0, drag.position[2]]}>
      <mesh
        ref={meshRef}
        position={[0, drag.position[1], 0]}
        rotation={[0, 0, Math.PI / 2]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = drag.isDragging ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        {...drag.handlers}
      >
        <capsuleGeometry args={[0.17, 0.42, 12, 32]} />
        <meshPhysicalMaterial color={CHROME.abilities} {...CHROME_MATERIAL} />
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

      <PartLabel text={BUILD_AN_AGENT.parts.tools.label} y={drag.position[1] + 0.52} />
    </group>
  );
}
