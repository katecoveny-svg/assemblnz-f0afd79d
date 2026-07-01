'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import type { Group } from 'three';

/**
 * Aeronaut hero — slow-rotating container-ship blueprint wireframe. A stack of
 * skinny boxes (containers) atop a long hull box, all wireframe, ink-navy.
 */
export function AeronautHero() {
  const ship = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (ship.current) {
      ship.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  const containers: Array<[number, number]> = [
    [-0.5, 0.15],
    [-0.15, 0.15],
    [0.2, 0.15],
    [0.55, 0.15],
    [-0.35, 0.4],
    [0.05, 0.4],
    [0.4, 0.4],
  ];

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#7bb0ff" />
      <group ref={ship}>
        {/* Hull */}
        <Box args={[1.8, 0.28, 0.5]} position={[0, -0.15, 0]}>
          <meshStandardMaterial
            color="#7bb0ff"
            wireframe
            emissive="#7bb0ff"
            emissiveIntensity={0.35}
          />
        </Box>
        {/* Bow slope hint */}
        <Box args={[0.25, 0.28, 0.5]} position={[0.95, -0.05, 0]} rotation={[0, 0, -0.35]}>
          <meshStandardMaterial color="#7bb0ff" wireframe />
        </Box>
        {/* Containers */}
        {containers.map(([x, y], i) => (
          <Box key={i} args={[0.28, 0.2, 0.32]} position={[x, y, 0]}>
            <meshStandardMaterial color="#8494ac" wireframe />
          </Box>
        ))}
        {/* Bridge */}
        <Box args={[0.22, 0.35, 0.4]} position={[-0.75, 0.25, 0]}>
          <meshStandardMaterial color="#e6ecf5" wireframe />
        </Box>
      </group>
    </group>
  );
}
