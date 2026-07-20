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
 * Voice — an upright matte-ceramic capsule that gently pulses as it "speaks".
 * Warm white ceramic distinguishes it from the chrome abilities capsule
 * (which lies horizontal); the pulse is the tell that this one talks.
 */
export function Voice({
  initialPosition = [1.4, 0.55, 1.6],
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
        <sphereGeometry args={[0.27, 64, 64]} />
        <meshPhysicalMaterial color={CHROME.voice} {...CHROME_MATERIAL} />
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

      <PartLabel text={BUILD_AN_AGENT.parts.prompt.label} y={drag.position[1] + 0.52} />
    </group>
  );
}
